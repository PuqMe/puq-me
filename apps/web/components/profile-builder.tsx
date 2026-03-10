import { Button, Card } from "@puqme/ui";
import { PageHeader } from "@/components/page-header";

export function ProfileBuilder() {
  return (
    <section className="grid gap-4">
      <PageHeader
        eyebrow="Create profile"
        title="Show your best side"
        description="A strong profile gets better discovery placement and stronger matches."
      />

      <Card className="rounded-[2rem] p-5">
        <div className="grid gap-3">
          <input className="rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none" placeholder="Display name" />
          <textarea className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none" placeholder="Short bio" />
          <div className="grid grid-cols-2 gap-3">
            <input className="rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none" placeholder="Age" />
            <input className="rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none" placeholder="City" />
          </div>
        </div>
      </Card>

      <Card className="rounded-[2rem] p-5">
        <div className="text-sm font-medium text-ink">Photos</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-[1.5rem] border border-dashed border-black/15 bg-white/70" />
          ))}
        </div>
      </Card>

      <Button>Save profile</Button>
    </section>
  );
}
