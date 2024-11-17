import { Environment } from "@/lib/constants";
import { createSupabaseClientForServerSide } from "../supabase/server";
import { trpcApiClient } from "./trpc";

export const getTrpcClientForServer = async (env: Environment) => {
  const supabase = createSupabaseClientForServerSide();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return trpcApiClient(env, token);
};
