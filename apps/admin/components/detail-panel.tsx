export function DetailPanel({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{subtitle}</div>
      <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </aside>
  );
}
