import { NextRequest, NextResponse } from "next/server";
import stripe from "@/utils/stripe/stripe";
import { Stripe } from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let endpointSecret: string;
let supabaseUrl: string;
let supabaseServiceRoleKey: string;

if (process.env.NODE_ENV === "development") {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST!;
  supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL_TEST ||
    process.env.NEXT_PUBLIC_SUPABASE_URL!;
  supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
} else {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

// Usa la service_role key per il client Supabase solo qui!
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  console.log("--- Stripe One-Off Payment Webhook Received ---");
  let rawBody;
  try {
    rawBody = await req.text();
    console.log("Raw body length:", rawBody.length);
  } catch (err) {
    console.error("Errore lettura raw body:", err);
    return NextResponse.json(
      { error: "Errore lettura raw body" },
      { status: 400 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  console.log("Webhook secret (inizio):", endpointSecret?.slice(0, 8) + "...");
  console.log("Stripe signature header:", sig);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
    console.log("Evento Stripe ricevuto:", event.type);
  } catch (err) {
    console.error("Errore firma Stripe:", err);
    console.error("Raw body:", rawBody);
    console.error("Signature:", sig);
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  // Helper function to process tokens and create invoice
  async function processPayment(
    user_id: string,
    tokens: string,
    tool: string,
    session: Stripe.Checkout.Session
  ) {
    console.log("Processing payment:", {
      user_id,
      tokens,
      tool,
      session_id: session.id,
    });

    // Recupera l'email se non presente nel session
    let email = session.customer_email;
    if (!email) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("auth_user_id", user_id)
        .single();
      if (userError) {
        console.error("Error fetching user email:", userError);
      } else {
        email = user.email;
      }
    }

    // First, check if we already have a tokens record for this user and tool
    const { data: existingTokens, error: tokensError } = await supabase
      .from("tokens")
      .select("*")
      .eq("user_id", user_id)
      .eq("tool", tool)
      .single();

    if (tokensError && tokensError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking existing tokens:", tokensError);
      return;
    }

    const tokensToAdd = parseInt(tokens);

    if (existingTokens) {
      // Update existing tokens record
      console.log("Updating existing tokens record:", {
        current_paid_tokens: existingTokens.paid_tokens,
        tokens_to_add: tokensToAdd,
      });

      const { error: updateError } = await supabase
        .from("tokens")
        .update({
          paid_tokens: (existingTokens.paid_tokens || 0) + tokensToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("tool", tool);

      if (updateError) {
        console.error("Error updating tokens:", updateError);
        return;
      }
    } else {
      // Create new tokens record
      console.log("Creating new tokens record");
      const { error: insertError } = await supabase.from("tokens").insert([
        {
          user_id: user_id,
          tool: tool,
          base_tokens: 0,
          paid_tokens: tokensToAdd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Error inserting tokens:", insertError);
        return;
      }
    }

    // Create invoice record
    const invoiceData = {
      auth_user_id: user_id,
      email: email,
      amount: session.amount_total || 0,
      currency: session.currency,
      product: tool,
      stripe_subscription_id: null,
      stripe_invoice_id: null, // This is a checkout session, not an invoice
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      stripe_id: session.id,
      status: "paid",
      created_at: new Date().toISOString(),
      metadata: {
        type: "one_off",
        tokens: tokens,
        tool: tool,
        session_id: session.id,
      },
    };

    console.log("Creating invoice record:", invoiceData);
    const { error: invoiceError } = await supabase
      .from("invoices")
      .insert([invoiceData]);

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return;
    }

    console.log("Successfully processed payment and updated records");
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Processing completed checkout session:", {
      session_id: session.id,
      metadata: session.metadata,
      amount_total: session.amount_total,
      currency: session.currency,
    });

    if (
      !session.metadata?.tokens ||
      !session.metadata?.tool ||
      !session.metadata?.user_id
    ) {
      console.error("Missing required metadata:", session.metadata);
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    await processPayment(
      session.metadata.user_id,
      session.metadata.tokens,
      session.metadata.tool,
      session
    );

    return NextResponse.json({ received: true });
  }

  // Handle payment_intent.succeeded event as backup
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log("Processing succeeded payment intent:", {
      payment_intent_id: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    // Try to get the session from the payment intent
    const sessionId = paymentIntent.metadata?.checkout_session_id;
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (
          !session.metadata?.tokens ||
          !session.metadata?.tool ||
          !session.metadata?.user_id
        ) {
          console.error(
            "Missing required metadata in session:",
            session.metadata
          );
          return NextResponse.json(
            { error: "Missing required metadata" },
            { status: 400 }
          );
        }

        await processPayment(
          session.metadata.user_id,
          session.metadata.tokens,
          session.metadata.tool,
          session
        );
      } catch (err) {
        console.error("Error retrieving session:", err);
        return NextResponse.json(
          { error: "Error retrieving session" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  }

  // Ignore other events
  console.log("Ignoring event:", event.type);
  return NextResponse.json({ received: true });
}
