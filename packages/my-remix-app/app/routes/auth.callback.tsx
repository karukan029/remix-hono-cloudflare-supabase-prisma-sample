import { redirect } from "@remix-run/cloudflare";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const env = {
    SUPABASE_URL: context.cloudflare.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: context.cloudflare.env.SUPABASE_ANON_KEY,
  };
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabaseClient = createServerClient(
      env.SUPABASE_URL ?? "",
      env.SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get("Cookie") ?? "");
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              headers.append(
                "Set-Cookie",
                serializeCookieHeader(name, value, options),
              );
            }
          },
        },
      },
    );

    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect("/auth", {
        headers,
      });
    }
  }

  // return the user to an error page with instructions
  return redirect("/auth_error", { headers: headers });
};
