export function PageHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.22em] text-black/45">{eyebrow}</div>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-6 text-black/60">{description}</p> : null}
    </div>
  );
}
