import { apiKeyTable, db } from "@web3socialproof/db";
import crypto from "crypto";

// Function to generate a secure API key
function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const createApiKey = async (protocol: string) => {
  const apiKey = generateApiKey();

  // await db.insert(apiKeyTable).values({
  //   api_key: apiKey,
  //   protocol_id: protocol,
  //   name: "Generated",
  //   created_at: new Date(),
  //   updated_at: new Date(),
  //   enabled: true,
  // });
};
