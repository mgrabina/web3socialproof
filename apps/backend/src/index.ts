import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

// import { homePage } from 'utils';

import { createContext } from "./trpc";
import { appRouter } from "./trpc/router";

const app = express();

// Allow any origin, any method, and any header with CORS
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: "*", // Allow all methods (GET, POST, PUT, DELETE, etc.)
    allowedHeaders: "*", // Allow all headers
    credentials: true, // Allow cookies and authorization headers
  })
);

// Explicitly handle OPTIONS requests to ensure they return the correct CORS headers
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.sendStatus(200);
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
  console.info(`Server running on port ${PORT}`);
});
