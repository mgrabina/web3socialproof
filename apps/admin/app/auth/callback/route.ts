import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { env } from "@/lib/constants";
import { generateRandomKey } from "@/lib/utils";
import { createStripeCustomer } from "@/utils/stripe/api";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import {
  apiKeyTable,
  countDistinct,
  db,
  eq,
  protocolTable,
  usersTable,
} from "@web3socialproof/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createSupabaseClientForServerSide();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // check to see if user already exists in db
      const checkUserInDB = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, user!.email!));
      const isUserInDB = checkUserInDB.length > 0 ? true : false;
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (!isUserInDB) {
        // First create protocol
        let protocolInDb;
        // create Stripe customers
        const stripeID = await createStripeCustomer(
          user!.id,
          user!.email!,
          user!.user_metadata.full_name
        );
        // Create record in DB
        protocolInDb = await db
          .insert(protocolTable)
          .values({
            stripe_id: stripeID,
            plan: env == "development" ? "free" : "none",
          })
          .returning();

        await db.insert(usersTable).values({
          name: user!.user_metadata.full_name,
          email: user!.email!,
          protocol_id: protocolInDb[0].id,
        });

        // If no api-keys are set, add a first one
        const apiKeys = await db
          .select({
            count: countDistinct(apiKeyTable.key),
          })
          .from(apiKeyTable)
          .where(eq(apiKeyTable.protocol_id, protocolInDb[0].id));

        if (apiKeys[0].count === 0) {
          const newKey = {
            key: generateRandomKey(),
            protocol_id: protocolInDb[0].id,
            name: "Your first API Key",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            enabled: true,
          };
          await db.insert(apiKeyTable).values(newKey);
        }

        if (!protocolInDb[0].plan || protocolInDb[0].plan === "none") {
          next = "/subscribe";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
