import { router } from "..";

import { campaignsRouter } from "./campaignsRouter";

export const appRouter = router({
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
