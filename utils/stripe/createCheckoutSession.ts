export async function createStripeCheckoutSession({
  userId,
  priceId,
  plan,
}: {
  userId: string;
  priceId: string;
  plan: string;
}) {
  console.log("Frontend checkout request:", { userId, priceId, plan });

  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        priceId,
        plan,
        // puoi aggiungere altri metadata se necessario
      }),
    });

    console.log("Checkout response status:", res.status);

    const data = await res.json();
    console.log("Checkout response data:", data);

    if (!res.ok) {
      console.error("Checkout session creation failed:", {
        status: res.status,
        statusText: res.statusText,
        error: data.error,
        requestData: { userId, priceId, plan },
      });
      throw new Error(
        data.error || `HTTP ${res.status}: Errore creazione sessione Stripe`
      );
    }

    if (!data.url) {
      console.error("No URL returned from checkout session");
      throw new Error("No checkout URL received");
    }

    console.log("Checkout session created successfully, URL:", data.url);
    return data.url; // URL di checkout Stripe
  } catch (error) {
    console.error("Frontend checkout error:", error);
    throw error;
  }
}
