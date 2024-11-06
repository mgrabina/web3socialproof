import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

// import { homePage } from 'utils';

import { createContext } from "./trpc";
import { appRouter } from "./trpc/router";

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// Manually set CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond OK to preflight requests
  }
  next();
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// app.use('/', (_req, res) => {
//   return res.type('html').send(homePage);
// });

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
