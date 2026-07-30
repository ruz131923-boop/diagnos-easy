import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, ScanText, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { DISEASES, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import heroImage from "@/assets/hero.jpg";
import heartImage from "@/assets/heart.jpg";
import diabetesImage from "@/assets/diabetes.jpg";
import breastImage from "@/assets/breast.jpg";
import parkinsonsImage from "@/assets/parkinsons.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VitalSense — Predict Heart, Diabetes, Cancer & Parkinson's Risk" },
      {
        name: "description",
        content:
          "Upload a lab report or enter your readings and let VitalSense estimate your risk of heart disease, diabetes, breast cancer or Parkinson's disease.",
      },
      { property: "og:title", content: "VitalSense — Disease Risk Prediction Platform" },
      {
        property: "og:description",
        content:
          "OCR report reading plus machine learning for four disease risk predictions, in one calm and private workspace.",
      },
    ],
  }),
  component: Home,
});

const CARD_IMAGES: Record<string, string> = {
  heart: heartImage,
  diabetes: diabetesImage,
  "breast-cancer": breastImage,
  parkinsons: parkinsonsImage,
};

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Create a secure account",
    body: "Register once with your personal, medical and account details. Guest visitors can browse, but predictions stay locked.",
  },
  {
    icon: ScanText,
    title: "Upload or type your readings",
    body: "Our OCR layer reads lab reports for heart and diabetes screening; cytology and voice metrics can be entered directly.",
  },
  {
    icon: BrainCircuit,
    title: "Read your risk explanation",
    body: "Each trained model returns a probability, the factors that drove it and clear, non-alarming next steps.",
  },
];

function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden">
        <img
          src={heroImage}
          alt="Calm hospital corridor overlaid with translucent anatomical data visuals"
          width={1920}
          height={1088}
          className="animate-hero-zoom absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)] opacity-90"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-4xl px-5 py-24 text-center">
          <p className="animate-soft-fade inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-primary-foreground backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            OCR + Machine Learning
          </p>
          <h1
            className="animate-rise mt-7 font-display text-5xl font-semibold text-primary-foreground md:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            {SITE_NAME}
          </h1>
          <p
            className="animate-rise mx-auto mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg"
            style={{ animationDelay: "260ms" }}
          >
            {SITE_TAGLINE} Understand your numbers before symptoms speak — calmly, privately and
            with a clear explanation of every result.
          </p>
          <div
            className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "400ms" }}
          >
            {user ? (
              <Link to="/dashboard">
                <Button size="lg">
                  Go to my dashboard
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg">
                  Create your free account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            )}
            <Link to="/how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Four prediction services
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            Choose the screening you need
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every disease uses its own trained model and its own set of inputs. Select a card to open
            that prediction workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {DISEASES.map((disease, i) => (
            <Link
              key={disease.key}
              to={disease.path}
              className="card-lift animate-rise group block overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={CARD_IMAGES[disease.key]}
                  alt={`${disease.name} prediction`}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-semibold ${disease.accent}`}>{disease.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {disease.short}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {disease.method}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Open prediction
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[image:var(--gradient-calm)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold text-foreground">Three calm steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-soft"
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-10 rounded-2xl border border-border bg-card p-8 shadow-soft md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">
              Privacy is part of the diagnosis
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Medical details are among the most sensitive data a person owns. VitalSense collects
              only what a model needs, keeps every record tied to your account alone, and never
              sells, publishes or shares your information with advertisers or outside parties.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/privacy-policy">
                <Button variant="outline">Read the privacy policy</Button>
              </Link>
              <Link to="/terms">
                <Button variant="ghost">Terms & conditions</Button>
              </Link>
            </div>
          </div>
          <ul className="space-y-4">
            {[
              "Consent-first: predictions run only after you agree to the medical data clause.",
              "Every report you upload is processed for your prediction and nothing else.",
              "You can request deletion of your account and medical records at any time.",
              "Results are explanations, never prescriptions — a clinician always stays in the loop.",
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
