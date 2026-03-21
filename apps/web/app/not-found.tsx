import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden • PuQ.me",
  description: "Die gesuchte Seite existiert nicht.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: "rgba(7,5,15,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="text-8xl font-bold text-purple-400/50">404</div>
      <h1 className="text-3xl font-bold text-white drop-shadow-lg">
        Seite nicht gefunden
      </h1>
      <p className="max-w-md text-base text-white/80 drop-shadow-md">
        Die Seite, die du suchst, existiert leider nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="rounded-full bg-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 hover:shadow-purple-500/40"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
