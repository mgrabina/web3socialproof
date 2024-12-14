// Our internal api retriving and saving data to our database.
// Database connection it at @service/db package

import { TRPCError } from "@trpc/server";
import {
  and,
  apiKeyTable,
  contractsTable,
  conversionsTable,
  db,
  desc,
  eq,
  gt,
  impressionsTable,
  protocolTable,
  SelectVariant,
  usersTable,
  variantsTable,
  verificationCodesTable,
} from "@web3socialproof/db";

export const getVariant = async (variantId: number) => {
  // Check if variant exists
  const variant = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.id, Number(variantId)));

  if (variant.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Variant not found",
    });
  }

  return variant[0];
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
  variant: SelectVariant;
  user: string;
  session: string;
  address?: string;
}) => {
  const inserted = await db
    .insert(impressionsTable)
    .values({
      session: input.session,
      user: input.user,
      variant_id: input.variant.id,
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

export const saveConversionInDb = async (input: {
  protocolId: number;
  variantId?: number;
  user: string;
  session: string;
  hostname?: string;
  pathname?: string;
  elementId?: string;
}) => {
  const inserted = await db
    .insert(conversionsTable)
    .values({
      protocol_id: input.protocolId,
      session: input.session,
      user: input.user,
      variant_id: input.variantId,
      hostname: input.hostname,
      pathname: input.pathname,
      element_id: input.elementId,
    })
    .returning();

  if (inserted.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to track conversion",
    });
  }
};

export const getContractFromDatabase = async ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}) => {
  const contract = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.chain_id, chainId),
        eq(contractsTable.contract_address, address)
      )
    );

  return contract.length > 0 ? contract[0] : undefined;
};

export const updateContractAbi = async ({
  contractId,
  abi,
}: {
  contractId: number;
  abi: string;
}) => {
  const updated = await db
    .update(contractsTable)
    .set({
      contract_abi: abi,
    })
    .where(eq(contractsTable.id, contractId))
    .returning();

  if (updated.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update contract abi",
    });
  }
};

export const insertContract = async ({
  protocolId,
  chainId,
  address,
  abi,
}: {
  protocolId: number;
  chainId: number;
  address: string;
  abi: string;
}) => {
  const inserted = await db
    .insert(contractsTable)
    .values({
      protocol_id: protocolId,
      chain_id: chainId,
      contract_address: address,
      contract_abi: abi,
    })
    .returning();

  if (inserted.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to insert contract",
    });
  }
};

export const insertVerificationCodes = async (input: {
  protocolId: number;
  chainId: number;
  address: string;
  code: string;
}) => {
  const inserted = await db
    .insert(verificationCodesTable)
    .values({
      protocol_id: input.protocolId,
      chain_id: input.chainId,
      contract_address: input.address,
      code: input.code,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      enabled: true,
    })
    .returning();

  if (inserted.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to insert verification code",
    });
  }
};

export const disableVerificationCode = async (codeId: number) => {
  const updated = await db
    .update(verificationCodesTable)
    .set({
      enabled: false,
    })
    .where(eq(verificationCodesTable.id, codeId))
    .returning();

  if (updated.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update verification code",
    });
  }
};

export const getVerificationCode = async ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}) => {
  const codes = await db
    .select()
    .from(verificationCodesTable)
    .where(
      and(
        eq(verificationCodesTable.chain_id, chainId),
        eq(verificationCodesTable.contract_address, address),
        eq(verificationCodesTable.enabled, true),
        gt(verificationCodesTable.expiration, new Date().toISOString())
      )
    )
    .orderBy(desc(verificationCodesTable.expiration));

  if (codes.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Verification code not found",
    });
  }

  return codes[0];
};

export const setCodeVerification = async ({
  chainId,
  address,
  verification,
}: {
  chainId: number;
  address: string;
  verification: boolean;
}) => {
  const updated = await db
    .update(contractsTable)
    .set({
      ownership_verified: verification,
    })
    .where(
      and(
        eq(contractsTable.chain_id, chainId),
        eq(contractsTable.contract_address, address)
      )
    )
    .returning();

  if (updated.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update contract verification",
    });
  }
};
