// Our internal api retriving and saving data to our database.
// Database connection it at @service/db package

import { TRPCError } from "@trpc/server";
import {
  apiKeyTable,
  campaignsTable,
  db,
  eq,
  impressionsTable,
  protocolTable,
  SelectCampaign,
  usersTable,
} from "@web3socialproof/db";

export const getCampaign = async (campaignId: number) => {
  // Check if campaign exists
  const campaign = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, Number(campaignId)));

  if (campaign.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Campaign not found",
    });
  }

  return campaign[0];
};

export const getProtocol = async (protocolId: number) => {
  const protocol = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, protocolId));

  if (protocol.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Protocol not found",
    });
  }

  return protocol[0];
};

export const getUser = async (email: string) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (user.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return user[0];
};

export const getApiKey = async (apiKey: string) => {
  const keys = await db
    .select()
    .from(apiKeyTable)
    .where(eq(apiKeyTable.api_key, apiKey));

  if (keys.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "API Key not found",
    });
  }

  return keys[0];
};

export const saveImpressionInDb = async (input: {
  campaign: SelectCampaign;
  user: string;
  session: string;
  address?: string;
}) => {
  const inserted = await db
    .insert(impressionsTable)
    .values({
      session: input.session,
      user: input.user,
      campaign_id: input.campaign.id,
      address: input.address,
    })
    .returning();

  if (inserted.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to track impression",
    });
  }
};
