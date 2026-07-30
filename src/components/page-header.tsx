export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="animate-rise border-b border-border bg-[image:var(--gradient-calm)]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}