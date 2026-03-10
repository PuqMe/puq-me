export function ScreenHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}
