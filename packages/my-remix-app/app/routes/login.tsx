import { useOutletContext } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import logoGoogle from "/images/google/logo_google.png";

export default function Login() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient;
  }>();

  const handleSignInWithGoogle = async () => {
    const origin = window.ENV.BASE_URL;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  return (
    <div>
      <h1>ログイン</h1>
      <Button
        type="button"
        onClick={handleSignInWithGoogle}
        className="bg-white border border-solid border-gray-500"
      >
        <img
          src={logoGoogle}
          alt="Google"
          width={18}
          height={18}
          decoding="async"
        />
        <span className="ml-4 font-bold text-gray-500">Googleでログイン</span>
      </Button>
    </div>
  );
}
