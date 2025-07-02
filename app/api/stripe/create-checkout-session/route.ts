import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/utils/stripe/stripe";

export async function POST(req: NextRequest) {
  console.log("=== CHECKOUT SESSION CREATION START ===");

  let requestData;
  try {
    requestData = await req.json();
    console.log("Request data received:", requestData);
  } catch (err) {
    console.error("Failed to parse request body:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { priceId, tokens, tool, userId, plan } = requestData;

  console.log("Parsed parameters:", {
    priceId: priceId || "NOT_PROVIDED",
    tokens: tokens || "NOT_PROVIDED",
    tool: tool || "NOT_PROVIDED",
    userId: userId || "NOT_PROVIDED",
    plan: plan || "NOT_PROVIDED",
  });

  const supabase = await createClient();
  let user = null;

  console.log("Starting user retrieval process...");

  // Recupera user da Supabase se non passato direttamente
  if (userId) {
    console.log("Fetching user by userId:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    console.log("User query result:", {
      data: data ? "USER_FOUND" : "USER_NOT_FOUND",
      error,
    });

    if (error || !data) {
      console.error("User not found in database:", error);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = { ...data, id: userId, email: data.email };
    console.log("User retrieved from DB:", { id: user.id, email: user.email });
  } else {
    console.log("Fetching user from auth session...");
    const {
      data: { user: supaUser },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Auth user result:", {
      user: supaUser ? "AUTH_USER_FOUND" : "AUTH_USER_NOT_FOUND",
      error: userError,
    });

    if (userError || !supaUser) {
      console.error("User not found in auth session:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    user = supaUser;
    console.log("User retrieved from auth:", {
      id: user.id,
      email: user.email,
    });
  }

  // Distingui tra acquisto token e subscription
  const isSubscription = !tokens && !tool && !!plan;
  console.log(
    "Transaction type:",
    isSubscription ? "SUBSCRIPTION" : "TOKEN_PURCHASE"
  );

  // Validation
  console.log("Starting validation checks...");

  if (!user || !priceId) {
    console.error("Missing required data:", {
      user: user ? "PRESENT" : "MISSING",
      priceId: priceId ? "PRESENT" : "MISSING",
    });
    return NextResponse.json(
      { error: "Dati mancanti per la creazione della sessione Stripe" },
      { status: 400 }
    );
  }

  if (!isSubscription && (!tokens || !tool)) {
    console.error("Missing token purchase data:", {
      tokens: tokens ? "PRESENT" : "MISSING",
      tool: tool ? "PRESENT" : "MISSING",
    });
    return NextResponse.json(
      { error: "Dati mancanti per la creazione della sessione Stripe (token)" },
      { status: 400 }
    );
  }

  console.log("Validation passed. Starting Stripe operations...");

  try {
    // First, create or retrieve a customer with retry logic
    console.log("Looking for existing Stripe customer with email:", user.email);
    let customer;

    // Retry customer creation/retrieval
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });

        if (customers.data.length > 0) {
          customer = customers.data[0];
          console.log("Found existing customer:", customer.id);

          // Update customer metadata if missing user_id
          if (!customer.metadata?.user_id) {
            console.log("Updating customer metadata with user_id");
            customer = await stripe.customers.update(customer.id, {
              metadata: {
                ...customer.metadata,
                user_id: user.id,
              },
            });
          }
          break;
        } else {
          console.log("Creating new Stripe customer...");
          customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              user_id: user.id,
            },
          });
          console.log("Created new customer:", customer.id);
          break;
        }
      } catch (customerError) {
        console.error(
          `Customer operation failed on attempt ${attempt}:`,
          customerError
        );
        if (attempt === maxRetries) {
          throw customerError;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Per acquisti di token, verifica se esiste già una sessione attiva
    if (!isSubscription) {
      console.log("Checking for active token purchase sessions...");
      const activeSessions = await stripe.checkout.sessions.list({
        customer: customer?.id,
        status: "open",
        limit: 1,
      });

      if (activeSessions.data.length > 0) {
        console.log(
          "Found active session, returning existing URL:",
          activeSessions.data[0].id
        );
        // Se esiste una sessione attiva, restituisci quella invece di crearne una nuova
        return NextResponse.json({ url: activeSessions.data[0].url });
      }
      console.log(
        "No active sessions found, proceeding with new session creation"
      );
    }

    // Ensure base URL has proper scheme with better fallbacks
    let fullBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!fullBaseUrl) {
      // Fallback to request origin if NEXT_PUBLIC_BASE_URL is not set
      const origin = req.headers.get("origin") || req.headers.get("host");
      fullBaseUrl = origin || "";
    }

    // Ensure proper protocol
    if (
      fullBaseUrl &&
      !fullBaseUrl.startsWith("http://") &&
      !fullBaseUrl.startsWith("https://")
    ) {
      fullBaseUrl = `https://${fullBaseUrl}`;
    }

    // Final validation
    if (
      !fullBaseUrl ||
      (!fullBaseUrl.startsWith("http://") &&
        !fullBaseUrl.startsWith("https://"))
    ) {
      console.error("Invalid base URL configuration:", {
        env_var: process.env.NEXT_PUBLIC_BASE_URL,
        origin: req.headers.get("origin"),
        host: req.headers.get("host"),
        computed: fullBaseUrl,
      });
      return NextResponse.json(
        { error: "Server configuration error: invalid base URL" },
        { status: 500 }
      );
    }

    console.log("Creating checkout session with parameters:", {
      mode: isSubscription ? "subscription" : "payment",
      customer: customer?.id,
      priceId,
      baseUrl: fullBaseUrl,
      metadata: isSubscription
        ? { plan }
        : { tokens: tokens?.toString(), tool, price_id: priceId },
    });

    const sessionConfig = {
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      customer: customer?.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${fullBaseUrl}/billing?success=1`,
      cancel_url: `${fullBaseUrl}/billing?canceled=1`,
      metadata: {
        user_id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        ...(isSubscription
          ? {
              plan,
              type: "subscription",
            }
          : {
              tokens: tokens?.toString(),
              tool,
              price_id: priceId,
              type: "one_off",
            }),
      },
      // Enhanced configuration - billing address only when needed
      billing_address_collection: "auto",
      // Disable automatic tax by default to avoid configuration issues
      // automatic_tax: {
      //   enabled: false,
      // },
      // Add timeout and retry logic
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
      ...(isSubscription
        ? {
            subscription_data: {
              metadata: {
                user_id: user.id,
                plan,
                created_via: "checkout",
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: {
                user_id: user.id,
                tokens: tokens?.toString(),
                tool,
                type: "one_off",
              },
            },
          }),
    } as const;

    console.log("Creating checkout session with enhanced config:", {
      mode: sessionConfig.mode,
      customer: sessionConfig.customer,
      priceId,
      metadata: sessionConfig.metadata,
    });

    const session = await stripe.checkout.sessions.create(sessionConfig as any);

    console.log("Created checkout session:", {
      session_id: session.id,
      mode: session.mode,
      metadata: session.metadata,
      customer: session.customer,
      payment_intent: session.payment_intent,
      url: session.url,
    });

    console.log("=== CHECKOUT SESSION CREATION SUCCESS ===");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("=== CHECKOUT SESSION CREATION ERROR ===");
    console.error("Errore creazione sessione Stripe:", err);
    console.error("Error details:", {
      message: (err as Error).message,
      stack: (err as Error).stack,
      name: (err as Error).name,
    });
    console.error("Request context:", {
      priceId,
      tokens,
      tool,
      userId,
      plan,
      isSubscription,
      userEmail: user?.email,
    });
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
