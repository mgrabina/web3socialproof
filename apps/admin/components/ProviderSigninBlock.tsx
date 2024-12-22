"use client";

import { Button } from "@/components/ui/button";
import { PUBLIC_URL } from "@/lib/constants";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

export default function ProviderSigninBlock() {
  const isGoogleEnabled = process.env.GOOGLE_OAUTH_CLIENT_ID ? true : false;
  const isGithubEnabled = process.env.GITHUB_OAUTH_CLIENT_ID ? true : false;
  const router = useRouter();

  async function signInWithGoogle() {
    const supabase = createSupabaseClientForClientSide();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${PUBLIC_URL()}/auth/callback`,
      },
    });

    if (error) {
      console.error(
        "error on login:",
        error.message,
        error.code,
        error.stack,
        error.status
      );
    }

    if (data.url) {
      router.push(data.url);
      // redirect(data.url); // use the redirect API for your server framework
    }
  }

  return (
    <div className="flex flex-row gap-2">
      <Button
        onClick={() => signInWithGoogle()}
        variant="outline"
        aria-label="Sign in with Google"
        type="submit"
        className="w-full"
      >
        <FaGoogle />
      </Button>
    </div>
  );
}
