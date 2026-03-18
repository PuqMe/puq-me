import Link from "next/link";
import { BRAND_NAME } from "@puqme/config";
import { Button, Card } from "@puqme/ui";
import { LogoMark } from "@puqme/ui";

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
    <Card className="mesh-panel w-full rounded-[2rem] p-5 text-white md:p-6">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d7b8ff]">
        <LogoMark className="h-5 w-5 shrink-0" size={20} />
        {BRAND_NAME}
      </div>
      <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</div>
      <h1 className="mt-4 text-[2rem] font-semibold leading-none text-white">{title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-white/72">{description}</p>

      <form className="mt-6 grid gap-3">
        {children}
        <Button className="mt-1 rounded-[1.2rem] bg-[#17201B] py-3.5 text-sm" type="button">
          {submitLabel}
        </Button>
      </form>

      <Link className="mt-4 inline-flex text-sm font-medium text-white/72" href={altHref}>
        {altLabel}
      </Link>
    </Card>
  );
}
