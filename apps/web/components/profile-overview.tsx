import { AppShell } from "@/components/app-shell";
import { Card } from "@puqme/ui";

const interests = ["Live music", "City trips", "Pilates", "Coffee bars", "Sunday markets"];

export function ProfileOverview() {
  return (
    <AppShell active="/profile" title="Profile" subtitle="Tune your profile quality and discovery strength">
      <section className="grid gap-4">
        <Card className="rounded-[2rem] p-5">
          <div className="flex items-start gap-4">
            <div className="h-24 w-20 rounded-[1.5rem] bg-gradient-to-br from-coral to-amber" />
            <div className="flex-1">
              <div className="text-2xl font-semibold text-ink">Lina, 27</div>
              <div className="mt-1 text-sm text-black/55">Berlin · Verified · Active today</div>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Design lead, sunrise runner, always looking for new dinner spots with great music.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">Profile quality</div>
              <div className="mt-1 text-sm text-black/55">Higher quality profiles get stronger discovery placement.</div>
            </div>
            <div className="text-3xl font-semibold text-ink">86</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/10">
            <div className="h-2 w-[86%] rounded-full bg-gradient-to-r from-coral to-amber" />
          </div>
        </Card>

        <Card className="rounded-[2rem] p-5">
          <div className="text-sm font-semibold text-ink">Interests</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="rounded-full bg-stone px-3 py-2 text-xs font-medium text-black/65">
                {interest}
              </span>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
