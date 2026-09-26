import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage, Section } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | PolarLink",
  description: "What personal data PolarLink collects, why, and your rights.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          PolarLink is a hackathon prototype, not a production service of NCPOR
          or the Government of India. This page explains, plainly, what personal
          data it handles and why.
        </p>
      }
    >
      <Section title="Who Is Responsible">
        <p>
          PolarLink is run by its Smart India Hackathon 2026 project team, who
          decide how the personal data described here is used. You can reach
          them at <ContactLine />.
        </p>
      </Section>

      <Section title="Browsing Without an Account">
        <p>
          You can browse and search the archive without signing in. We don’t
          use analytics or advertising trackers. Your theme choice (light or
          dark) is stored only in your own browser. Our hosting providers keep
          routine server logs (such as IP address and request time) for
          security and reliability, and the public API counts requests per IP
          address for a minute at a time to limit abuse.
        </p>
      </Section>

      <Section title="Signing in with Google, GitHub or ORCID">
        <p>
          Researchers, editors and administrators sign in with an existing
          account. We never see your password. When you sign in, the provider
          shares:
        </p>
        <ul>
          <li><strong>Google:</strong> your name, email address and profile picture.</li>
          <li><strong>GitHub:</strong> your name, email address and avatar.</li>
          <li><strong>ORCID</strong> (when enabled): your ORCID iD and name. ORCID does not share your email.</li>
        </ul>
        <p>
          We also store the technical account link and access tokens the
          provider returns, which our sign-in system needs to connect the
          account to your PolarLink profile.
        </p>
      </Section>

      <Section title="What Else We Store About Account Holders">
        <ul>
          <li>Your role (public, researcher, editor or administrator).</li>
          <li>
            If you request researcher access: your name, institutional
            affiliation and the reason you give, which administrators review.
          </li>
          <li>
            Content you submit (expedition reports, datasets, publications,
            media and files you upload), and editorial decisions and comments
            about it.
          </li>
          <li>
            An audit log of significant actions (for example submitting,
            approving or publishing) with who did them and when.
          </li>
        </ul>
        <p>
          Your name and email are not shown publicly or returned by the public
          API. Published archive entries do not display who submitted them.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use only the cookies needed to sign you in: a session cookie
          (HttpOnly, Secure, SameSite), a cross-site request forgery token and
          a cookie that remembers where to return after sign-in. We use no
          advertising or tracking cookies, so there is nothing to opt out of.
        </p>
      </Section>

      <Section title="Where the Data Is Kept">
        <p>
          The site is hosted on Vercel. The database and uploaded files are
          stored with Supabase, whose servers for this project are in the
          Asia-Pacific (Sydney) region, so your data may be processed outside
          India. Uploaded files are stored at unguessable links that can be
          opened by anyone who has the link.
        </p>
      </Section>

      <Section title="What We Don’t Do">
        <p>
          We do not sell, rent or share your personal data with third parties
          for marketing, and we don’t use it for anything other than
          running the archive and its review workflow.
        </p>
      </Section>

      <Section title="How Long We Keep It">
        <p>
          We keep your account and submissions while the prototype is running.
          You can ask us to delete your account at any time. Published
          contributions may be kept in the archive after your account is
          deleted, without your name attached, unless you ask for them to be
          removed as well.
        </p>
      </Section>

      <Section title="Your Rights under India’s DPDP Act, 2023">
        <p>
          PolarLink processes personal data of people in India through OAuth
          sign-in, so we follow the principles of the Digital Personal Data
          Protection Act, 2023. By signing in you consent to the processing
          described here, and you can withdraw that consent by asking us to
          delete your account. You can also ask us to:
        </p>
        <ul>
          <li>tell you what personal data we hold about you and how it is used,</li>
          <li>correct or complete inaccurate data,</li>
          <li>erase your data, and</li>
          <li>address a grievance about how your data has been handled.</li>
        </ul>
        <p>
          Contact <ContactLine /> for any of these. If you are not satisfied
          with our response, you may approach the Data Protection Board of
          India.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes, we will update the date at the top of this
          page. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
