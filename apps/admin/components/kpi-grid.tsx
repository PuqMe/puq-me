type KpiItem = {
  label: string;
  value: string;
  delta: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<KpiItem["tone"]>, string> = {
  neutral: "text-slate-300",
  positive: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-rose-300"
};

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        >
          <div className="text-sm text-slate-400">{item.label}</div>
          <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
          <div className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[item.tone ?? "neutral"]}`}>
            {item.delta}
          </div>
        </div>
      ))}
    </section>
  );
}
