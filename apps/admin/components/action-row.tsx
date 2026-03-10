import { Button } from "@puqme/ui";

export function ActionRow({
  primaryLabel,
  secondaryLabel,
  dangerLabel
}: {
  primaryLabel: string;
  secondaryLabel?: string;
  dangerLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="bg-[linear-gradient(135deg,#ff8a4c,#ff6930)] text-white hover:opacity-100">
        {primaryLabel}
      </Button>
      {secondaryLabel ? (
        <Button className="bg-white/[0.06] text-white hover:opacity-100">{secondaryLabel}</Button>
      ) : null}
      {dangerLabel ? (
        <Button className="bg-rose-500/90 text-white hover:opacity-100">{dangerLabel}</Button>
      ) : null}
    </div>
  );
}
