import { getNotification } from "../../services/campaigns";
import { router, publicProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
import { z } from "zod";

export const campaignsRouter = router({
  createApiKey: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      return getNotification({
        hostname: ctx.req.hostname,
        apiKey: input.apiKey,
      });
    }),
});
