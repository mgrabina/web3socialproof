import { TRPCError } from "@trpc/server";
import { SelectProtocol } from "@web3socialproof/db";
import { ethers } from "ethers";
import {
  disableVerificationCode,
  getContractFromDatabase,
  getVerificationCode,
  insertContract,
  insertVerificationCodes,
  setCodeVerification,
  updateContractAbi,
} from "../sources/database";
import {
  getContractAbiFromScanner,
  getContractCreatorAndTxHashFromScanner,
} from "../sources/scanners";

export const getContractAbi = async ({
  protocol,
  chainId,
  address,
}: {
  protocol: SelectProtocol;
  chainId: number;
  address: string;
}) => {
  // First check database, then check scanners

  const contractInDb = await getContractFromDatabase({
    chainId,
    address,
  });

  console.log(contractInDb);

  if (contractInDb) {
    // If exists, only owner can get or update
    if (contractInDb.protocol_id !== protocol.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Contract not associated with protocol",
      });
    }

    // If has abi, return
    if (contractInDb.contract_abi) {

      console.log(contractInDb.contract_abi);
      return JSON.stringify(contractInDb.contract_abi);
    }

    // Otherwise, try to fetch from scanner
    const abiFromScanner = await getContractAbiFromScanner({
      chainId,
      address,
    });
    console.log(abiFromScanner);

    if (abiFromScanner) {
      // Update database with abi
      await updateContractAbi({
        contractId: contractInDb.id,
        abi: abiFromScanner,
      });

      return JSON.stringify(abiFromScanner);
    }

    return undefined;
  } else {
    // Create new contract in database

    console.log("Creating new contract in database");

    const abiFromScanner = await getContractAbiFromScanner({
      chainId,
      address,
    });

    console.log(abiFromScanner);

    const inserted = await insertContract({
      protocolId: protocol.id,
      chainId,
      address,
      abi: abiFromScanner,
    });

    return abiFromScanner;
  }
};

export const getVerificationCodeForContract = async ({
  protocol,
  chainId,
  address,
}: {
  protocol: SelectProtocol;
  chainId: number;
  address: string;
}) => {
  const code = Math.random().toString(36).substring(7);

  // Save to check later
  await insertVerificationCodes({
    protocolId: protocol.id,
    chainId,
    address,
    code,
  });

  return code;
};
export const verifyContract = async (input: {
  protocol: SelectProtocol;
  signature: string;
  chainId: number;
  address: string;
}) => {
  const creatorAndCreationTx = await getContractCreatorAndTxHashFromScanner({
    chainId: input.chainId,
    address: input.address,
  });

  if (!creatorAndCreationTx) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Contract not found in scanner",
    });
  }

  // Get code from database
  const code = await getVerificationCode({
    protocolId: input.protocol.id,
    chainId: input.chainId,
    address: input.address,
  });

  // Check if signature matches
  const creator = creatorAndCreationTx.contractCreator;
  const signer = ethers.verifyMessage(code.code, input.signature);

  if (signer !== creator) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Signature does not match",
    });
  }

  await disableVerificationCode(code.id);

  // Disable code and set the code as verified
  await setCodeVerification({
    chainId: input.chainId,
    address: input.address,
    verification: true,
  });
};

export const saveCustomAbi = async (input: {
  protocol: SelectProtocol;
  chainId: number;
  address: string;
  abi: string;
}) => {
  const contractInDb = await getContractFromDatabase({
    chainId: input.chainId,
    address: input.address,
  });

  if (!contractInDb) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Contract not found",
    });
  }

  if (contractInDb.protocol_id !== input.protocol.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Contract not associated with protocol",
    });
  }

  await updateContractAbi({
    contractId: contractInDb.id,
    abi: input.abi,
  });
}