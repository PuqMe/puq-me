import { AuthGuard } from "@/components/auth-guard";
import { SettingsPanel } from "@/components/settings-panel";

export default function SettingsPage() {
  return (
    <main className="safe-px safe-pb mx-auto min-h-screen w-full max-w-md py-6">
      <AuthGuard>
        <SettingsPanel />
      </AuthGuard>
    </main>
  );
}
