import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verifica autenticazione debug
  const url = new URL(req.url);
  const debugKey = url.searchParams.get("debug_key");

  if (!debugKey || debugKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = process.env.NODE_ENV;

  // Configurazione attesa per ogni ambiente
  const expectedConfig = {
    development: {
      stripeSecretKey: "STRIPE_SECRET_KEY_TEST",
      stripeWebhookSecret: "STRIPE_WEBHOOK_SECRET_TEST",
      requiredPriceIds: [
        "STRIPE_PRO_PLAN_PRICE_ID",
        "STRIPE_ULTRA_PLAN_PRICE_ID",
        "STRIPE_BASIC_IDEA_BUCKET_PRICE_ID",
        "STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID",
        "STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID",
        "STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID",
        "STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID",
        "STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID",
      ],
    },
    production: {
      stripeSecretKey: "STRIPE_SECRET_KEY",
      stripeWebhookSecret: "STRIPE_WEBHOOK_SECRET",
      requiredPriceIds: [
        "STRIPE_PRO_PLAN_PRICE_ID",
        "STRIPE_ULTRA_PLAN_PRICE_ID",
        "STRIPE_BASIC_IDEA_BUCKET_PRICE_ID",
        "STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID",
        "STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID",
        "STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID",
        "STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID",
        "STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID",
      ],
    },
  };

  const config = expectedConfig[env as keyof typeof expectedConfig];
  if (!config) {
    return NextResponse.json(
      {
        error: "Unknown environment",
        environment: env,
      },
      { status: 400 }
    );
  }

  const report = {
    environment: env,
    timestamp: new Date().toISOString(),
    stripe: {
      secretKey: {
        configured: !!process.env[config.stripeSecretKey],
        key: config.stripeSecretKey,
        value: process.env[config.stripeSecretKey]
          ? `${process.env[config.stripeSecretKey]?.slice(0, 8)}...`
          : "NOT_SET",
      },
      webhookSecret: {
        configured: !!process.env[config.stripeWebhookSecret],
        key: config.stripeWebhookSecret,
        value: process.env[config.stripeWebhookSecret]
          ? `${process.env[config.stripeWebhookSecret]?.slice(0, 8)}...`
          : "NOT_SET",
      },
    },
    priceIds: config.requiredPriceIds.map((priceIdKey) => ({
      key: priceIdKey,
      configured: !!process.env[priceIdKey],
      value: process.env[priceIdKey] || "NOT_SET",
    })),
    supabase: {
      url: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)}...`
          : "NOT_SET",
      },
      serviceRoleKey: {
        configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? `${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8)}...`
          : "NOT_SET",
      },
    },
    baseUrl: {
      configured: !!process.env.NEXT_PUBLIC_BASE_URL,
      value: process.env.NEXT_PUBLIC_BASE_URL || "NOT_SET",
    },
  };

  // Calcola lo stato generale
  const allStripeConfigured =
    report.stripe.secretKey.configured &&
    report.stripe.webhookSecret.configured;
  const allPriceIdsConfigured = report.priceIds.every((p) => p.configured);
  const allSupabaseConfigured =
    report.supabase.url.configured && report.supabase.serviceRoleKey.configured;

  const overall = {
    status:
      allStripeConfigured && allPriceIdsConfigured && allSupabaseConfigured
        ? "READY"
        : "MISSING_CONFIG",
    stripe: allStripeConfigured ? "OK" : "MISSING",
    priceIds: allPriceIdsConfigured ? "OK" : "MISSING",
    supabase: allSupabaseConfigured ? "OK" : "MISSING",
    missingConfigs: [
      ...(!allStripeConfigured ? ["Stripe credentials"] : []),
      ...(!allPriceIdsConfigured ? ["Price IDs"] : []),
      ...(!allSupabaseConfigured ? ["Supabase credentials"] : []),
    ],
  };

  return NextResponse.json({
    overall,
    details: report,
  });
}
