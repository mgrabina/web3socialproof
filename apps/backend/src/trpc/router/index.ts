import { router } from "..";
import { authRouter } from "./authRouter";

import { contractsRouter } from "./contractsRouter";
import { experimentsRouter } from "./experimentsRouter";

export const appRouter = router({
  experiments: experimentsRouter,
  contracts: contractsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
