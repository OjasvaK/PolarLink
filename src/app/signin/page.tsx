import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, configuredProviders, signIn } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { imageCredits } from "@/lib/image-credits";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

export const metadata: Metadata = {
  title: "Sign In | PolarLink",
};

const photo = imageCredits.kongsfjorden;

// Auth.js redirects back here with ?error=<code> when a sign-in fails.
const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already linked to a different sign-in method. Use the provider you signed up with.",
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Sign-in is misconfigured on the server. Please try again later.",
};

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const errorCode = typeof params.error === "string" ? params.error : undefined;

  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  return (
    <div className="grid min-h-svh bg-black text-white lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src={photo.file}
          alt={photo.title}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 left-6 text-xs text-white/60 hover:text-white/90"
        >
          {photo.title}. Photo: {photo.credit} ({photo.license})
        </a>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PolarLink
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          <h1 className="text-4xl font-extrabold tracking-tight">Sign In</h1>
          <p className="mt-3 text-pretty text-white/70">
            Researchers sign in to submit expedition reports, datasets, and
            media. Anyone can browse the archive without an account.
          </p>

          {errorCode && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>
                {errorMessages[errorCode] ?? "Sign-in failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {configuredProviders.length > 0 ? (
            <div className="mt-8 flex flex-col gap-3">
              {configuredProviders.map((provider) => (
                <form
                  key={provider.id}
                  action={async () => {
                    "use server";
                    await signIn(provider.id, { redirectTo: callbackUrl });
                  }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="w-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Continue with {provider.name}
                  </Button>
                </form>
              ))}
            </div>
          ) : (
            <Alert className="mt-8 border-white/20 bg-white/5 text-white">
              <AlertDescription className="text-white/75">
                Sign-in is not available yet.
                {process.env.NODE_ENV !== "production" &&
                  " No OAuth provider is configured: add AUTH_GOOGLE_ID / AUTH_GITHUB_ID / AUTH_ORCID_ID and their secrets to .env (see .env.example), then restart the dev server."}
              </AlertDescription>
            </Alert>
          )}

          <p className="mt-8 text-sm text-white/50">
            New accounts start with public access. Researcher access is
            requested from your dashboard and approved by an administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
