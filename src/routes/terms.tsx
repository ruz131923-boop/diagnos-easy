import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { TermsText } from "@/components/terms-text";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — VitalSense" },
      {
        name: "description",
        content:
          "The terms governing use of VitalSense, including your consent to medical data processing for disease risk prediction.",
      },
      { property: "og:title", content: "Terms & Conditions — VitalSense" },
      {
        property: "og:description",
        content: "Service terms, medical disclaimer and medical data consent clause.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated 30 July 2026. These terms apply to every visitor and registered member of VitalSense."
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="animate-rise rounded-2xl border border-border bg-card p-8 shadow-soft">
          <TermsText />
        </div>
      </div>
    </>
  );
}