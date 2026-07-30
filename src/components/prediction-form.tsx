import { Loader2 } from "lucide-react";
import { useState } from "react";

import { PredictionResult, type PredictionOutcome } from "@/components/prediction-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDef, Values } from "@/lib/prediction";

export function PredictionForm({
  fields,
  values,
  onChange,
  predict,
  submitLabel = "Run prediction",
}: {
  fields: FieldDef[];
  values: Values;
  onChange: (values: Values) => void;
  predict: (values: Values) => PredictionOutcome;
  submitLabel?: string;
}) {
  const [outcome, setOutcome] = useState<PredictionOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (name: string, value: string) => onChange({ ...values, [name]: value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = fields.filter((f) => !values[f.name]?.trim());
    if (missing.length) {
      setError(`Please complete all ${fields.length} fields — ${missing.length} still empty.`);
      return;
    }
    setError(null);
    setRunning(true);
    setOutcome(null);
    window.setTimeout(() => {
      setOutcome(predict(values));
      setRunning(false);
    }, 1100);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field, i) => (
            <div
              key={field.name}
              className="animate-rise space-y-2"
              style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
            >
              <Label htmlFor={field.name}>
                {field.label}
                {field.fromOcr ? (
                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                    OCR
                  </span>
                ) : null}
              </Label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors duration-300 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select…</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  step="any"
                  inputMode={field.type === "number" ? "decimal" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error ? (
          <p className="animate-soft-fade mt-5 rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={running}>
            {running ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {running ? "Analysing…" : submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange({});
              setOutcome(null);
              setError(null);
            }}
          >
            Clear form
          </Button>
          <p className="text-xs text-muted-foreground">
            Values stay in your browser during this prototype session.
          </p>
        </div>
      </form>

      {outcome ? <PredictionResult outcome={outcome} /> : null}
    </div>
  );
}