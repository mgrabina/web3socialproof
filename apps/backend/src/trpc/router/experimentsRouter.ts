import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { pixelProcedure, router } from "..";
import { herdSchema } from "../../../../../packages/shared/src/constants/notification";
import { trackConversion } from "../../services/conversions";
import { decorateNotification } from "../../services/decorator";
import { getExperimentVariant } from "../../services/experiments";
import { trackImpression } from "../../services/impressions";

export const experimentsRouter = router({
  getNotification: pixelProcedure
    .input(z.object({}))
    .output(herdSchema.optional())
    .query(async ({ ctx, input }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      const originUrl = ctx.req.get("origin");

      if (!originUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Origin header is required",
        });
      }

      return await decorateNotification(
        await getExperimentVariant({
          hostname: originUrl,
          protocol: ctx.protocol,
        })
      );
    }),

  trackImpression: pixelProcedure
    .input(
      z.object({
        experimentId: z.number(),
        variantId: z.number().optional(),
        session: z.string(),
        user: z.string(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await trackImpression({
        protocolId: ctx.protocol.id,
        experimentId: input.experimentId,
        variantId: input.variantId,
        session: input.session,
        user: input.user,
        address: input.address,
      });
    }),

  trackConversion: pixelProcedure
    .input(
      z.object({
        experimentId: z.number(),
        variantId: z.number().optional(),
        session: z.string(),
        user: z.string(),
        hostname: z.string().optional(),
        pathname: z.string().optional(),
        elementId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const protocol = ctx.protocol;

      await trackConversion({
        protocol: protocol.id,
        experimentId: input.experimentId,
        variantId: input.variantId,
        session: input.session,
        user: input.user,
        hostname: input.hostname,
        pathname: input.pathname,
        elementId: input.elementId,
      });
    }),
});
