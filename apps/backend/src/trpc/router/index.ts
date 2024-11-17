import { router } from "..";
import { authRouter } from "./authRouter";

import { campaignsRouter } from "./campaignsRouter";
import { contractsRouter } from "./contractsRouter";

export const appRouter = router({
  campaigns: campaignsRouter,
  contracts: contractsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
