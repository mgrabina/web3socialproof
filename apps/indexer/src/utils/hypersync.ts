import { HypersyncClient } from "@envio-dev/hypersync-client";
import { db, logsTable } from "@web3socialproof/db";

export const createClients = async () => {
  return (
    await db.selectDistinctOn([logsTable.chain_id]).from(logsTable)
  )
    .map((v) => v.chain_id)
    .map((chainId) => {
      return {
        chainId,
        client: HypersyncClient.new({
          url: `https://${chainId}.hypersync.xyz`,
          bearerToken: process.env.HYPERSYNC_BEARER_TOKEN,
        }),
      };
    })
    .reduce(
      (acc, { chainId, client }) => {
        acc[chainId] = client;
        return acc;
      },
      {} as Record<number, HypersyncClient>
    );
};
