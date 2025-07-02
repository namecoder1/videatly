import { NextResponse } from "next/server";
import { constants } from "@/constants";

export async function GET() {
  try {
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

    console.log("Price IDs fetched:", priceIds);

    return NextResponse.json(priceIds);
  } catch (error) {
    console.error("Error fetching price IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch price IDs" },
      { status: 500 }
    );
  }
}
