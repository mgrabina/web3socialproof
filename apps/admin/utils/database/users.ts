// utils/authHelpers.ts
import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";

// Function to get the protocol for the authenticated user
export async function getUserProtocol() {
  const supabase = createSupabaseClientForServerSide();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return undefined;
  }

  const userWithProtocol = await db
    .select({
      protocol: protocolTable,
    })
    .from(usersTable)
    .leftJoin(protocolTable, eq(usersTable.protocol_id, protocolTable.id))
    .where(eq(usersTable.email, user.email));

  // Check if a protocol is associated with the user
  return userWithProtocol.length ? userWithProtocol[0].protocol : undefined;
}
