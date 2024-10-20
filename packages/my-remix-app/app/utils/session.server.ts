import {
  type AppLoadContext,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/cloudflare";

import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { apiClient as serverApiClient } from "~/serverApiClient";

type LoginForm = {
  id: string;
  email: string;
};

export async function register(
  apiClient: ReturnType<typeof serverApiClient>,
  { id, email }: LoginForm,
) {
  const response = await apiClient.accounts.create.$post({
    json: { id, email },
  });

  return { id: (await response.json()).account.id };
}

const getSessionSecret = (context: AppLoadContext) => {
  const sessionSecret = context.cloudflare.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
  }

  return sessionSecret;
};

export const getStorage = (context: AppLoadContext) =>
  createCookieSessionStorage({
    cookie: {
      name: "HS_session",
      // normally you want this to be `secure: true`
      // but that doesn't work on localhost for Safari
      // https://web.dev/when-to-use-local-https/
      secure: process.env.NODE_ENV === "production",
      secrets: [getSessionSecret(context)],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

function getUserSession(request: Request, context: AppLoadContext) {
  const storage = getStorage(context);
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request, context: AppLoadContext) {
  const session = await getUserSession(request, context);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  context: AppLoadContext,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getUserSession(request, context);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function createUserSession(
  params: { userId: string; redirectTo: string },
  context: AppLoadContext,
) {
  const { userId, redirectTo } = params;
  const storage = getStorage(context);
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getAccount(
  request: Request,
  context: AppLoadContext,
  apiClient: ReturnType<typeof serverApiClient>,
) {
  const userId = await getUserId(request, context);
  if (typeof userId !== "string") {
    return null;
  }

  const account = await apiClient.accounts[":id"].$get({
    param: { id: userId },
  });

  if (!account) {
    throw await logout(request, context);
  }

  return account;
}

export async function logout(request: Request, context: AppLoadContext) {
  const session = await getUserSession(request, context);
  const storage = getStorage(context);
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
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

  await supabase.auth.signOut();

  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
