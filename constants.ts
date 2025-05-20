export const constants = {
  paymentLinks: {
    proPlan: 
      process.env.NODE_ENV === 'development'
        ? 'price_1RM5g3JIJDFQQRJ08tJCEcVM'
        : '',
    ultraPlan:
      process.env.NODE_ENV === 'development'
        ? 'price_1RM5gnJIJDFQQRJ0MpzocQBe'
        : '',
    basicIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_14AdRa1jJf2D5tF2Oo87K03'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQAvJIJDFQQRJ0H3t5m7hp'
          : '',
    },
    standardIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_cNidRa9Qf2fR3lxfBa87K04'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQtuJIJDFQQRJ0Q2tbSn9h'
          : '',
    },
    premiumIdeaBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_28E6oI1jJ7AbbS360A87K05'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQuaJIJDFQQRJ0Hlbklrbk'
          : '',
    },
    basicScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_28EeVe7I7aMn09l74E87K06'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQvXJIJDFQQRJ0ZEaQh3Lk'
          : '',
    },
    standardScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_14A14oe6v4nZ7BN9cM87K07'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQwZJIJDFQQRJ04UF2Nej6'
          : '',
    },
    premiumScriptBucket: {
      linkToPay:
        process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_28E6oI4vV9Ij1dp74E87K08'
          : '',
      priceId: 
        process.env.NODE_ENV === 'development'
          ? 'price_1RQQxEJIJDFQQRJ0fUVoU02O'
          : '',
    }
  },
};
