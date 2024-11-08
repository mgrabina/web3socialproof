import {
  apiKeyTable,
  campaignsTable,
  db,
  eq,
  protocolTable,
} from "@web3socialproof/db";
import {
  NotificationOptions,
  NotificationStylingOptional,
  NotificationType,
} from "../constant/notification";
import { TRPCError } from "@trpc/server";

export const getNotification = async ({
  hostname,
  apiKey,
}: {
  hostname: string;
  apiKey: string;
}): Promise<NotificationOptions> => {
  console.log("Notification for hostname: ", hostname);

  // Check if valid API KEY
  const keysInDB = await db
    .select()
    .from(apiKeyTable)
    .where(eq(apiKeyTable.api_key, apiKey));
  const protocolId = keysInDB[0].protocol_id;
  if (keysInDB.length === 0 || !protocolId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid API key",
    });
  }

  // Check if the client has credits
  const protocolInDb = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, protocolId));
  if (protocolInDb.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Protocol not found",
    });
  }
  const plan = protocolInDb[0].plan;
  console.log("Plan: ", plan); // Todo: checks once we have plan limits set

  // Check if there are customizations
  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.protocol_id, protocolId));
  if (campaigns.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No campaigns found",
    });
  }

  const campaignToPrint = campaigns[0];
  console.log("Campaign to print: ", campaignToPrint);

  return {
    type: campaignToPrint.type as NotificationType,
    styling: campaignToPrint.styling as NotificationStylingOptional,
    message: "Notification from backend",
    subMessage: "This is a sub message",
  };
};
