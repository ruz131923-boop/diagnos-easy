import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, HeartHandshake, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VitalSense — Our Team & Mission" },
      {
        name: "description",
        content:
          "VitalSense is a student research group building calm, explainable disease risk prediction with OCR and machine learning.",
      },
      { property: "og:title", content: "About VitalSense — Our Team & Mission" },
      {
        property: "og:description",
        content: "Who builds VitalSense, why it exists and how to reach us.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Target,
    title: "Explainable, not oracular",
    body: "Every prediction shows which measurements drove it, so a result can be discussed with a doctor instead of being taken on faith.",
  },
  {
    icon: HeartHandshake,
    title: "Calm by design",
    body: "People arrive here worried. Muted colour, generous spacing and gentle motion keep the experience steady rather than alarming.",
  },
  {
    icon: GraduationCap,
    title: "Academic rigour",
    body: "Models are trained on well-documented public clinical datasets and evaluated with cross-validation before they reach the interface.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A student research group building calmer health screening"
        description="VitalSense began as a group project in the Faculty of Computing. Our goal is a screening companion that turns an intimidating lab report into an understandable, actionable summary."
      />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((value, i) => (
            <div
              key={value.title}
              className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-soft"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <value.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Late detection is one of the largest drivers of poor outcomes in cardiovascular,
              metabolic, oncological and neurological disease. Reports already contain the early
              signals, but they are dense and easy to postpone. VitalSense reads those reports,
              scores them against trained models, and hands back a short explanation the reader can
              act on — while insisting the final word belongs to a doctor.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">Reach the team</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">General enquiries</dt>
                <dd className="font-medium text-foreground">hello@vitalsense.health</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Privacy & data requests</dt>
                <dd className="font-medium text-foreground">privacy@vitalsense.health</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-muted-foreground">Telephone</dt>
                <dd className="font-medium text-foreground">+94 11 234 5678</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="text-right font-medium text-foreground">
                  Faculty of Computing, Colombo 07, Sri Lanka
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}