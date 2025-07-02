/**
 * Verifica la configurazione di Stripe per entrambi gli ambienti
 */

interface ConfigCheck {
  variable: string;
  required: boolean;
  environment: "development" | "production" | "both";
  description: string;
}

const STRIPE_CONFIG_CHECKS: ConfigCheck[] = [
  // Stripe API Keys
  {
    variable: "STRIPE_SECRET_KEY_TEST",
    required: true,
    environment: "development",
    description: "Stripe test secret key for development",
  },
  {
    variable: "STRIPE_SECRET_KEY",
    required: true,
    environment: "production",
    description: "Stripe live secret key for production",
  },

  // Webhook Secrets
  {
    variable: "STRIPE_WEBHOOK_SECRET_TEST",
    required: true,
    environment: "development",
    description: "Stripe webhook secret for development",
  },
  {
    variable: "STRIPE_WEBHOOK_SECRET",
    required: true,
    environment: "production",
    description: "Stripe webhook secret for production",
  },

  // Base URLs
  {
    variable: "NEXT_PUBLIC_BASE_URL_TEST",
    required: false,
    environment: "development",
    description: "Base URL for development webhook routing",
  },
  {
    variable: "NEXT_PUBLIC_BASE_URL",
    required: true,
    environment: "both",
    description: "Base URL for the application",
  },

  // Supabase Configuration
  {
    variable: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    environment: "both",
    description: "Supabase project URL",
  },
  {
    variable: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    environment: "both",
    description: "Supabase service role key for server operations",
  },

  // Price IDs (Production)
  {
    variable: "STRIPE_PRO_PLAN_PRICE_ID",
    required: false,
    environment: "production",
    description: "Production price ID for Pro plan",
  },
  {
    variable: "STRIPE_ULTRA_PLAN_PRICE_ID",
    required: false,
    environment: "production",
    description: "Production price ID for Ultra plan",
  },
];

interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  environment: string;
}

export function verifyStripeConfig(): VerificationResult {
  const isDevelopment = process.env.NODE_ENV === "development";
  const environment = isDevelopment ? "development" : "production";

  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(
    `🔍 Verifying Stripe configuration for ${environment} environment...`
  );

  for (const check of STRIPE_CONFIG_CHECKS) {
    // Skip checks that don't apply to current environment
    if (check.environment !== "both" && check.environment !== environment) {
      continue;
    }

    const value = process.env[check.variable];

    if (!value) {
      if (check.required) {
        errors.push(
          `❌ Missing required environment variable: ${check.variable} (${check.description})`
        );
      } else {
        warnings.push(
          `⚠️ Optional environment variable not set: ${check.variable} (${check.description})`
        );
      }
    } else {
      console.log(`✅ ${check.variable}: configured`);

      // Additional validation for specific variables
      if (check.variable.includes("SECRET_KEY") && !value.startsWith("sk_")) {
        errors.push(
          `❌ Invalid format for ${check.variable}: should start with 'sk_'`
        );
      }

      if (
        check.variable.includes("WEBHOOK_SECRET") &&
        !value.startsWith("whsec_")
      ) {
        errors.push(
          `❌ Invalid format for ${check.variable}: should start with 'whsec_'`
        );
      }

      if (check.variable.includes("PRICE_ID") && !value.startsWith("price_")) {
        warnings.push(
          `⚠️ Unusual format for ${check.variable}: expected to start with 'price_'`
        );
      }
    }
  }

  // Validate that the correct Stripe key is being used
  try {
    const stripeKey = isDevelopment
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const isTestKey = stripeKey.includes("_test_");
      if (isDevelopment && !isTestKey) {
        warnings.push(
          `⚠️ Using production Stripe key in development environment`
        );
      }
      if (!isDevelopment && isTestKey) {
        errors.push(`❌ Using test Stripe key in production environment`);
      }
    }
  } catch (error) {
    warnings.push(`⚠️ Could not validate Stripe key format: ${error}`);
  }

  const success = errors.length === 0;

  // Print summary
  console.log("\n📊 Configuration Summary:");
  console.log(`Environment: ${environment}`);
  console.log(`Status: ${success ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log("\n🚨 Errors:");
    errors.forEach((error) => console.log(error));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    warnings.forEach((warning) => console.log(warning));
  }

  if (success) {
    console.log("\n🎉 Stripe configuration verification passed!");
  } else {
    console.log(
      "\n💥 Stripe configuration verification failed. Please fix the errors above."
    );
  }

  return {
    success,
    errors,
    warnings,
    environment,
  };
}

/**
 * Test the Stripe configuration by attempting to initialize the client
 */
export async function testStripeConnection(): Promise<boolean> {
  try {
    // Dynamic import to avoid issues if Stripe is not configured
    const stripe = (await import("./stripe")).default;

    // Simple test to verify the client works
    await stripe.customers.list({ limit: 1 });

    console.log("✅ Stripe connection test passed!");
    return true;
  } catch (error) {
    console.error("❌ Stripe connection test failed:", error);
    return false;
  }
}

/**
 * Run all verification checks
 */
export async function runFullVerification(): Promise<void> {
  console.log("🔍 Starting Stripe configuration verification...\n");

  const configResult = verifyStripeConfig();

  if (configResult.success) {
    console.log("\n🔌 Testing Stripe connection...");
    await testStripeConnection();
  }

  console.log("\n✨ Verification complete!");
}

// Allow running this script directly
if (require.main === module) {
  runFullVerification().catch(console.error);
}
