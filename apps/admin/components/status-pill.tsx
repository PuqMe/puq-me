export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const classes = {
    neutral: "border-white/10 bg-white/[0.05] text-slate-200",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-100"
  } as const;

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${classes[tone]}`}>{children}</span>;
}
