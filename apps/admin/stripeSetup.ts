import { PUBLIC_URL } from "./lib/constants";

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const currencyType = "usd";
const plans = [
  {
    name: "Free",
    price: 0, // price in cents, use 0 for free
    features: [
      // This will be used to list the features that will show up on the pricing table
      { name: "Upto 100 users" },
    ],
  },
  {
    name: "Pro",
    price: 10,
    features: [{ name: "Upto 10.000 users" }],
  },
  {
    name: "Enterprise",
    price: 100,
    features: [{ name: "Unlimited users" }],
  },
];

// Create a new product in Stripe
plans.forEach(async (plan) => {
  const product = await stripe.products.create({
    name: plan.name,
    marketing_features: plan.features,
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.price,
    currency: currencyType,
  });
  await stripe.products.update(product.id, { default_price: price.id });
});

// Add webhook
stripe.webhookEndpoints.create({
  enabled_events: [
    "customer.subscription.created",
    "customer.subscription.deleted",
    "customer.subscription.updated",
  ],
  url: `${PUBLIC_URL}/webhook/stripe`,
});
