import { NextRequest, NextResponse } from "next/server";
import { constants } from "@/constants";

export async function GET(req: NextRequest) {
  // Solo per admin/debug in produzione
  const debugKey = req.nextUrl.searchParams.get("debug_key");
  if (debugKey !== process.env.NEXT_PUBLIC_CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = {
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    stripeConfig: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasTestSecretKey: !!process.env.STRIPE_SECRET_KEY_TEST,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasTestWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET_TEST,
    },
    priceIds: {
      proPlan: {
        value: constants.paymentLinks.proPlan,
        hasEnvVar: !!process.env.STRIPE_PRO_PLAN_PRICE_ID,
        envValue: process.env.STRIPE_PRO_PLAN_PRICE_ID || "NOT_SET",
      },
      ultraPlan: {
        value: constants.paymentLinks.ultraPlan,
        hasEnvVar: !!process.env.STRIPE_ULTRA_PLAN_PRICE_ID,
        envValue: process.env.STRIPE_ULTRA_PLAN_PRICE_ID || "NOT_SET",
      },
      basicIdeaBucket: {
        value: constants.paymentLinks.basicIdeaBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_BASIC_IDEA_BUCKET_PRICE_ID,
        envValue: process.env.STRIPE_BASIC_IDEA_BUCKET_PRICE_ID || "NOT_SET",
      },
      standardIdeaBucket: {
        value: constants.paymentLinks.standardIdeaBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID,
        envValue: process.env.STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID || "NOT_SET",
      },
      premiumIdeaBucket: {
        value: constants.paymentLinks.premiumIdeaBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID,
        envValue: process.env.STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID || "NOT_SET",
      },
      basicScriptBucket: {
        value: constants.paymentLinks.basicScriptBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID,
        envValue: process.env.STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID || "NOT_SET",
      },
      standardScriptBucket: {
        value: constants.paymentLinks.standardScriptBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID,
        envValue:
          process.env.STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID || "NOT_SET",
      },
      premiumScriptBucket: {
        value: constants.paymentLinks.premiumScriptBucket.priceId,
        hasEnvVar: !!process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID,
        envValue:
          process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID || "NOT_SET",
      },
    },
    issues: [] as string[],
  };

  // Identifica problemi
  if (process.env.NODE_ENV !== "development") {
    if (!process.env.STRIPE_SECRET_KEY) {
      config.issues.push("Missing STRIPE_SECRET_KEY in production");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      config.issues.push("Missing STRIPE_WEBHOOK_SECRET in production");
    }

    // Controlla price IDs vuoti
    Object.entries(config.priceIds).forEach(([key, priceConfig]) => {
      if (!priceConfig.value || priceConfig.value === "") {
        config.issues.push(`Empty price ID for ${key}`);
      }
    });
  }

  return NextResponse.json(config);
}
