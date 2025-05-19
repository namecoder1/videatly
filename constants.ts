export const constants = {
  paymentLinks: {
    proPlan: 
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_9B600k5zZ1bN2htbkU87K01'
        : '',
    ultraPlan:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_3cIeVeaUjf2D7BNgFe87K02'
        : '',
    basicIdeaBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_14AdRa1jJf2D5tF2Oo87K03'
        : '',
    standardIdeaBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_cNidRa9Qf2fR3lxfBa87K04'
        : '',
    premiumIdeaBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_28E6oI1jJ7AbbS360A87K05'
        : '',
    basicScriptBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_28EeVe7I7aMn09l74E87K06'
        : '',
    standardScriptBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_14A14oe6v4nZ7BN9cM87K07'
        : '',
    premiumScriptBucket:
      process.env.NODE_ENV === 'development'
        ? 'https://buy.stripe.com/test_28E6oI4vV9Ij1dp74E87K08'
        : '',
  },
};
