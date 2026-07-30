import { createFileRoute } from "@tanstack/react-router";

import { LegalArticle, type LegalSection } from "@/components/legal-article";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — VitalSense" },
      {
        name: "description",
        content:
          "The cookies and local storage VitalSense uses to keep you signed in, and how to control them.",
      },
      { property: "og:title", content: "Cookie Policy — VitalSense" },
      {
        property: "og:description",
        content: "Strictly necessary, preference and analytics cookies explained.",
      },
    ],
  }),
  component: CookiePage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "What cookies are",
    body: "Cookies and browser local storage are small pieces of data a site keeps on your device so it can remember things between page loads, such as whether you are logged in.",
  },
  {
    heading: "Strictly necessary",
    body: "These keep the platform usable and cannot be switched off:",
    bullets: [
      "Session token so you stay logged in while moving between prediction pages.",
      "Security tokens that protect forms against cross-site request forgery.",
      "Consent record confirming you accepted the terms and medical data clause.",
    ],
  },
  {
    heading: "Preference",
    body: "Optional storage that remembers small choices, such as the last prediction page you opened or units you prefer. Clearing them only resets convenience, never your account.",
  },
  {
    heading: "Analytics",
    body: "Aggregated, anonymised page-level counts help us see which screening pages need clearer guidance. Analytics never store medical values, report contents or prediction results.",
  },
  {
    heading: "What we never do",
    body: "We do not use advertising, cross-site tracking or third-party marketing cookies, and no cookie ever carries your medical measurements or prediction outcomes.",
  },
  {
    heading: "Managing cookies",
    body: "You can clear or block cookies and local storage in your browser settings at any time. Blocking strictly necessary items will log you out and prevent predictions from running.",
  },
];

function CookiePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="A short, plain-language summary of everything VitalSense stores on your device."
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <LegalArticle sections={SECTIONS} />
      </div>
    </>
  );
}