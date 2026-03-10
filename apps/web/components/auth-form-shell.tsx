import Link from "next/link";
import { Button, Card } from "@puqme/ui";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  altLabel: string;
  altHref: string;
  children: React.ReactNode;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  submitLabel,
  altLabel,
  altHref,
  children
}: AuthFormShellProps) {
  return (
    <Card className="w-full rounded-[2rem] p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-black/45">{eyebrow}</div>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>

      <form className="mt-6 grid gap-3">
        {children}
        <Button type="button">{submitLabel}</Button>
      </form>

      <Link className="mt-4 inline-block text-sm text-black/55" href={altHref}>
        {altLabel}
      </Link>
    </Card>
  );
}
