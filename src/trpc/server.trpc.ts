import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cookies, headers as nextHeaders } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "./*";
import { createTRPCContext } from "./*";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const headers = new Headers(await nextHeaders());
  headers.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers,
    cookies: await cookies(),
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
