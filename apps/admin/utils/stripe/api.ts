import { env, PUBLIC_URL } from "@/lib/constants";
import {
  db,
  eq,
  protocolTable,
  SelectProtocol,
  usersTable,
} from "@web3socialproof/db";
import { Stripe } from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getStripePlan(email: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (user.length === 0) {
    return "none";
  }

  const protocol = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, user[0].protocol_id!));

  if (!protocol[0].stripe_id) {
    return "none";
  }
  if (env === "development") {
    return "free";
  }

  const subscription = await stripe.subscriptions.retrieve(
    protocol[0].stripe_id
  );
  const productId = subscription.items.data[0].plan.product as string;
  const product = await stripe.products.retrieve(productId);
  return product.name;
}

export async function createStripeCustomer(
  id: string,
  email: string,
  name?: string
) {
  const customer = await stripe.customers.create({
    name: name ? name : "",
    email: email,
    metadata: {
      supabase_id: id,
    },
  });
  // Create a new customer in Stripe
  return customer.id;
}

export async function createStripeCheckoutSession(email: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const protocol = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, user[0].protocol_id!));

  const customerSession = await stripe.customerSessions.create({
    customer: protocol[0].stripe_id!,
    components: {
      pricing_table: {
        enabled: true,
      },
    },
  });
  return customerSession.client_secret;
}

export async function generateStripeBillingPortalLinkServerSide(email: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const protocol = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, user[0].protocol_id!));

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: protocol[0].stripe_id!,
    return_url: `${PUBLIC_URL()}`,
  });
  return portalSession.url;
}

export async function generateStripeBillingPortalFromProtocolServerSide(
  protocol: SelectProtocol
) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: protocol.stripe_id!,
    return_url: `${PUBLIC_URL()}`,
  });
  return portalSession.url;
}
