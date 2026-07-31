import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export type RiskLevel = "low" | "moderate" | "high";

export type PredictionOutcome = {
  level: RiskLevel;
  score: number;
  headline: string;
  detail: string;
  factors: { label: string; weight: number }[];
  advice: string[];
};

const LEVEL_STYLE: Record<RiskLevel, { chip: string; bar: string; label: string }> = {
  low: {
    chip: "bg-parkinsons-soft text-success",
    bar: "bg-success",
    label: "Low risk",
  },
  moderate: {
    chip: "bg-diabetes-soft text-brown",
    bar: "bg-warning",
    label: "Moderate risk",
  },
  high: {
    chip: "bg-heart-soft text-destructive",
    bar: "bg-destructive",
    label: "Elevated risk",
  },
};

export function PredictionResult({ outcome }: { outcome: PredictionOutcome }) {
  const style = LEVEL_STYLE[outcome.level];
  const Icon =
    outcome.level === "low" ? CheckCircle2 : outcome.level === "moderate" ? AlertTriangle : ShieldAlert;

  return (
    <section
      aria-live="polite"
      className="animate-rise mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${style.chip}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {style.label}
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{outcome.headline}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {outcome.detail}
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-border bg-secondary/60 px-6 py-5 text-center">
          <p className="font-display text-4xl font-semibold text-foreground">{outcome.score}%</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Model confidence
          </p>
        </div>
      </div>

      <div className="border-t border-border p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Contributing factors
        </h3>
        <ul className="mt-4 space-y-3">
          {outcome.factors.map((factor) => (
            <li key={factor.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{factor.label}</span>
                <span className="font-medium text-foreground">{factor.weight}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`animate-grow-bar h-full rounded-full ${style.bar}`}
                  style={{ width: `${Math.min(100, factor.weight)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border bg-secondary/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Suggested next steps
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {outcome.advice.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          This output is a probabilistic estimate, not a diagnosis. Please review it with a licensed
          doctor.
        </p>
      </div>
    </section>
  );
}