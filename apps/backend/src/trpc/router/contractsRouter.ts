import { getNotification } from "../../services/campaigns";
import { router, publicProcedure, pixelProcedure, userProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
import { z } from "zod";
import { decorateNotification } from "../../services/decorator";
import { notificationResponseSchema } from "../../../../../packages/shared/src/constants/notification";
import { trackImpression } from "../../services/impressions";
import {
  getContractAbi,
  getVerificationCodeForContract,
  saveCustomAbi,
  verifyContract,
} from "../../services/contracts";

export const contractsRouter = router({
  getContractAbi: userProcedure
    .input(
      z.object({
        chainId: z.number(),
        contractAddress: z.string(),
      })
    )
    .output(z.string().optional())
    .query(async ({ ctx, input }) => {
      console.log("getContractAbi");
      return await getContractAbi({
        protocol: ctx.protocol,
        chainId: input.chainId,
        address: input.contractAddress,
      });
    }),

  saveCustomAbi: userProcedure
    .input(
      z.object({
        chainId: z.number(),
        contractAddress: z.string(),
        abi: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await saveCustomAbi({
        protocol: ctx.protocol,
        chainId: input.chainId,
        address: input.contractAddress,
        abi: input.abi,
      });
    }),

  getContractVerificationCode: userProcedure
    .input(
      z.object({
        chainId: z.number(),
        contractAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getVerificationCodeForContract({
        protocol: ctx.protocol,
        chainId: input.chainId,
        address: input.contractAddress,
      });
    }),

  verifyContract: userProcedure
    .input(
      z.object({
        chainId: z.number(),
        contractAddress: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await verifyContract({
        protocol: ctx.protocol,
        chainId: input.chainId,
        address: input.contractAddress,
        signature: input.signature,
      });
    }),
});
