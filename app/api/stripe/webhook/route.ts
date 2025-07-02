import { NextRequest, NextResponse } from "next/server";
import stripe from "@/utils/stripe/stripe";
import { Stripe } from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/utils/resend/resend";
import PlanEmail from "@/emails/PlanEmail";
import { formatDate } from "@/lib/utils";

// Configuration with fallbacks
let endpointSecret: string;
let supabaseUrl: string;
let supabaseServiceRoleKey: string;

if (process.env.NODE_ENV === "development") {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST!;
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
} else {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

// Complete price ID mapping including all development and production IDs
const PRICE_ID_TO_PLAN: Record<string, string> = {
  // Production Price IDs (update these with your actual production price IDs)
  price_1RM5g3JIJDFQQRJ08tJCEcVM: "pro",
  price_1RM5gnJIJDFQQRJ0MpzocQBe: "ultra",

  // Development Price IDs
  price_1RayGcRXT8zipkHSQ6e58rEa: "pro",
  price_1RayHNRXT8zipkHSVsRWGFt9: "ultra",
  price_1RayI5RXT8zipkHSFVT9I6TH: "basic_idea",
  price_1RayIaRXT8zipkHSTH1UKr8F: "standard_idea",
  price_1RayJBRXT8zipkHSFepE4uaD: "premium_idea",
  price_1RayJsRXT8zipkHSFA8u267R: "basic_script",
  price_1RayKSRXT8zipkHSQz40B3GG: "standard_script",
  price_1RayL2RXT8zipkHSu2hE9uH8: "premium_script",
};

function getPlanFromPriceId(priceId: string): string {
  const plan = PRICE_ID_TO_PLAN[priceId];
  if (!plan) {
    console.warn(`Unknown price ID: ${priceId}`);
    return "unknown";
  }
  return plan;
}

// Robust Supabase client with service role
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);

// Retry utility with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Operation failed on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Max retries exceeded");
}

// Helper function to find user ID
async function findUserId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  metadata?: any
): Promise<string | null> {
  if (metadata?.user_id) {
    return metadata.user_id;
  }

  if (!customer) {
    return null;
  }

  let email = null;
  if (typeof customer === "string") {
    try {
      const customerObj = await stripe.customers.retrieve(customer);
      if (typeof customerObj !== "string" && !customerObj.deleted) {
        email = customerObj.email;
      }
    } catch (error) {
      console.error("Error retrieving customer:", error);
    }
  } else if (customer && !("deleted" in customer)) {
    email = customer.email;
  }

  if (email) {
    const { data: user } = await supabase
      .from("users")
      .select("auth_user_id")
      .eq("email", email)
      .single();
    return user?.auth_user_id || null;
  }

  return null;
}

// Subscription event handler
async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(
    `Handling subscription event: ${event.type} for subscription: ${subscription.id}`
  );

  const user_id = await findUserId(
    subscription.customer,
    subscription.metadata
  );
  if (!user_id) {
    console.error("User not found for subscription event", subscription.id);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price?.id || "";
  const plan = priceId ? getPlanFromPriceId(priceId) : "unknown";
  const currentPeriodStart = (subscription as any).current_period_start;
  const currentPeriodEnd = (subscription as any).current_period_end;
  const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;

  console.log("Subscription details:", {
    id: subscription.id,
    user_id,
    plan,
    status: subscription.status,
    cancelAtPeriodEnd,
  });

  try {
    await retryOperation(async () => {
      if (event.type === "customer.subscription.deleted") {
        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            subscription_renewal: false,
            pending_subscription: null,
          })
          .eq("auth_user_id", user_id);

        if (error) throw error;
        return;
      }

      // Handle subscription creation or update
      const updateData: any = {
        subscription: plan,
        subscription_status: subscription.status,
        subscription_start: new Date(currentPeriodStart * 1000).toISOString(),
        subscription_end: new Date(currentPeriodEnd * 1000).toISOString(),
        subscription_renewal: !cancelAtPeriodEnd,
        pending_subscription: null,
      };

      // Handle scheduled changes
      if (subscription.schedule) {
        const scheduleId =
          typeof subscription.schedule === "string"
            ? subscription.schedule
            : subscription.schedule.id;

        try {
          const schedule =
            await stripe.subscriptionSchedules.retrieve(scheduleId);
          if (schedule.phases && schedule.phases.length > 1) {
            const nextPrice = schedule.phases[1].items[0].price;
            const nextPriceId =
              typeof nextPrice === "string" ? nextPrice : nextPrice.id;
            const nextPlan = getPlanFromPriceId(nextPriceId);
            updateData.pending_subscription = nextPlan;
          }
        } catch (error) {
          console.error("Error retrieving subscription schedule:", error);
        }
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("auth_user_id", user_id);

      if (error) throw error;
    });

    console.log("Successfully updated user subscription");
  } catch (error) {
    console.error("Failed to update user subscription after retries:", error);
    throw error;
  }
}

