import { NextResponse } from "next/server";
import { constants, validateStripeConfig } from "@/constants";

export async function GET() {
  try {
    // Validate Stripe configuration in production
    const configValidation = validateStripeConfig();

    const priceIds = {
      basicIdeaBucket: constants.paymentLinks.basicIdeaBucket.priceId,
      standardIdeaBucket: constants.paymentLinks.standardIdeaBucket.priceId,
      premiumIdeaBucket: constants.paymentLinks.premiumIdeaBucket.priceId,
      basicScriptBucket: constants.paymentLinks.basicScriptBucket.priceId,
      standardScriptBucket: constants.paymentLinks.standardScriptBucket.priceId,
      premiumScriptBucket: constants.paymentLinks.premiumScriptBucket.priceId,
      proPlan: constants.paymentLinks.proPlan,
      ultraPlan: constants.paymentLinks.ultraPlan,
    };

    // Check for empty price IDs
    const emptyPriceIds = Object.entries(priceIds)
      .filter(([key, value]) => !value || value.trim() === "")
      .map(([key]) => key);

    if (emptyPriceIds.length > 0) {
      console.error("❌ Empty price IDs found:", emptyPriceIds);

      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error: "Stripe configuration incomplete",
            details: `Missing price IDs: ${emptyPriceIds.join(", ")}`,
            missingEnvVars: configValidation.missingVars,
          },
          { status: 500 }
        );
      }
    }

    console.log("Price IDs fetched:", priceIds);
    console.log("Configuration validation:", configValidation);

    return NextResponse.json(priceIds);
  } catch (error) {
    console.error("Error fetching price IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch price IDs" },
      { status: 500 }
    );
  }
}
