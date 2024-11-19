import { router, publicProcedure, userProcedure } from "..";
import { z } from "zod";
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

  verifyContract: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        contractAddress: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await verifyContract({
        chainId: input.chainId,
        address: input.contractAddress,
        signature: input.signature,
      });
    }),
});
