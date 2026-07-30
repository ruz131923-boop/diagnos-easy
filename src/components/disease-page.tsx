import { useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { OcrUpload } from "@/components/ocr-upload";
import { PredictionForm } from "@/components/prediction-form";
import type { PredictionOutcome } from "@/components/prediction-result";
import type { FieldDef, Values } from "@/lib/prediction";

export type DiseasePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  accentClass: string;
  facts: { label: string; value: string }[];
  about: { heading: string; body: string }[];
  symptoms: string[];
  modelNote: string;
  ocr?: {
    title: string;
    hint: string;
    sampleFields: { label: string; value: string }[];
    mapToValues: Record<string, string>;
  };
  fields: FieldDef[];
  predict: (values: Values) => PredictionOutcome;
};

export function DiseasePage({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  accentClass,
  facts,
  about,
  symptoms,
  modelNote,
  ocr,
  fields,
  predict,
}: DiseasePageProps) {
  const [values, setValues] = useState<Values>({});

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={image}
          alt={imageAlt}
          width={1024}
          height={768}
          className="absolute inset-0 -z-10 size-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0 -z-10 bg-[image:var(--gradient-calm)] opacity-95"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className={`animate-soft-fade text-xs font-semibold uppercase tracking-[0.22em] ${accentClass}`}>
            {eyebrow}
          </p>
          <h1 className="animate-rise mt-3 max-w-3xl text-3xl font-semibold text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="animate-rise mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="animate-rise rounded-xl border border-border bg-card/90 p-4 backdrop-blur-sm"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {ocr ? (
            <AuthGate feature="Report scanning with OCR">
              <OcrUpload
                title={ocr.title}
                hint={ocr.hint}
                sampleFields={ocr.sampleFields}
                onExtract={(extracted) => {
                  const next: Values = { ...values };
                  extracted.forEach((f) => {
                    const key = ocr.mapToValues[f.label];
                    if (key) next[key] = f.value.replace(/[^\d.]/g, "");
                  });
                  setValues(next);
                }}
              />
            </AuthGate>
          ) : null}

          <div>
            <h2 className="text-xl font-semibold text-foreground">Enter your clinical values</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {modelNote}
            </p>
            <div className="mt-5">
              <AuthGate feature="This prediction model">
                <PredictionForm
                  fields={fields}
                  values={values}
                  onChange={setValues}
                  predict={predict}
                />
              </AuthGate>
            </div>
          </div>

          <section className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">About this condition</h2>
            {about.map((block) => (
              <article key={block.heading}>
                <h3 className="text-base font-semibold text-foreground">{block.heading}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-secondary/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
              Warning signs
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              {symptoms.map((s) => (
                <li key={s} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
              Before you start
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Have your most recent report at hand, use the same units shown beside each field, and
              always double-check OCR-extracted numbers against the printed report.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}