#!/usr/bin/env node

/**
 * Script di test per verificare la configurazione Stripe
 * Uso: node scripts/test-stripe-config.js [environment]
 */

const https = require("https");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testConfiguration(baseUrl, debugKey) {
  console.log("🔍 Testing Stripe configuration...\n");

  try {
    const url = `${baseUrl}/api/stripe/debug-config?debug_key=${debugKey}`;
    console.log(`Making request to: ${url}`);

    const response = await makeRequest(url);

    if (response.status === 200) {
      const config = response.data;

      console.log("✅ Configuration check successful!\n");
      console.log("📊 Overall Status:", config.overall.status);
      console.log("📊 Stripe:", config.overall.stripe);
      console.log("📊 Price IDs:", config.overall.priceIds);
      console.log("📊 Supabase:", config.overall.supabase);

      if (config.overall.missingConfigs.length > 0) {
        console.log("\n⚠️  Missing configurations:");
        config.overall.missingConfigs.forEach((missing) => {
          console.log(`   - ${missing}`);
        });
      }

      console.log("\n📋 Detailed Report:");
      console.log("Environment:", config.details.environment);
      console.log("Timestamp:", config.details.timestamp);

      console.log("\n🔐 Stripe Configuration:");
      console.log(
        `  Secret Key: ${config.details.stripe.secretKey.configured ? "✅" : "❌"} (${config.details.stripe.secretKey.value})`
      );
      console.log(
        `  Webhook Secret: ${config.details.stripe.webhookSecret.configured ? "✅" : "❌"} (${config.details.stripe.webhookSecret.value})`
      );

      console.log("\n💰 Price IDs:");
      config.details.priceIds.forEach((price) => {
        console.log(
          `  ${price.key}: ${price.configured ? "✅" : "❌"} (${price.value})`
        );
      });

      console.log("\n🗄️  Supabase Configuration:");
      console.log(
        `  URL: ${config.details.supabase.url.configured ? "✅" : "❌"} (${config.details.supabase.url.value})`
      );
      console.log(
        `  Service Role Key: ${config.details.supabase.serviceRoleKey.configured ? "✅" : "❌"} (${config.details.supabase.serviceRoleKey.value})`
      );

      console.log("\n🌐 Base URL:");
      console.log(
        `  Configured: ${config.details.baseUrl.configured ? "✅" : "❌"} (${config.details.baseUrl.value})`
      );

      return config.overall.status === "READY";
    } else {
      console.log("❌ Configuration check failed!");
      console.log("Status:", response.status);
      console.log("Response:", response.data);
      return false;
    }
  } catch (error) {
    console.log("❌ Error checking configuration:", error.message);
    return false;
  }
}

async function testCheckoutCreation(baseUrl, testData) {
  console.log("\n🛒 Testing checkout session creation...\n");

  try {
    const url = `${baseUrl}/api/stripe/create-checkout-session`;
    console.log(`Making request to: ${url}`);

    const response = await makeRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (response.status === 200) {
      console.log("✅ Checkout session created successfully!");
      console.log("Checkout URL:", response.data.url);
      return true;
    } else {
      console.log("❌ Checkout session creation failed!");
      console.log("Status:", response.status);
      console.log("Error:", response.data);
      return false;
    }
  } catch (error) {
    console.log("❌ Error creating checkout session:", error.message);
    return false;
  }
}

async function main() {
  console.log("🧪 Stripe Configuration & Integration Test\n");

  // Get base URL
  const baseUrl = await askQuestion(
    "Enter your base URL (e.g., https://yourdomain.com or http://localhost:3000): "
  );

  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    console.log("❌ Invalid URL format. Please include http:// or https://");
    rl.close();
    return;
  }

  // Get debug key
  const debugKey = await askQuestion("Enter your debug key (CRON_SECRET): ");

  if (!debugKey) {
    console.log("❌ Debug key is required");
    rl.close();
    return;
  }

  // Test configuration
  const configOk = await testConfiguration(baseUrl, debugKey);

  if (!configOk) {
    console.log(
      "\n❌ Configuration test failed. Please fix the configuration before proceeding."
    );
    rl.close();
    return;
  }

  // Ask if user wants to test checkout creation
  const testCheckout = await askQuestion(
    "\nDo you want to test checkout session creation? (y/n): "
  );

  if (testCheckout.toLowerCase() === "y") {
    console.log(
      "\nNote: This will create a real Stripe checkout session (but won't charge anything)"
    );

    const userId = await askQuestion("Enter a test user ID: ");
    const priceId = await askQuestion("Enter a price ID to test with: ");
    const plan = await askQuestion("Enter plan name (e.g., pro, ultra): ");

    if (userId && priceId && plan) {
      await testCheckoutCreation(baseUrl, {
        userId,
        priceId,
        plan,
      });
    } else {
      console.log("❌ Missing required test data");
    }
  }

  console.log("\n🎉 Test completed!");
  console.log("\n📝 Next steps:");
  console.log(
    "1. If any configuration is missing, update your environment variables"
  );
  console.log(
    "2. Make sure your Stripe webhook is configured to point to: " +
      baseUrl +
      "/api/stripe/webhook"
  );
  console.log("3. Test with a real payment in your staging environment");
  console.log("4. Monitor logs after deploying to production");

  rl.close();
}

// Handle CLI arguments
if (process.argv.length > 2) {
  const environment = process.argv[2];
  console.log(`Testing for environment: ${environment}`);
}

main().catch(console.error);
