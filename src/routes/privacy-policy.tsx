import { createFileRoute } from "@tanstack/react-router";

import { LegalArticle, type LegalSection } from "@/components/legal-article";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VitalSense" },
      {
        name: "description",
        content:
          "How VitalSense collects, protects and limits the use of your personal and medical information.",
      },
      { property: "og:title", content: "Privacy Policy — VitalSense" },
      {
        property: "og:description",
        content: "Data minimisation, encryption, retention and your rights over your medical data.",
      },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: "We collect only what a prediction requires, in three groups:",
    bullets: [
      "Personal details: full name, name with initials, date of birth, gender, email address, contact number.",
      "Medical details: height, weight, blood group, plus the disease-specific values you enter or that OCR extracts from your reports.",
      "Account details: username and a password that is never stored in readable form.",
    ],
  },
  {
    heading: "Why we collect it",
    body: "Your data is processed for one purpose: generating and displaying your own disease risk predictions, and letting you revisit them later. We do not profile you for marketing and we run no advertising on the platform.",
  },
  {
    heading: "Who can see your data",
    body: "Only you. Nobody outside your account — including other members, advertisers, insurers or employers — is shown your medical information. Access by the research team is restricted to the minimum needed for maintenance and is logged.",
  },
  {
    heading: "How we protect it",
    body: "Security is layered rather than a single control:",
    bullets: [
      "Encryption in transit (HTTPS/TLS) and at rest for stored records.",
      "Passwords are salted and hashed, never recoverable in plain text.",
      "Uploaded reports are used for extraction and then retained only while your account keeps the related prediction.",
      "Session timeouts and per-account isolation of every medical record.",
    ],
  },
  {
    heading: "Retention and deletion",
    body: "You can delete any stored prediction, and deleting your account removes your personal details, medical details and uploaded reports. Fully anonymised accuracy statistics, which cannot be traced to you, may be retained for model evaluation.",
  },
  {
    heading: "Your rights",
    body: "You may request a copy of your data, correct inaccurate details, withdraw your medical data consent, or ask for erasure. Write to privacy@vitalsense.health and we will respond within 30 days.",
  },
  {
    heading: "Children",
    body: "VitalSense is not intended for children under 18. If you believe a minor has registered, contact us so the account can be removed.",
  },
  {
    heading: "Prototype notice",
    body: "This build is a front-end university prototype. No server is connected: any data you enter stays inside your own browser storage on this device and is never transmitted.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Medical data deserves stricter handling than ordinary personal data. This policy explains exactly what VitalSense does and does not do with yours."
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <LegalArticle sections={SECTIONS} />
      </div>
    </>
  );
}