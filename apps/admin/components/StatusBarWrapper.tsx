import React from "react";
import StatusBar, { StatusBarConfig } from "@/components/StatusBar";

import {
  and,
  apiKeyTable,
  campaignsTable,
  contractsTable,
  db,
  eq,
  impressionsTable,
} from "@web3socialproof/db";
import { getUserProtocol } from "@/utils/database/users";

const getStatusBarConfig = async (): Promise<StatusBarConfig> => {
  const protocol = await getUserProtocol();

  if (!protocol) {
    return {
      status: "error",
      message: "No protocol found for the user.",
    };
  }

  // Check if API keys exist
  const hasApiKeys =
    (
      await db
        .select()
        .from(apiKeyTable)
        .where(eq(apiKeyTable.protocol_id, protocol.id))
    ).length > 0;

  if (!hasApiKeys) {
    return {
      status: "warning",
      message: (
        <>
          No API keys found. Please{" "}
          <a
            href="/api-keys"
            className="underline text-blue-600 hover:text-blue-800"
          >
            create one here
          </a>
          .
        </>
      ),
    };
  }

  // Check if impressions exist
  const hasImpressions =
    (
      await db
        .select()
        .from(impressionsTable)
        .leftJoin(
          campaignsTable,
          eq(impressionsTable.campaign_id, campaignsTable.id)
        )
        .where(eq(campaignsTable.protocol_id, protocol.id))
    ).length > 0;

  if (!hasImpressions) {
    return {
      status: "warning",
      message: (
        <>
          No impressions found. Please integrate the pixel. Learn more in{" "}
          <a
            href="/api-keys"
            className="underline text-blue-600 hover:text-blue-800"
          >
            API Keys
          </a>
          .
        </>
      ),
    };
  }

  // If there are contracts not verified yet
  const notVerifiedContracts = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.protocol_id, protocol.id),
        eq(contractsTable.ownership_verified, false)
      )
    );

  if (notVerifiedContracts.length > 0) {
    return {
      status: "warning",
      message: (
        <>
          There are contracts not verified yet. Please{" "}
          <a
            href="/contracts"
            className="underline text-blue-600 hover:text-blue-800"
          >
            verify them here
          </a>
          .
        </>
      ),
    };
  }

  // All systems good
  return {
    status: "info",
    message: (
      <>
        Everything looks good! You can{" "}
        <a
          href="/campaigns"
          className="underline text-blue-600 hover:text-blue-800"
        >
          create a new campaign
        </a>{" "}
        .
      </>
    ),
  };
};

export default async function StatusBarWrapper() {
  const { status, message } = await getStatusBarConfig();

  return (
    <div className="p-4">
      <StatusBar status={status} message={message} />
    </div>
  );
}
