import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { createUserSession, register } from "~/utils/session.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const apiClient = context.apiClient;

  const env = {
    SUPABASE_URL: context.cloudflare.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: context.cloudflare.env.SUPABASE_ANON_KEY,
  };

  const supabase = createServerClient(
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

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser || !supabaseUser.email) {
    return redirect("/login", {
      headers,
    });
  }

  const accountRes = await apiClient.accounts[":id"].$get({
    param: { id: supabaseUser?.id },
  });

  const accountResJson = await accountRes.json();
  const account = accountResJson.account;
  if (!account) {
    await register(apiClient, {
      id: supabaseUser.id,
      email: supabaseUser.email,
    });
    return redirect("/signup", {
      headers,
    });
  }

  return createUserSession(
    { userId: account.id, redirectTo: "/home" },
    context,
  );
};
