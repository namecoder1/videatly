import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/utils/stripe/stripe";

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();

  const supabase = await createClient();
  let user = null;

  // Recupera user da Supabase
  if (userId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = { ...data, id: userId, email: data.email };
  } else {
    const {
      data: { user: supaUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !supaUser) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = supaUser;
  }

  try {
    // Trova il customer Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const customer = customers.data[0];

    // Se l'azione è cancellare l'abbonamento
    if (action === "cancel_subscription") {
      // Trova l'abbonamento attivo del customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: "No active subscription found" },
          { status: 400 }
        );
      }

      const subscription = subscriptions.data[0];

      // Cancella l'abbonamento alla fine del periodo
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({ success: true });
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

    // Se non è una cancellazione, crea la sessione del portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${fullBaseUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Errore creazione portal session:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
