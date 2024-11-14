import { getNotification } from "../../services/campaigns";
import { router, publicProcedure, pixelProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
import { z } from "zod";
import { decorateNotification } from "../../services/decorator";
import { notificationResponseSchema } from "../../../../../packages/shared/src/constants/notification";
import { trackImpression } from "../../services/impressions";

export const campaignsRouter = router({
  getNotification: pixelProcedure
    .input(z.object({}))
    .output(notificationResponseSchema)
    .query(async ({ ctx, input }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      return await decorateNotification(
        await getNotification({
          hostname: ctx.req.hostname,
          protocol: ctx.protocol,
        })
      );
    }),

  trackImpression: pixelProcedure
    .input(
      z.object({
        campaignId: z.number(),
        session: z.string(),
        user: z.string(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await trackImpression({
        campaignId: input.campaignId,
        session: input.session,
        user: input.user,
        address: input.address,
      });
    }),
});
