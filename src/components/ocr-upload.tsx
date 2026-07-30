import { FileText, ScanLine, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Extracted = { label: string; value: string };

/**
 * Front-end simulation of the OCR pipeline: the file never leaves the browser,
 * extraction values shown here are demo placeholders for the ML integration.
 */
export function OcrUpload({
  title,
  hint,
  sampleFields,
  onExtract,
}: {
  title: string;
  hint: string;
  sampleFields: Extracted[];
  onExtract?: (fields: Extracted[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [fields, setFields] = useState<Extracted[] | null>(null);

  useEffect(() => {
    if (!scanning) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 8;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [scanning]);

  useEffect(() => {
    if (scanning && progress >= 100) {
      setScanning(false);
      setFields(sampleFields);
      onExtract?.(sampleFields);
    }
  }, [scanning, progress, sampleFields, onExtract]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <ScanLine className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hint}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/40 px-5 py-8 text-center transition-colors duration-300 hover:border-primary/50">
        <UploadCloud className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-3 text-sm text-foreground">
          {fileName ?? "Drop your lab report here, or browse a file"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG · up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setFields(null);
            setProgress(0);
            setScanning(true);
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Choose report
        </Button>
      </div>

      {scanning ? (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Reading report with OCR…</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {fields ? (
        <div className="animate-rise mt-5 rounded-xl border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4 text-primary" aria-hidden="true" />
            Extracted values (editable in the form below)
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="font-medium text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}