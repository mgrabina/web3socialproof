import { TRPCError } from "@trpc/server";
import {
  and,
  campaignsTable,
  db,
  eq,
  isNotNull,
  SelectProtocol,
} from "@web3socialproof/db";
import {
  isIconName,
  NotificationOptions,
  NotificationStylingOptional,
  NotificationType,
} from "../../../../packages/shared/src/constants/notification";

export const getNotification = async ({
  hostname,
  protocol,
}: {
  hostname: string;
  protocol: SelectProtocol;
}): Promise<NotificationOptions> => {
  if (!protocol || !protocol.plan) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Protocol not found or doesn't have a plan.",
    });
  }

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

  if (campaigns.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No campaigns found",
    });
  }

  // Check hosts
  campaigns = campaigns.filter((campaign) => {
    return campaign.hostnames?.includes(hostname);
  });

  if (campaigns.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No campaigns found for this hostname " + hostname,
    });
  }

  const campaignToPrint = campaigns[0];

  return {
    verificationLink: "#",
    type: campaignToPrint.type as NotificationType,
    styling: campaignToPrint.styling as NotificationStylingOptional,
    message: campaignToPrint.message,
    iconName:
      campaignToPrint.iconName && isIconName(campaignToPrint.iconName)
        ? campaignToPrint.iconName
        : undefined,
    iconSrc: campaignToPrint.iconSrc ?? undefined,
    delay: campaignToPrint.delay ?? undefined,
    timer: campaignToPrint.timer ?? undefined,
    subMessage: campaignToPrint.sub_message ?? "",
    campaign: campaignToPrint.id,
    subscriptionPlan: protocol.plan,
    pathnames: campaignToPrint.pathnames ?? undefined,
  };
};
