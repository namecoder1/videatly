import Stripe from "stripe";

let stripeSecretKey: string;

if (process.env.NODE_ENV === "development") {
  stripeSecretKey = process.env.STRIPE_SECRET_KEY_TEST!;
} else {
  stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
}

// Controlla la chiave appropriata in base all'ambiente
if (process.env.NODE_ENV === "development") {
  if (!process.env.STRIPE_SECRET_KEY_TEST) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY_TEST environment variable for development"
    );
  }
} else {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable for production"
    );
  }
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export default stripe;
