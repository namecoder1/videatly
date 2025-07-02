export const constants = {
  paymentLinks: {
    proPlan:
      process.env.NODE_ENV === "development"
        ? "price_1RayGcRXT8zipkHSQ6e58rEa"
        : process.env.STRIPE_PRO_PLAN_PRICE_ID || "",
    ultraPlan:
      process.env.NODE_ENV === "development"
        ? "price_1RayHNRXT8zipkHSVsRWGFt9"
        : process.env.STRIPE_ULTRA_PLAN_PRICE_ID || "",
    basicIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_fZu14pcyDcW3cxE9b76Vq05"
          : process.env.STRIPE_BASIC_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayI5RXT8zipkHSFVT9I6TH" 
          : process.env.STRIPE_BASIC_IDEA_BUCKET_PRICE_ID || "",
    },
    standardIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_cNiaEZgOT9JR2X472Z6Vq04"
          : process.env.STRIPE_STANDARD_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayIaRXT8zipkHSTH1UKr8F"
          : process.env.STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID || "",
    },
    premiumIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_cNidRb1TZg8f55c4UR6Vq03"
          : process.env.STRIPE_PREMIUM_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayJBRXT8zipkHSFepE4uaD"
          : process.env.STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID || "",
    },
    basicScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_9B6bJ3fKPbRZ69gfzv6Vq02"
          : process.env.STRIPE_BASIC_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayJsRXT8zipkHSFA8u267R"
          : process.env.STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID || "",
    },
    standardScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_bJedRb9mr9JR7dk0EB6Vq01"
          : process.env.STRIPE_STANDARD_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayKSRXT8zipkHSQz40B3GG"
          : process.env.STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID || "",
    },
    premiumScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_dRm00l8in3lt4183QN6Vq00"
          : process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RayL2RXT8zipkHSu2hE9uH8"
          : process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID || "",
    },
  },
};
