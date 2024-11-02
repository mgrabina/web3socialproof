import { router } from "..";

import { utilRouter } from "./utilRouter";

export const appRouter = router({
  util: utilRouter,
});

export type AppRouter = typeof appRouter;
