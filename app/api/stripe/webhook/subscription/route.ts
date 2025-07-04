import { NextRequest, NextResponse } from "next/server";
import stripe from "@/utils/stripe/stripe";
import { Stripe } from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/utils/resend/resend";
import PlanEmail from "@/emails/PlanEmail";
import { formatDate } from "@/lib/utils";

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

// Mappa priceId -> nome piano (aggiornata con tutti i price ID)
const PRICE_ID_TO_PLAN: Record<string, string> = {
  // Production Price IDs
  price_1RM5g3JIJDFQQRJ08tJCEcVM: "pro",
  price_1RM5gnJIJDFQQRJ0MpzocQBe: "ultra",

  // Development Price IDs (from constants.ts)
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

// Usa la service_role key per il client Supabase solo qui!
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  console.log("--- Stripe Subscription Webhook Received ---");
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

  // Handle subscription events
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    // Trova user_id: preferisci metadata, fallback a customer email
    let user_id = subscription.metadata?.user_id;
    let email = null;
    if (!user_id && subscription.customer) {
      try {
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        if (typeof customer !== "string") {
          email = (customer as Stripe.Customer).email || null;
        }
      } catch {}
    }
    if (!user_id && email) {
      const { data: user } = await supabase
        .from("users")
        .select("auth_user_id")
        .eq("email", email)
        .single();
      user_id = user?.auth_user_id;
    }
    if (!user_id) {
      console.error("User not found for subscription event", subscription.id);
      return NextResponse.json({ received: true });
    }

    // --- Stripe type workaround: access period fields via 'as any' ---
    const item = subscription.items.data[0];
    const priceId =
      item && (item as any).price && typeof (item as any).price.id === "string"
        ? (item as any).price.id
        : "";
    const plan = priceId ? getPlanFromPriceId(priceId) : "unknown";
    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;
    const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;

    console.log("Stripe webhook event:", event.type);
    console.log(
      "Stripe subscription object:",
      JSON.stringify(subscription, null, 2)
    );
    console.log("Derived plan:", plan);
    console.log("cancelAtPeriodEnd:", cancelAtPeriodEnd);

    // Recupera lo stato attuale dell'utente
    const { data: currentUser } = await supabase
      .from("users")
      .select("subscription")
      .eq("auth_user_id", user_id)
      .single();

    // Se l'abbonamento è stato cancellato
    if (event.type === "customer.subscription.deleted") {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: "canceled",
          subscription_renewal: false,
          pending_subscription: null,
          // Non modifichiamo subscription qui, verrà fatto dal job programmato
        })
        .eq("auth_user_id", user_id);
      if (updateError) {
        console.error("Errore update user subscription:", updateError);
      }
      return NextResponse.json({ received: true });
    }

    // Se è un downgrade programmato (piano futuro diverso da quello attuale)
    if (
      event.type === "customer.subscription.updated" &&
      cancelAtPeriodEnd &&
      currentUser &&
      plan !== currentUser.subscription
    ) {
      let nextPlan = plan;
      if (subscription.schedule) {
        // Recupera la schedule e trova il prossimo priceId
        const scheduleId =
          typeof subscription.schedule === "string"
            ? subscription.schedule
            : subscription.schedule.id;
        const schedule =
          await stripe.subscriptionSchedules.retrieve(scheduleId);
        if (schedule.phases && schedule.phases.length > 1) {
          const nextPrice = schedule.phases[1].items[0].price;
          const nextPriceId =
            typeof nextPrice === "string" ? nextPrice : nextPrice.id;
          nextPlan = getPlanFromPriceId(nextPriceId);
        }
      }
      console.log("Updating pending_subscription to:", nextPlan);
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: subscription.status,
          subscription_end:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
          subscription_renewal: false,
          pending_subscription: nextPlan,
        })
        .eq("auth_user_id", user_id);
      if (updateError) {
        console.error("Errore update user subscription:", updateError);
      }
      return NextResponse.json({ received: true });
    }

    // Se viene solo cancellato il rinnovo automatico (ma il piano non cambia)
    if (
      event.type === "customer.subscription.updated" &&
      cancelAtPeriodEnd &&
      currentUser &&
      plan === currentUser.subscription
    ) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: subscription.status,
          subscription_end:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
          subscription_renewal: false,
          pending_subscription: null,
        })
        .eq("auth_user_id", user_id);
      if (updateError) {
        console.error("Errore update user subscription:", updateError);
      }
      return NextResponse.json({ received: true });
    }

    // Se la subscription ha una schedule con più fasi, aggiorna pending_subscription
    if (
      event.type === "customer.subscription.updated" &&
      subscription.schedule
    ) {
      const scheduleId =
        typeof subscription.schedule === "string"
          ? subscription.schedule
          : subscription.schedule.id;
      const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
      if (schedule.phases && schedule.phases.length > 1) {
        const nextPrice = schedule.phases[1].items[0].price;
        const nextPriceId =
          typeof nextPrice === "string" ? nextPrice : nextPrice.id;
        const nextPlan = getPlanFromPriceId(nextPriceId);
        console.log(
          "Updating pending_subscription to:",
          nextPlan,
          "via schedule"
        );
        const updateFields: any = {
          pending_subscription: nextPlan,
          subscription_status: subscription.status,
          subscription_end:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
        };
        // Se il prossimo piano è free, disattiva il rinnovo, altrimenti lascialo attivo
        if (nextPlan === "free") {
          updateFields.subscription_renewal = false;
        } else {
          updateFields.subscription_renewal = true;
        }
        const { error: updateError } = await supabase
          .from("users")
          .update(updateFields)
          .eq("auth_user_id", user_id);
        if (updateError) {
          console.error("Errore update user subscription:", updateError);
        }
        return NextResponse.json({ received: true });
      }
    }

    // Se viene solo cancellato il rinnovo automatico (ma il piano non cambia e non c'è schedule)
    if (
      event.type === "customer.subscription.updated" &&
      cancelAtPeriodEnd &&
      !subscription.schedule
    ) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: subscription.status,
          subscription_end:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
          subscription_renewal: false,
          pending_subscription: null,
        })
        .eq("auth_user_id", user_id);
      if (updateError) {
        console.error("Errore update user subscription:", updateError);
      }
      return NextResponse.json({ received: true });
    }

    // Per tutti gli altri casi (creazione)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription: plan,
        subscription_status: subscription.status,
        subscription_start:
          typeof currentPeriodStart === "number"
            ? new Date(currentPeriodStart * 1000).toISOString()
            : null,
        subscription_end:
          typeof currentPeriodEnd === "number"
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
        subscription_renewal:
          typeof cancelAtPeriodEnd === "boolean" ? !cancelAtPeriodEnd : null,
        pending_subscription: null,
      })
      .eq("auth_user_id", user_id);
    if (updateError) {
      console.error("Errore update user subscription:", updateError);
    }

    return NextResponse.json({ received: true });
  }

  // --- INVOICE PAID EVENTS FOR SUBSCRIPTIONS ---
  if (event.type === "invoice.paid") {
    console.log("Processing invoice.paid event:", event.id);
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId =
      typeof (invoice as any).subscription === "string"
        ? (invoice as any).subscription
        : null;

    console.log("Invoice details:", {
      id: invoice.id,
      subscription: stripeSubscriptionId,
      customer: invoice.customer,
      amount: invoice.amount_paid,
      status: invoice.status,
    });

    // Skip if not a subscription invoice
    if (!stripeSubscriptionId) {
      console.log("Skipping non-subscription invoice");
      return NextResponse.json({ received: true });
    }

    // Trova user_id: preferisci metadata, fallback a customer email
    let user_id = invoice.metadata?.user_id;
    let email = invoice.customer_email;
    let customer_id = null;

    if (!user_id && invoice.customer) {
      try {
        const customer = await stripe.customers.retrieve(
          invoice.customer as string
        );
        if (typeof customer !== "string") {
          email = (customer as Stripe.Customer).email || null;
          customer_id = (customer as Stripe.Customer).id;
        }
      } catch {}
    }
    if (!user_id && email) {
      const { data: user } = await supabase
        .from("users")
        .select("auth_user_id")
        .eq("email", email)
        .single();
      user_id = user?.auth_user_id;
    }
    if (!user_id) {
      console.error("User not found for invoice event", invoice.id);
      return NextResponse.json({ received: true });
    }

    // Idempotenza: non inserire due volte la stessa invoice
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("stripe_invoice_id", invoice.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true });
    }

    let plan = "unknown";
    let priceId: string = "";

    // Recupera i dettagli dalla subscription
    try {
      const subscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const item = subscription.items.data[0];
      if (
        item &&
        (item as any).price &&
        typeof (item as any).price.id === "string"
      ) {
        priceId = (item as any).price.id;
        plan = getPlanFromPriceId(priceId);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }

    // Crea l'invoice nel database
    const invoiceData = {
      auth_user_id: user_id,
      email,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      product: plan,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id:
        typeof (invoice as any).payment_intent === "string"
          ? (invoice as any).payment_intent
          : null,
      stripe_customer_id: customer_id || (invoice.customer as string),
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
    console.log("Inserting subscription invoice:", invoiceData);
    const { error: insertError } = await supabase
      .from("invoices")
      .insert([invoiceData]);
    if (insertError) {
      console.error("Errore insert subscription invoice:", insertError);
    }

    // Send email with invoice link
    if (email && invoice.hosted_invoice_url) {
      try {
        const endDate = new Date(
          invoice.lines.data[0].period.end * 1000
        ).toISOString();

        await sendEmail({
          to: email,
          subject: `Your ${plan} plan invoice is ready!`,
          react: PlanEmail({
            plan,
            invoiceUrl: invoice.hosted_invoice_url,
            price: invoice.amount_paid,
            endDate: formatDate(endDate, "full"),
          }) as React.ReactElement,
        });

        console.log(`[EMAIL] Invoice email sent successfully to ${email}`);
      } catch (emailError) {
        console.error("Error sending invoice email:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  }

  // --- PAYMENT FAILURE EVENTS ---
  if (event.type === "invoice.payment_failed") {
    console.log("Processing invoice.payment_failed event:", event.id);
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubscriptionId =
      typeof (invoice as any).subscription === "string"
        ? (invoice as any).subscription
        : null;

    // Skip if not a subscription invoice
    if (!stripeSubscriptionId) {
      console.log("Skipping non-subscription invoice");
      return NextResponse.json({ received: true });
    }

    // Trova user_id: preferisci metadata, fallback a customer email
    let user_id = invoice.metadata?.user_id;
    let email = invoice.customer_email;

    if (!user_id && invoice.customer) {
      try {
        const customer = await stripe.customers.retrieve(
          invoice.customer as string
        );
        if (typeof customer !== "string") {
          email = (customer as Stripe.Customer).email || null;
        }
      } catch {}
    }
    if (!user_id && email) {
      const { data: user } = await supabase
        .from("users")
        .select("auth_user_id")
        .eq("email", email)
        .single();
      user_id = user?.auth_user_id;
    }
    if (!user_id) {
      console.error("User not found for invoice event", invoice.id);
      return NextResponse.json({ received: true });
    }

    // Aggiorna lo stato dell'abbonamento
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_status: "payment_failed",
        subscription_renewal: false,
      })
      .eq("auth_user_id", user_id);

    if (updateError) {
      console.error("Errore update user subscription status:", updateError);
    }

    // Crea una notifica per l'utente
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          auth_user_id: user_id,
          type: "payment_failed",
          title: "Payment Failed",
          message:
            "Your subscription payment has failed. Please update your payment method to continue using the service.",
          created_at: new Date().toISOString(),
          read: false,
        },
      ]);

    if (notificationError) {
      console.error("Errore creazione notifica:", notificationError);
    }

    return NextResponse.json({ received: true });
  }

  // --- Altri eventi: logga e ignora ---
  console.log("Evento Stripe non gestito:", event.type);
  return NextResponse.json({ received: true });
}
