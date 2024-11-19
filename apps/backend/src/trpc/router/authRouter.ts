import { router, userProcedure } from "..";
import { z } from "zod";
import { createApiKey } from "../../services/auth";

export const authRouter = router({
  createApiKey: userProcedure
    .input(
      z.object({
        apiKey: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      // Todo: get user data to improve the notification (e.g. wallet, device, language, etc.)

      return await createApiKey({
        protocol: ctx.protocol,
      });
    }),
});
