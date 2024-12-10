import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import {
  apiKeyTable,
  db,
  eq,
  protocolTable,
  SelectProtocol,
} from "@web3socialproof/db";
import crypto from "crypto";
import { env } from "process";
import { getApiKey, getProtocol, getUser } from "../sources/database";

// Function to generate a secure API key
function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const createApiKey = async ({
  protocol,
}: {
  protocol: SelectProtocol;
}) => {
  const apiKey = generateApiKey();

  await db.insert(apiKeyTable).values({
    api_key: apiKey,
    protocol_id: protocol.id,
    name: "Generated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    enabled: true,
  });

  return {
    apiKey: apiKey,
  };
};

export const verifyApiKey = async (apiKey: string) => {
  // Check if valid API KEY
  const key = await getApiKey(apiKey);

  if (!key.enabled) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API Key disabled",
    });
  }

  if (key.protocol_id === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API Key not associated with a protocol",
    });
  }

  const protocol = await getProtocol(key.protocol_id);

  const plan = protocol.plan;
  // Todo: check credits once pricing is decided

  return {
    protocol,
  };
};

export const verifySupabaseToken = async (token: string) => {
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  const { data: userFromSupabase, error } = await client.auth.getUser(token);

  if (error) {
    console.error("Error fetching user ", error);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  if (!userFromSupabase.user.email) {
    console.error("Invalid user, email not found"); 
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid user",
    });
  }

  const user = await getUser(userFromSupabase.user.email);

  if (!user.protocol_id) {
    console.error("User not associated with a protocol");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User not associated with a protocol",
    });
  }

  const protocol = await getProtocol(user.protocol_id);

  return {
    user,
    protocol,
  };
};
