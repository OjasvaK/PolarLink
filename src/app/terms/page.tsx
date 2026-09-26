import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage, Section } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | PolarLink",
  description: "The terms for using and contributing to PolarLink.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms cover using PolarLink and contributing to it. They are
          written for a hackathon prototype and kept short on purpose.
        </p>
      }
    >
      <Section title="What PolarLink is">
        <p>
          PolarLink is a prototype archive and outreach portal for India&apos;s
          polar and Himalayan research, built for Smart India Hackathon 2026
          (problem statement 26063). It is not an official website of the
          National Centre for Polar and Ocean Research (NCPOR) or of the
          Government of India, and nothing on it is an official statement by
          either.
        </p>
        <p>
          Some records are illustrative sample data and are labelled
          &ldquo;Sample data&rdquo;. See <Link href="/about#sample-data">About this project</Link>.
        </p>
      </Section>

      <Section title="Using the archive">
        <p>
          Anyone may browse, search and link to published content. Each
          dataset, publication and media item carries its own license or
          credit; follow it when you reuse the material. Photographs credited
          to third parties remain theirs and are used under the licenses shown.
        </p>
        <p>
          The public API and RSS feed are provided for reasonable, read-only
          use and are rate limited. Don&apos;t try to get around the limits,
          overload the service or access parts of it you aren&apos;t authorised
          to use.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You sign in with a Google, GitHub or ORCID account and are
          responsible for activity under it. New accounts have public access;
          researcher access is granted by an administrator after reviewing a
          request. Administrators may change roles or suspend accounts that
          misuse the service.
        </p>
      </Section>

      <Section title="Contributing content">
        <ul>
          <li>
            Only submit material you have the right to share, with accurate
            metadata and credits.
          </li>
          <li>
            By submitting, you allow PolarLink to store, review, publish and
            display the material, and to create derived descriptions, social
            captions and share images from its metadata.
          </li>
          <li>
            Editors may request changes to or reject submissions.
            Publication does not mean NCPOR endorses the content.
          </li>
          <li>
            Don&apos;t upload personal data about other people, confidential
            or classified information, or anything unlawful.
          </li>
        </ul>
      </Section>

      <Section title="No warranty">
        <p>
          PolarLink is provided as is, as a prototype. Content may be
          incomplete or out of date, the service may change or stop, and data
          may be lost. Verify anything important against its original source.
          To the extent the law allows, the project team is not liable for
          losses arising from use of the service.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          How we handle personal data is described in the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          We may update these terms; the date at the top shows the latest
          version. These terms are governed by the laws of India. Questions:
          contact <ContactLine />.
        </p>
      </Section>
    </LegalPage>
  );
}
