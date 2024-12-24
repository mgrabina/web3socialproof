import * as Sentry from "@sentry/node";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { SelectProtocol, SelectUser } from "@web3socialproof/db";
import superjson from "superjson";
import { verifyApiKey, verifySupabaseToken } from "../services/auth";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

type BaseContext = inferAsyncReturnType<typeof createContext>;

// Define an extended context type that includes properties added in the middleware
type UserContext = BaseContext & {
  user: SelectUser;
  protocol: SelectProtocol;
};

type PixelContext = BaseContext & {
  protocol: SelectProtocol;
};

const t = initTRPC.context<BaseContext>().create({ transformer: superjson });

export const pixelAuthMiddleware = t.middleware(
  async ({ input, ctx, next }) => {
    const authHeader = ctx.req.headers.authorization;

    if (authHeader?.startsWith("Api-Key ")) {
      // From the pixel

      const apiKey = authHeader.replace("Api-Key ", "");
      const apiKeyCtx = await verifyApiKey(apiKey);

      // Return the next function with the extended context
      return next({
        ctx: {
          ...ctx,
          ...apiKeyCtx,
        } as PixelContext,
      });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid authorization header",
    });
  }
);

export const userAuthMiddleware = t.middleware(async ({ input, ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    // From the frontend
    const token = authHeader.replace("Bearer ", "");

    const userCtx = await verifySupabaseToken(token);

    return next({
      ctx: {
        ...ctx,
        ...userCtx,
      } as UserContext,
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid authorization header",
  });
});

export const middleware = t.middleware;

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  })
);

export const router = t.router;
export type AppRouter = typeof t.router;

export const publicProcedure = t.procedure.use(sentryMiddleware);
export const pixelProcedure = t.procedure
  .use(sentryMiddleware)
  .use(pixelAuthMiddleware);
export const userProcedure = t.procedure
  .use(sentryMiddleware)
  .use(userAuthMiddleware);