// Invoice paid event handler
async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log(`Handling invoice.paid event: ${invoice.id}`);

  // Get subscription ID from invoice lines
  const subscriptionFromLine = invoice.lines?.data?.[0]?.subscription;
  const stripeSubscriptionId =
    typeof subscriptionFromLine === "string"
      ? subscriptionFromLine
      : subscriptionFromLine?.id || null;

  // Skip non-subscription invoices
  if (!stripeSubscriptionId) {
    console.log("Skipping non-subscription invoice");
    return;
  }

  const user_id = await findUserId(invoice.customer, invoice.metadata);
  if (!user_id) {
    console.error("User not found for invoice event", invoice.id);
    return;
  }

  // Check for existing invoice to avoid duplicates
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("stripe_invoice_id", invoice.id)
    .maybeSingle();

  if (existing) {
    console.log("Invoice already exists in database");
    return;
  }

  let plan = "unknown";
  let priceId = "";

  try {
    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const item = subscription.items.data[0];
    if (item?.price?.id) {
      priceId = item.price.id;
      plan = getPlanFromPriceId(priceId);
    }
  } catch (error) {
    console.error("Error fetching subscription details:", error);
  }

  try {
    await retryOperation(async () => {
      const invoiceData = {
        auth_user_id: user_id,
        email: invoice.customer_email,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        product: plan,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: null, // Invoice payment intents are handled differently
        stripe_customer_id:
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id || null,
        status: invoice.status,
        created_at: new Date().toISOString(),
        metadata: {
          type: "subscription",
          price_id: priceId,
          invoice_number: invoice.number,
          invoice_pdf: invoice.invoice_pdf,
          hosted_invoice_url: invoice.hosted_invoice_url,
        },
      };

      const { error } = await supabase.from("invoices").insert([invoiceData]);

      if (error) throw error;
    });

    // Send email notification
    if (invoice.customer_email && invoice.hosted_invoice_url) {
      try {
        const endDate = new Date(
          invoice.lines.data[0].period.end * 1000
        ).toISOString();

        await sendEmail({
          to: invoice.customer_email,
          subject: `Your ${plan} plan invoice is ready!`,
          react: PlanEmail({
            plan,
            invoiceUrl: invoice.hosted_invoice_url,
            price: invoice.amount_paid,
            endDate: formatDate(endDate, "normal"),
          }),
        });
      } catch (emailError) {
        console.error("Error sending invoice email:", emailError);
      }
    }

    console.log("Successfully processed invoice");
  } catch (error) {
    console.error("Failed to process invoice after retries:", error);
    throw error;
  }
}

// One-off payment handler
async function handleOneOffPayment(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`Handling one-off payment: ${session.id}`);

  if (
    !session.metadata?.tokens ||
    !session.metadata?.tool ||
    !session.metadata?.user_id
  ) {
    console.error(
      "Missing required metadata for one-off payment:",
      session.metadata
    );
    return;
  }

  const { user_id, tokens, tool } = session.metadata;
  const tokensToAdd = parseInt(tokens);

  try {
    await retryOperation(async () => {
      // Get or create tokens record
      const { data: existingTokens, error: tokensError } = await supabase
        .from("tokens")
        .select("*")
        .eq("user_id", user_id)
        .eq("tool", tool)
        .single();

      if (tokensError && tokensError.code !== "PGRST116") {
        throw tokensError;
      }

      if (existingTokens) {
        const { error: updateError } = await supabase
          .from("tokens")
          .update({
            paid_tokens: (existingTokens.paid_tokens || 0) + tokensToAdd,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id)
          .eq("tool", tool);

        if (updateError) throw updateError;
      } else {
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

        if (insertError) throw insertError;
      }

      // Create invoice record
      const invoiceData = {
        auth_user_id: user_id,
        email: session.customer_email,
        amount: session.amount_total || 0,
        currency: session.currency,
        product: tool,
        stripe_subscription_id: null,
        stripe_invoice_id: null,
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

      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert([invoiceData]);

      if (invoiceError) throw invoiceError;
    });

    console.log("Successfully processed one-off payment");
  } catch (error) {
    console.error("Failed to process one-off payment after retries:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log("=== STRIPE WEBHOOK RECEIVED ===");

  let rawBody: string;
  try {
    rawBody = await req.text();
    console.log("Raw body length:", rawBody.length);
  } catch (err) {
    console.error("Error reading raw body:", err);
    return NextResponse.json(
      { error: "Error reading raw body" },
      { status: 400 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing Stripe signature header");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  console.log(
    "Webhook secret (first 8 chars):",
    endpointSecret?.slice(0, 8) + "..."
  );

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("Successfully verified Stripe event:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  try {
    // Handle different event types directly
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event);
        break;

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        // Determine if it's a subscription or one-off payment
        if (session.mode === "subscription") {
          // Let subscription events handle this
          console.log(
            "Subscription checkout completed, will be handled by subscription events"
          );
        } else {
          await handleOneOffPayment(event);
        }
        break;

      case "payment_intent.succeeded":
      case "charge.succeeded":
        // These are typically handled by checkout.session.completed
        console.log(`Received ${event.type}, no action needed`);
        break;

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    console.log("=== WEBHOOK PROCESSED SUCCESSFULLY ===");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("=== WEBHOOK PROCESSING FAILED ===");
    console.error("Event type:", event.type);
    console.error("Event ID:", event.id);
    console.error("Error:", error);

    // Return 500 so Stripe will retry
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
