import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden • PuQ.me",
  description: "Die gesuchte Seite existiert nicht.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl font-bold text-purple-400/30">404</div>
      <h1 className="text-2xl font-bold text-white">
        Seite nicht gefunden
      </h1>
      <p className="max-w-md text-sm text-white/60">
        Die Seite, die du suchst, existiert leider nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
