import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { ResearcherStatus, Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

// ORCID has no built-in Auth.js provider, but it is a standard OIDC issuer,
// so the generic OIDC provider covers it (spec section 5). The issuer is the
// sandbox until a production ORCID client is approved. ORCID’s OIDC profile
// carries no email, so ORCID-only users have `email = null`.
function Orcid(): Provider {
  return {
    id: "orcid",
    name: "ORCID",
    type: "oidc",
    issuer: process.env.AUTH_ORCID_ISSUER ?? "https://sandbox.orcid.org",
    authorization: { params: { scope: "openid" } },
    profile(profile) {
      const name = [profile.given_name, profile.family_name].filter(Boolean).join(" ");
      return { id: profile.sub, name: name || profile.sub, email: null, image: null };
    },
  };
}

// Only offer a provider once its client is actually registered, so the
// sign-in page never shows a button that cannot complete a real OAuth flow.
const providers: Provider[] = [];
// Google and GitHub both return verified email addresses, so signing in with
// either one reaches the same account when the emails match (otherwise
// Auth.js refuses the second provider with OAuthAccountNotLinked).
if (process.env.AUTH_GOOGLE_ID) providers.push(Google({ allowDangerousEmailAccountLinking: true }));
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub({ allowDangerousEmailAccountLinking: true }));
if (process.env.AUTH_ORCID_ID) providers.push(Orcid());

export const configuredProviders = providers.map((provider) => {
  const { id, name } = typeof provider === "function" ? provider() : provider;
  return { id, name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter is typed against @prisma/client’s default export, which
  // Prisma 7 no longer populates; this project’s client is generated to
  // src/generated/prisma and exposes the same model API the adapter uses.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  // Database sessions: role and researcher status are read from the User row
  // on every session lookup, so an Admin’s role change applies immediately.
  session: { strategy: "database" },
  providers,
  // Errors come back to our own sign-in page (with ?error=) instead of
  // Auth.js's unstyled default error page.
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    session({ session, user }) {
      const dbUser = user as typeof user & {
        role: Role;
        researcherStatus: ResearcherStatus;
      };
      // Return only what the app needs: with database sessions Auth.js
      // passes the whole User row, which /api/auth/session would otherwise
      // expose in full (request reason, affiliation, timestamps).
      return {
        expires: session.expires,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          role: dbUser.role,
          researcherStatus: dbUser.researcherStatus,
        },
      };
    },
  },
});
