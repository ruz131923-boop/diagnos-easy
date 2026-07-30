export type LegalSection = { heading: string; body: string; bullets?: string[] };

export function LegalArticle({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="animate-rise space-y-7 rounded-2xl border border-border bg-card p-8 shadow-soft">
      {sections.map((section) => (
        <article key={section.heading}>
          <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          {section.bullets ? (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {section.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}