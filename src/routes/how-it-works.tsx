import { Link, createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, FileSearch, LineChart, ScanText, ShieldCheck, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { DISEASES } from "@/lib/site";

function AccountCta() {
  const { ready, user, hasAccount } = useAuth();
  if (!ready) return null;
  if (user)
    return (
      <Link to="/dashboard">
        <Button>Go to my dashboard</Button>
      </Link>
    );
  if (hasAccount)
    return (
      <Link to="/login">
        <Button>Log in</Button>
      </Link>
    );
  return (
    <Link to="/register">
      <Button>Register now</Button>
    </Link>
  );
}

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How VitalSense Works — OCR & Machine Learning" },
      {
        name: "description",
        content:
          "From report upload to OCR extraction to model inference: how VitalSense turns a lab report into an explainable disease risk score.",
      },
      { property: "og:title", content: "How VitalSense Works — OCR & Machine Learning" },
      {
        property: "og:description",
        content: "The five-stage pipeline behind every VitalSense prediction.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const PIPELINE = [
  {
    icon: UserPlus,
    title: "Register once",
    body: "Your personal, medical and account details are captured a single time. Disease-specific inputs are requested later, only when needed.",
  },
  {
    icon: ScanText,
    title: "OCR extraction",
    body: "For heart and diabetes screening, uploaded reports are converted to text, then medical entities such as cholesterol or blood sugar are located and parsed.",
  },
  {
    icon: FileSearch,
    title: "Validation & normalisation",
    body: "Extracted values are unit-checked and range-checked, and you confirm each one before inference. Nothing runs on numbers you have not reviewed.",
  },
  {
    icon: BrainCircuit,
    title: "Model inference",
    body: "The relevant trained model scores your feature vector: gradient boosting for heart, random forest for diabetes, SVC for breast cancer and XGBoost for Parkinson's.",
  },
  {
    icon: LineChart,
    title: "Explained result",
    body: "You receive a risk score, a simple breakdown of what affected the result and calm, specific next steps to discuss with a doctor.",
  },
];

function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From a printed report to an explained risk score"
        description="VitalSense combines optical character recognition with disease-specific machine learning models. Here is every stage of the pipeline, in order."
      />

      <div className="mx-auto max-w-4xl px-5 py-16">
        <ol className="relative space-y-6 border-l border-border pl-8">
          {PIPELINE.map((step, i) => (
            <li
              key={step.title}
              className="animate-rise relative rounded-2xl border border-border bg-card p-6 shadow-soft"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="absolute -left-[3.05rem] flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <step.icon className="size-4" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                Stage {i + 1} · {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-12 rounded-2xl border border-border bg-secondary/50 p-8">
          <h2 className="text-xl font-semibold text-foreground">Models at a glance</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Service</th>
                  <th className="pb-3 pr-4 font-medium">Inputs</th>
                  <th className="pb-3 font-medium">Approach</th>
                </tr>
              </thead>
              <tbody>
                {DISEASES.map((d) => (
                  <tr key={d.key} className="border-b border-border/70 last:border-0">
                    <td className="py-3 pr-4">
                      <Link to={d.path} className={`font-medium hover:underline ${d.accent}`}>
                        {d.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {d.method.split(" · ")[0]}
                    </td>
                    <td className="py-3 text-muted-foreground">{d.method.split(" · ")[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Predictions require an account so your medical data stays tied to you alone. Guests can
              read every informational page freely.
            </p>
          </div>
          <AccountCta />
        </section>
      </div>
    </>
  );
}