import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
export const createContext = ({ req, res }) => ({ req, res });
const t = initTRPC.context().create({ transformer: superjson });
export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
