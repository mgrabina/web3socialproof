import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { createStripeCustomer } from "@/utils/stripe/api";
import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";
import { env } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
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
