import { useEffect, useState } from "react";
import { useSupabaseUser } from "./useSupabaseUser";
import { trpcApiClient, TRPCClient } from "@/utils/trpc/trpc";
import { useAsync } from "react-async";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { env } from "@/lib/constants";

export const useTrpcBackend = () => {
  const [trpc, setTrpc] = useState<TRPCClient | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTrpc = async () => {
      try {
        const supabase = createSupabaseClientForClientSide();
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        setTrpc(trpcApiClient(env, token));
      } catch (err) {
        console.error("Error initializing TRPC client:", err);
        setError("Failed to initialize TRPC client");
      } finally {
        setLoading(false);
      }
    };

    initializeTrpc();
  }, []);

  return { trpc, loading, error };
};
