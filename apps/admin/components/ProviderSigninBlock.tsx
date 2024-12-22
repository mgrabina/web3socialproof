import { signInWithGithub, signInWithGoogle } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function ProviderSigninBlock() {
  const isGoogleEnabled = process.env.GOOGLE_OAUTH_CLIENT_ID ? true : false;
  const isGithubEnabled = process.env.GITHUB_OAUTH_CLIENT_ID ? true : false;

  return (
    <>
      <div className="flex flex-row gap-2">
        {isGoogleEnabled && (
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            aria-label="Sign in with Google"
            type="submit"
            className="w-full"
          >
            <FaGoogle />
          </Button>
        )}
        {isGithubEnabled && (
          <Button
            onClick={signInWithGithub}
            variant="outline"
            aria-label="Sign in with Github"
            className="w-full"
          >
            <FaGithub />
          </Button>
        )}
      </div>
    </>
  );
}
