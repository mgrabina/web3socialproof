import superjson from "superjson";

import { createTRPCClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "../../../backend/src/trpc/router";

import type { inferRouterOutputs } from "@trpc/server";
import { Environment } from "@/lib/constants";
import { createSupabaseClientForServerSide } from "../supabase/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseClientForClientSide } from "../supabase/client";

// Not using tRPC API as npm package - https://github.com/mkosir/trpc-api-boilerplate#avoid-publishing-package
// import { AppRouter } from './api-types';

// type RouterOutput = inferRouterOutputs<AppRouter>;

// Uncomment bellow line if not importing tRPC API from npm package - https://github.com/mkosir/trpc-api-boilerplate#avoid-publishing-package
// import { AppRouter } from '../api-types';

// https://trpc.io/docs/client/vanilla/infer-types

export const backendUrl = (env: Environment) => {
  switch (env) {
    case "preview":
    case "production":
      return "https://web3socialproof-production.up.railway.app";
    case "development":
      return "http://localhost:4000";
    default:
      throw new Error("Invalid env");
  }
};

export const trpcApiClient = (env: Environment, token?: string) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${backendUrl(env)}/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            mode: "cors",
          });
        },
        transformer: superjson,
      }),
    ],
  });
};

export type TRPCClient = ReturnType<typeof trpcApiClient>;




