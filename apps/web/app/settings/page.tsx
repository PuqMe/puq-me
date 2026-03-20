import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { SettingsPanel } from "@/components/settings-panel";

export const metadata: Metadata = {
  title: "Einstellungen • PuQ.me",
  description: "App-Einstellungen und Konto",
  openGraph: {
    title: "Einstellungen • PuQ.me",
    description: "App-Einstellungen und Konto",
  },
};

export default function SettingsPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <SettingsPanel />
      </AuthGuard>
    </main>
  );
}
