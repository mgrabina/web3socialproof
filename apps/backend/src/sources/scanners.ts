// Our internal api getting insights from etherscan, etc.

import { TRPCError } from "@trpc/server";
import { env } from "process";
import { z } from "zod";

const etherscanContractAbiResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.string(),
});
type EtherscanContractAbiResponse = z.infer<
  typeof etherscanContractAbiResponseSchema
>;

export const getContractAbiFromScanner = async ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}) => {
  try {
    const etherscanApiToken = env.ETHERSCAN_API_KEY;
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getabi&address=${address}&apikey=${etherscanApiToken}`;
    console.log(url);
    const response = fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: EtherscanContractAbiResponse = await (await response).json();

    try {
      JSON.parse(data.result); // is ABI valid JSON?
      return data.result;
    } catch (error) {
      console.error("Error parsing contract ABI", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error parsing contract ABI. Error.",
      });
    }
  } catch (error) {
    console.error("Error fetching contract ABI", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error fetching contract ABI",
    });
  }
};

const contractCreatorAndTxHashScannerResponse = z.object({
  status: z.string(),
  message: z.string(),
  result: z.array(
    z.object({
      contractAddress: z.string(),
      contractCreator: z.string(),
      txHash: z.string(),
    })
  ),
});
type ContractCreatorAndTxHashScannerResponse = z.infer<
  typeof contractCreatorAndTxHashScannerResponse
>;

export const getContractCreatorAndTxHashFromScanner = async ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}) => {
  const etherscanApiToken = env.ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api
   ?chainid=${chainId}
   &module=contract
   &action=getcontractcreation
   &address=${address}
   &apikey=${etherscanApiToken}`;
  const response = fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: ContractCreatorAndTxHashScannerResponse = await (
    await response
  ).json();

  return data.result.length > 0 ? data.result[0] : undefined;
};
