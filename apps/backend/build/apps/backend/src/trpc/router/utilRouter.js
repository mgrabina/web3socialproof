import { router, publicProcedure } from "..";
import { db, usersTable } from "@web3socialproof/db";
export const utilRouter = router({
    test: publicProcedure.query(async () => {
        const a = await db.select().from(usersTable).execute();
        console.log(a);
        return "BE Test successful!.";
    }),
});
