import superjson from "superjson";

import { createTRPCClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "../../../apps/backend/src/trpc/router";

import type { inferRouterOutputs } from "@trpc/server";
import { PixelEnv } from "./constants";

// Not using tRPC API as npm package - https://github.com/mkosir/trpc-api-boilerplate#avoid-publishing-package
// import { AppRouter } from './api-types';

// type RouterOutput = inferRouterOutputs<AppRouter>;

// Uncomment bellow line if not importing tRPC API from npm package - https://github.com/mkosir/trpc-api-boilerplate#avoid-publishing-package
// import { AppRouter } from '../api-types';

// https://trpc.io/docs/client/vanilla/infer-types

export const backendUrl = (env: PixelEnv) => {
  switch (env) {
    case "test":
    case "production":
      return "https://web3socialproof-production.up.railway.app:4000";
    case "development":
      return "http://localhost:4000";
    default:
      throw new Error("Invalid env");
  }
};

export const trpcApiClient = (env: PixelEnv) =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:4000/trpc",
        // You can pass any HTTP headers you wish here
        // async headers() {
        //   return {
        //     authorization: getAuthCookie(),
        //   };
        // },
        transformer: superjson,
      }),
    ],
  });
