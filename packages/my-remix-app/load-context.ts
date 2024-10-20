import type { AppLoadContext } from "@remix-run/cloudflare";
import type { PlatformProxy } from "wrangler";
import { apiClient } from "./app/serverApiClient";

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    apiClient: ReturnType<typeof apiClient>;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: {
    cloudflare: Cloudflare;
  };
}) => Promise<AppLoadContext>;

// Hard-code a unique key, so we can look up the client when this module gets re-imported
export const getLoadContext: GetLoadContext = async ({ context }) => {
  return {
    cloudflare: context.cloudflare,
    apiClient: apiClient(context.cloudflare.env),
  };
};
