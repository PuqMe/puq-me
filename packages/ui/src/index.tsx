import clsx from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";

type LogoMarkProps = {
  className?: string;
  size?: number;
};

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

export function LogoMark({ className, size = 40 }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="23" cy="32" r="14" stroke="#A855F7" strokeWidth="4.5" />
      <circle cx="41" cy="32" r="14" stroke="#A855F7" strokeWidth="4.5" />
      <path
        d="M32 18.5C36.8 21.8 41 27 41 32s-4.2 10.2-9 13.5C27.2 42.2 23 37 23 32s4.2-10.2 9-13.5Z"
        stroke="#A855F7"
        strokeLinejoin="round"
        strokeWidth="4.5"
      />
      <circle cx="32" cy="32" r="5.25" fill="#A855F7" />
    </svg>
  );
}
