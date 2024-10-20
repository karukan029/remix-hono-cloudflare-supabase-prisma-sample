import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getUserId } from "~/utils/session.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const apiClient = context.apiClient;
  const headers = new Headers();
  const userId = await getUserId(request, context);
  if (userId === null) {
    return redirect("/login", {
      headers,
    });
  }
  headers.append("Cookie", `userId=${userId}`);

  try {
    const profileResJson = await apiClient.profiles.me.$get(
      {},
      {
        headers: {
          Cookie: headers.get("Cookie") ?? "",
        },
      },
    );
    if (profileResJson.status === 401) {
      return redirect("/auth_error", {
        headers: request.headers,
      });
    }
    if (profileResJson.status) {
      const profileJson = await profileResJson.json();

      if (!profileJson.profile) {
        return redirect("/signup", {
          headers: request.headers,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return redirect("/auth_error", {
      headers: request.headers,
    });
  }
};

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to Remix!</p>
    </div>
  );
}
