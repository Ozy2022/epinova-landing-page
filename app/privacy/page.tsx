import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { contact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy — EpiNova",
  description: "How EpiNova handles information submitted through this site.",
  robots: { index: false },
};

/** Minimal, factual privacy note covering exactly what this site does. */
export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl px-6 py-24 md:px-10">
      <Link
        href="/"
        className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
        aria-label="EpiNova — back to home"
      >
        <Logo />
      </Link>

      <h1 className="type-h2 mt-14">Privacy</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-secondary">
        <p>
          This site collects only the information you choose to submit through
          the contact form — your name, work email, organisation, role and
          message. It is used solely to respond to your enquiry and is not
          shared with third parties or used for marketing.
        </p>
        <p>
          The site uses privacy-friendly analytics (Vercel Analytics) that do
          not use cookies and do not track you across sites. No other cookies
          are set.
        </p>
        <p>
          No patient data, genetic data or health information is collected
          through this website.
        </p>
        <p>
          To ask about or request deletion of information you have submitted,
          email{" "}
          <a
            href={`mailto:${contact.details.email}`}
            className="text-primary underline decoration-line-strong underline-offset-2"
          >
            {contact.details.email}
          </a>
          .
        </p>
      </div>

      <Link
        href="/"
        className="mt-14 inline-flex items-center gap-2 text-sm text-teal-300 transition-colors duration-200 hover:text-teal-400"
      >
        ← Back to epinova.co
      </Link>
    </main>
  );
}
