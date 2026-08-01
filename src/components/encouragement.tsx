import { HeartPulse, Sparkles, Smile, ShieldCheck } from "lucide-react";

const DOODLES = [
  { Icon: HeartPulse, className: "text-heart", delay: "0ms" },
  { Icon: Sparkles, className: "text-accent", delay: "600ms" },
  { Icon: Smile, className: "text-parkinsons", delay: "1200ms" },
  { Icon: ShieldCheck, className: "text-primary", delay: "1800ms" },
];

export function Encouragement({
  title = "You are taking a good step",
  message = "Every answer you fill in makes your result more accurate. It only takes a few minutes.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="animate-rise card-lift relative overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-calm)] p-6">
      <div className="flex items-start gap-4">
        <span className="animate-pulse-soft flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4" aria-hidden="true">
        {DOODLES.map(({ Icon, className, delay }, i) => (
          <span
            key={i}
            className={`animate-float ${className}`}
            style={{ animationDelay: delay }}
          >
            <Icon className="size-5" />
          </span>
        ))}
        <span className="animate-wiggle text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Keep going
        </span>
      </div>
    </div>
  );
}
