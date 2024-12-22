import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import { SelectProtocol, SelectUser } from "@web3socialproof/db";

export async function getServerContext() {
  const supabase = createSupabaseClientForServerSide();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let user: SelectUser | null = null;
  let protocol: SelectProtocol | null = null;

  if (supabaseUser?.email) {
    // 2. Query the users_table to get the user's protocol_id
    const { data: userData, error } = await supabase
      .from("users_table")
      .select()
      .eq("email", supabaseUser.email)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
    } else {
      user = userData;
    }

    if (!userData?.protocol_id) {
      console.error("No protocol_id found for user:", session?.user.email);
    } else {
      const { data: protocolData, error: protocolError } = await supabase
        .from("protocol_table")
        .select()
        .eq("id", userData?.protocol_id)
        .single();

      if (protocolError) {
        console.error("Error fetching protocol:", protocolError);
      } else {
        protocol = protocolData;
      }
    }
  }

  return { session, user, supabaseUser, protocol };
}
