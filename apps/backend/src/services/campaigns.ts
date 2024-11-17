import {
  and,
  apiKeyTable,
  campaignsTable,
  db,
  eq,
  inArray,
  isNotNull,
  protocolTable,
  SelectProtocol,
} from "@web3socialproof/db";
import {
  NotificationOptions,
  NotificationStylingOptional,
  NotificationType,
} from "../../../../packages/shared/src/constants/notification";
import { TRPCError } from "@trpc/server";

export const getNotification = async ({
  hostname,
  protocol,
}: {
  hostname: string;
  protocol: SelectProtocol;
}): Promise<NotificationOptions> => {
  // Check if there are customizations
  let campaigns = await db
    .select()
    .from(campaignsTable)
    .where(
      and(
        eq(campaignsTable.protocol_id, protocol.id),
        isNotNull(campaignsTable.message),
        eq(campaignsTable.enabled, true),
        isNotNull(campaignsTable.hostnames)
      )
    );

  // Check hosts
  campaigns = campaigns.filter((campaign) => {
    return campaign.hostnames?.includes(hostname);
  });

  if (campaigns.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No campaigns found",
    });
  }

  const campaignToPrint = campaigns[0];

  return {
    verificationLink: "#",
    type: campaignToPrint.type as NotificationType,
    styling: campaignToPrint.styling as NotificationStylingOptional,
    message: campaignToPrint.message!,
    subMessage: campaignToPrint.sub_message ?? "",
    campaign: campaignToPrint.id,
  };
};
