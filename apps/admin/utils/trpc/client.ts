import { Environment } from "@/lib/constants";
import { createSupabaseClientForClientSide } from "../supabase/client";
import { trpcApiClient } from "./trpc";

export const getTrpcClientForClient = async (env: Environment) => {
  const supabase = createSupabaseClientForClientSide();
  const { data: session } = await supabase.auth.getSession();

  const token = session?.session?.access_token;
  return trpcApiClient(env, token);
};