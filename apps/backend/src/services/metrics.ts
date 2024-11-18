import {
  and,
  contractsTable,
  db,
  eq,
  inArray,
  logsTable,
  metricsTable,
  metricsVariablesTable,
} from "@web3socialproof/db";
import { VerificationInfo } from "@web3socialproof/shared/constants";
import {
  addressToExplorerUrl,
  chainIdToName,
  isChainIdSupported,
} from "@web3socialproof/shared/constants/chains";

export const getMetricValue = async (
  metric: string
): Promise<
  | {
      value: bigint;
      verifications: VerificationInfo[];
    }
  | undefined
> => {
  const metrics = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.name, metric));

  if (metrics.length === 0) {
    return undefined;
  }

  const metricVariables = await db
    .select()
    .from(metricsVariablesTable)
    .where(eq(metricsVariablesTable.metric_id, metrics[0].id));

  const logs = await db
    .select()
    .from(logsTable)
    .leftJoin(
      contractsTable,
      and(
        eq(contractsTable.chain_id, logsTable.chain_id),
        eq(contractsTable.contract_address, logsTable.contract_address)
      )
    )
    .where(
      inArray(
        logsTable.id,
        metricVariables.map((v) => v.variable_id)
      )
    );

  const value = logs.reduce((acc, log) => {
    return acc + (log.logs_table.current_result ?? 0n);
  }, 0n);

  const contracts = logs.map((log) => {
    return {
      chainId: log.logs_table.chain_id,
      contractAddress: log.logs_table.contract_address,
      isOwnershipVerified: log.contracts_table?.ownership_verified ?? false,
    };
  });

  return {
    value,
    verifications: contracts.map((contract) => {
      if (!isChainIdSupported(contract.chainId)) {
        return {
          chainId: contract.chainId,
          contractAddress: contract.contractAddress,
          isOwnershipVerified: contract.isOwnershipVerified,
        };
      }
      return {
        chainId: contract.chainId,
        chainName: chainIdToName(contract.chainId),
        contractAddress: contract.contractAddress,
        isOwnershipVerified: contract.isOwnershipVerified,
        url: addressToExplorerUrl(contract.chainId, contract.contractAddress),
      };
    }),
  };
};
