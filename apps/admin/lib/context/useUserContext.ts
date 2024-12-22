// Hook that returns the session, user and protocol logged

import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { SelectProtocol, SelectUser } from "@web3socialproof/db";
import { useEffect, useState } from "react";

export const useUserContext = () => {
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SelectUser | null>(null);
  const [protocol, setProtocol] = useState<SelectProtocol | null>(null);

  useEffect(() => {
    async function fetch() {
      const supabase = createSupabaseClientForClientSide();
      setIsContextLoading(true);

      if (!isContextLoading) {
        return; // Avoid re-fetching data
      }

      const {
        data: { session: auxSession },
      } = await supabase.auth.getSession();

      console.log("Fetching user data...");

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!auxSession || !supabaseUser?.email) {
        setIsContextLoading(false);
        return;
      }

      setSession(auxSession);

      const { data: userData, error } = await supabase
        .from("users_table")
        .select()
        .eq("email", supabaseUser.email)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        setIsContextLoading(false);
        return;
      }
      setUser(userData);

      if (!userData?.protocol_id) {
        console.error("No protocol_id found for user:", auxSession?.user.email);
        setIsContextLoading(false);
        return;
      }

      const { data: protocolData, error: protocolError } = await supabase
        .from("protocol_table")
        .select()
        .eq("id", userData?.protocol_id)
        .single();

      if (protocolError) {
        console.error("Error fetching protocol:", protocolError);
        setIsContextLoading(false);
        return;
      }
      setProtocol(protocolData);

      setIsContextLoading(false);
    }

    fetch();
  }, []); // Only run once

  return { isContextLoading, session, user, protocol };
};
