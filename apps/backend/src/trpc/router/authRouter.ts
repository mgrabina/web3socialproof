import { getNotification } from "../../services/campaigns";
import { router, publicProcedure, userProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
import { z } from "zod";
import { createApiKey } from "../../services/auth";

export const authRouter = router({
  createApiKey: userProcedure
    .input(
      z.object({
        apiKey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      return await createApiKey({
        protocol: ctx.protocol,
      });
    }),
});
