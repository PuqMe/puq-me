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
      <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</div>
      <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
      {description ? <p className="mt-3 text-sm leading-6 text-white/72">{description}</p> : null}
    </div>
  );
}
