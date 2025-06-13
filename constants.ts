export const constants = {
  paymentLinks: {
    proPlan:
      process.env.NODE_ENV === "development"
        ? "price_1RM5g3JIJDFQQRJ08tJCEcVM"
        : process.env.STRIPE_PRO_PLAN_PRICE_ID || "",
    ultraPlan:
      process.env.NODE_ENV === "development"
        ? "price_1RM5gnJIJDFQQRJ0MpzocQBe"
        : process.env.STRIPE_ULTRA_PLAN_PRICE_ID || "",
    basicIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_14AdRa1jJf2D5tF2Oo87K03"
          : process.env.STRIPE_BASIC_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQAvJIJDFQQRJ0H3t5m7hp"
          : process.env.STRIPE_BASIC_IDEA_BUCKET_PRICE_ID || "",
    },
    standardIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_cNidRa9Qf2fR3lxfBa87K04"
          : process.env.STRIPE_STANDARD_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQtuJIJDFQQRJ0Q2tbSn9h"
          : process.env.STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID || "",
    },
    premiumIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_28E6oI1jJ7AbbS360A87K05"
          : process.env.STRIPE_PREMIUM_IDEA_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQuaJIJDFQQRJ0Hlbklrbk"
          : process.env.STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID || "",
    },
    basicScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_28EeVe7I7aMn09l74E87K06"
          : process.env.STRIPE_BASIC_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQvXJIJDFQQRJ0ZEaQh3Lk"
          : process.env.STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID || "",
    },
    standardScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_14A14oe6v4nZ7BN9cM87K07"
          : process.env.STRIPE_STANDARD_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQwZJIJDFQQRJ04UF2Nej6"
          : process.env.STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID || "",
    },
    premiumScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === "development"
          ? "https://buy.stripe.com/test_28E6oI4vV9Ij1dp74E87K08"
          : process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_LINK || "",
      priceId:
        process.env.NODE_ENV === "development"
          ? "price_1RQQxEJIJDFQQRJ0fUVoU02O"
          : process.env.STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID || "",
    },
  },
};
