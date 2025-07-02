import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/utils/stripe/stripe";

export async function POST(req: NextRequest) {
  console.log("=== CHECKOUT SESSION CREATION START ===");

  let requestData;
  try {
    requestData = await req.json();
    console.log("Request data received:", requestData);
  } catch (err) {
    console.error("Failed to parse request body:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { priceId, tokens, tool, userId, plan } = requestData;

  console.log("Parsed parameters:", {
    priceId: priceId || "NOT_PROVIDED",
    tokens: tokens || "NOT_PROVIDED",
    tool: tool || "NOT_PROVIDED",
    userId: userId || "NOT_PROVIDED",
    plan: plan || "NOT_PROVIDED",
  });

  const supabase = await createClient();
  let user = null;

  console.log("Starting user retrieval process...");

  // Recupera user da Supabase se non passato direttamente
  if (userId) {
    console.log("Fetching user by userId:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    console.log("User query result:", {
      data: data ? "USER_FOUND" : "USER_NOT_FOUND",
      error,
    });

    if (error || !data) {
      console.error("User not found in database:", error);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = { ...data, id: userId, email: data.email };
    console.log("User retrieved from DB:", { id: user.id, email: user.email });
  } else {
    console.log("Fetching user from auth session...");
    const {
      data: { user: supaUser },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Auth user result:", {
      user: supaUser ? "AUTH_USER_FOUND" : "AUTH_USER_NOT_FOUND",
      error: userError,
    });

    if (userError || !supaUser) {
      console.error("User not found in auth session:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = supaUser;
    console.log("User retrieved from auth:", {
      id: user.id,
      email: user.email,
    });
  }

  // Distingui tra acquisto token e subscription
  const isSubscription = !tokens && !tool && !!plan;
  console.log(
    "Transaction type:",
    isSubscription ? "SUBSCRIPTION" : "TOKEN_PURCHASE"
  );

  // Validation
  console.log("Starting validation checks...");

  if (!user || !priceId) {
    console.error("Missing required data:", {
      user: user ? "PRESENT" : "MISSING",
      priceId: priceId ? "PRESENT" : "MISSING",
    });
    return NextResponse.json(
      { error: "Dati mancanti per la creazione della sessione Stripe" },
      { status: 400 }
    );
  }

  if (!isSubscription && (!tokens || !tool)) {
    console.error("Missing token purchase data:", {
      tokens: tokens ? "PRESENT" : "MISSING",
      tool: tool ? "PRESENT" : "MISSING",
    });
    return NextResponse.json(
      { error: "Dati mancanti per la creazione della sessione Stripe (token)" },
      { status: 400 }
    );
  }

  console.log("Validation passed. Starting Stripe operations...");

  try {
    // First, create or retrieve a customer
    console.log("Looking for existing Stripe customer with email:", user.email);
    let customer;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
      console.log("Found existing customer:", customer.id);
    } else {
      console.log("Creating new Stripe customer...");
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      console.log("Created new customer:", customer.id);
    }

    // Per acquisti di token, verifica se esiste già una sessione attiva
    if (!isSubscription) {
      console.log("Checking for active token purchase sessions...");
      const activeSessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        status: "open",
        limit: 1,
      });

      if (activeSessions.data.length > 0) {
        console.log(
          "Found active session, returning existing URL:",
          activeSessions.data[0].id
        );
        // Se esiste una sessione attiva, restituisci quella invece di crearne una nuova
        return NextResponse.json({ url: activeSessions.data[0].url });
      }
      console.log(
        "No active sessions found, proceeding with new session creation"
      );
    }

    // Ensure base URL has proper scheme
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    let fullBaseUrl = baseUrl;

    if (
      baseUrl &&
      !baseUrl.startsWith("http://") &&
      !baseUrl.startsWith("https://")
    ) {
      fullBaseUrl = `https://${baseUrl}`;
    }

    if (!fullBaseUrl) {
      // Fallback to request origin if NEXT_PUBLIC_BASE_URL is not set
      const origin = req.headers.get("origin") || req.headers.get("host");
      fullBaseUrl = origin?.startsWith("http") ? origin : `https://${origin}`;
    }

    console.log("Creating checkout session with parameters:", {
      mode: isSubscription ? "subscription" : "payment",
      customer: customer.id,
      priceId,
      baseUrl: fullBaseUrl,
      metadata: isSubscription
        ? { plan }
        : { tokens: tokens?.toString(), tool, price_id: priceId },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${fullBaseUrl}/billing?success=1`,
      cancel_url: `${fullBaseUrl}/billing?canceled=1`,
      metadata: {
        user_id: user.id,
        ...(isSubscription
          ? { plan }
          : {
              tokens: tokens?.toString(),
              tool,
              price_id: priceId,
            }),
      },
      // Aggiungi idempotency key per pagamenti token
      ...(isSubscription
        ? {}
        : {
            payment_intent_data: {
              metadata: {
                idempotency_key: `${user.id}_${tool}_${tokens}_${Date.now()}`,
              },
            },
          }),
    });

    console.log("Created checkout session:", {
      session_id: session.id,
      mode: session.mode,
      metadata: session.metadata,
      customer: session.customer,
      payment_intent: session.payment_intent,
      url: session.url,
    });

    console.log("=== CHECKOUT SESSION CREATION SUCCESS ===");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("=== CHECKOUT SESSION CREATION ERROR ===");
    console.error("Errore creazione sessione Stripe:", err);
    console.error("Error details:", {
      message: (err as Error).message,
      stack: (err as Error).stack,
      name: (err as Error).name,
    });
    console.error("Request context:", {
      priceId,
      tokens,
      tool,
      userId,
      plan,
      isSubscription,
      userEmail: user?.email,
    });
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
