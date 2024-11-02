import { router, publicProcedure } from "..";

export const utilRouter = router({
  test: publicProcedure.query(() => {
    return "BE Test successful!.";
  }),
});
