import { AppShell } from "@/components/app-shell";
import { PushPermissionCard } from "@/components/push-permission-card";

const rows = [
  "Push notifications",
  "Offline downloads",
  "Distance radius",
  "Age preferences",
  "Blocked users",
  "Privacy and safety"
];

export function SettingsPanel() {
  return (
    <AppShell active="/settings" title="Settings" subtitle="Preferences, notifications and safety controls">
      <section className="grid gap-3">
        <PushPermissionCard />
        {rows.map((row) => (
          <article key={row} className="glass-card flex items-center justify-between rounded-[2rem] px-4 py-4">
            <div className="text-sm font-medium text-white">{row}</div>
            <div className="h-7 w-12 rounded-full bg-white/10 p-1">
              <div className="h-5 w-5 rounded-full bg-[#A855F7] shadow-sm" />
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
