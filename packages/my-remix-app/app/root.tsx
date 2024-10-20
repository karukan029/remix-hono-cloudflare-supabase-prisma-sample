import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "@remix-run/react";

import tailwindStyles from "./tailwind.css?url";

import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { type PropsWithChildren, useEffect, useState } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * Loader function to fetch environment variables for client-side use.
 * @see https://remix.run/docs/en/main/guides/envvars
 */
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const response = new Response();
  const env = {
    SUPABASE_URL: context.cloudflare.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: context.cloudflare.env.SUPABASE_ANON_KEY,
    BASE_URL: context.cloudflare.env.BASE_URL,
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
    data: { session },
  } = await supabase.auth.getSession();

  return json(
    {
      env,
      session,
    },
    {
      headers: response.headers,
    },
  );
};

function Document({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Remix,jokes" />
        <meta
          name="twitter:image"
          content="https://remix-jokes.lol/social.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Jokes" />
        <title>{title || "remix-hono-cloudflare-supabase-app-sample"}</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {/* Scriptタグを追加してJavaScriptを読み込む場合、Viteでホットリロード可能
        LiveReloadとViteのHMRで競合する可能性があるため、LiveReloadは使わない */}
        {/* <LiveReload /> */}
      </body>
    </html>
  );
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL ?? "", env.SUPABASE_ANON_KEY ?? ""),
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  return (
    <Document>
      <Outlet context={{ supabase }} />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify({ BASE_URL: env.BASE_URL })}`,
        }}
      />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
