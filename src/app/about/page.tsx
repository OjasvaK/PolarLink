import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage, Section } from "@/components/legal-page";
import { imageCredits } from "@/lib/image-credits";

export const metadata: Metadata = {
  title: "About this project | PolarLink",
  description: "What PolarLink is, who built it, and credits for its photographs and data.",
};

export default function AboutPage() {
  const credits = Object.values(imageCredits);

  return (
    <LegalPage
      title="About this project"
      intro={
        <p>
          PolarLink is an archive and outreach portal for India&apos;s
          Antarctic, Arctic and Himalayan research: expedition reports,
          datasets, publications, media and institutional news in one
          searchable place, with tools to turn published entries into
          website and social media content.
        </p>
      }
    >
      <Section title="Why it exists">
        <p>
          It was built for Smart India Hackathon 2026, problem statement 26063,
          which asks for a platform to archive and disseminate information
          about India&apos;s polar research. It is a prototype and not an
          official website of NCPOR or the Government of India.
        </p>
      </Section>

      <Section title="How content gets here">
        <ul>
          <li>Researchers sign in, request researcher access, and submit material.</li>
          <li>Editors review each submission and approve, reject or request changes.</li>
          <li>Only approved material appears in the public archive, API and RSS feed.</li>
          <li>
            Editors can generate draft blurbs, captions and share images from
            published entries; drafts are labelled until an editor publishes them.
          </li>
        </ul>
      </Section>

      <Section id="sample-data" title="Sample data">
        <p>
          To demonstrate the archive before real material is loaded, PolarLink
          includes illustrative records, each marked &ldquo;Sample data&rdquo;.
          The stations, programs and coordinates they refer to are real; the
          expeditions, datasets, publications and activities themselves are
          invented, have no data files or DOIs, and are not official NCPOR
          records. Their photographs are the credited ones listed below.
        </p>
      </Section>

      <Section id="credits" title="Photograph credits">
        <p>
          None of the photographs on this site are NCPOR photographs. They are
          used under the licenses shown, from Wikimedia Commons and its sources.
        </p>
        <ul>
          {credits.map((credit) => (
            <li key={credit.file}>
              <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
                {credit.title}
              </a>
              {". "}
              {credit.credit}, {credit.license}.
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Other credits">
        <ul>
          <li>
            Map outlines from{" "}
            <a href="https://www.naturalearthdata.com" target="_blank" rel="noreferrer">Natural Earth</a>{" "}
            (public domain).
          </li>
          <li>
            Share images are set in{" "}
            <a href="https://github.com/vercel/geist-font" target="_blank" rel="noreferrer">Geist</a>{" "}
            (SIL Open Font License).
          </li>
          <li>Program milestones on the <Link href="/timeline">timeline</Link> summarise publicly documented events.</li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          Questions, corrections or takedown requests: <ContactLine />. See also
          the <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
