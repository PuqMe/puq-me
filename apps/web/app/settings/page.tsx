import { AuthGuard } from "@/components/auth-guard";
import { SettingsPanel } from "@/components/settings-panel";

export default function SettingsPage() {
  return (
    <main className="page-shell safe-px safe-pb">
      <AuthGuard>
        <SettingsPanel />
      </AuthGuard>
    </main>
  );
}
