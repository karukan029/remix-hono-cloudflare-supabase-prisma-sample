import type { AppType } from "hono-backend-app";
import { hc } from "hono/client";

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
export const apiClient = (env: Env) =>
  hc<AppType>(env.BACKEND_URL, {
    fetch: env.HONO_BACKEND_APP.fetch.bind(env.HONO_BACKEND_APP) as unknown as (
      input: RequestInfo | URL,
      requestInit?: RequestInit,
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      Env?: Env,
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      executionCtx?: ExecutionContext,
    ) => Promise<Response>,
  });
