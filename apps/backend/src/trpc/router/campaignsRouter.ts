import { getNotification } from "../../services/campaigns";
import { router, publicProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
import { z } from "zod";
import { decorateNotification } from "../../services/decorator";
import { notificationResponseSchema } from "../../constant/notification";

export const campaignsRouter = router({
  getNotification: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
      })
    )
    .output(notificationResponseSchema)
    .query(async ({ ctx, input }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      return decorateNotification(
        getNotification({
          hostname: ctx.req.hostname,
          apiKey: input.apiKey,
        })
      );
    }),
});
