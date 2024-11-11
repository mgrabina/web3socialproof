import { router } from "..";
import { authRouter } from "./authRouter";

import { campaignsRouter } from "./campaignsRouter";

export const appRouter = router({
  campaigns: campaignsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
