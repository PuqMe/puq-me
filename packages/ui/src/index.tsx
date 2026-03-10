import clsx from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        "rounded-[1.75rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
