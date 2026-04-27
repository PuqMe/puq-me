"use client";
import { Screen, StatusBar, PinIcon } from "../chrome";
import { ScreenHeader, SectionLabel, Card, Pill, Avatar, FootBar, PrimaryBtn } from "../ui";

/* Screen 51 — Date Check / SOS */
export function S51_DateCheck() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <div className="text-[10.5px] font-bold tracking-[0.2em] text-puq-pink">⚠ DATE CHECK · 21:30</div>
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 text-center">
        <div className="mt-2">
          <h1 className="text-[24px] font-bold">Alles ok bei dir?</h1>
          <p className="mt-2 text-[12.5px] text-puq-muted">Du hast vor 30 Min Lukas getroffen.</p>
        </div>
        <div className="relative mt-8 grid h-56 w-56 place-items-center rounded-full bg-puq-danger shadow-[0_0_60px_rgba(255,71,87,0.6)]">
          <div className="absolute inset-3 animate-puq-radar rounded-full border border-puq-danger/40" />
          <div className="text-center">
            <div className="text-3xl font-bold">SOS</div>
            <div className="text-[11.5px] mt-1">3 Sek. drücken</div>
          </div>
        </div>
        <p className="mt-4 text-[11.5px] text-puq-muted">Bei Druck: Notruf + Standort an Vertrauensperson.</p>
        <div className="mt-6 grid w-full grid-cols-3 gap-2">
          <button className="rounded-2xl border-2 border-puq-mint/50 bg-puq-mint/10 py-3 text-[12px] font-bold text-puq-mint">Alles gut</button>
          <button className="rounded-2xl border-2 border-puq-lemon/50 bg-puq-lemon/10 py-3 text-[12px] font-bold text-puq-lemon">Will gehen</button>
          <button className="rounded-2xl border-2 border-puq-danger/60 bg-puq-danger/10 py-3 text-[12px] font-bold text-puq-danger">Brauche Hilfe</button>
        </div>
        <Card className="mt-5 w-full border-puq-line-2/40 text-left">
          <SectionLabel color="muted">TRUSTED CONTACT · WILL BE NOTIFIED</SectionLabel>
          <div className="mt-2 flex items-center gap-3">
            <Avatar initials="SM" color="pink" size={36} />
            <div className="flex-1">
              <div className="text-[13px] font-bold">Sarah M. · Schwester</div>
              <div className="text-[11px] text-puq-mint">Erreichbar · ✓ live</div>
            </div>
            <span className="text-[12px] font-bold text-puq-pink">Ändern ›</span>
          </div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 52 — Live Location */
export function S52_LiveLocation() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Live Location" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">● LIVE SEIT 32 MIN</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">Sarah sieht dich<em className="block font-serif italic text-puq-pink">in Echtzeit.</em></h1>
        <Card className="mt-4 h-44 overflow-hidden border-puq-line-2/40 p-0">
          <div className="relative h-full w-full bg-puq-night">
            <svg viewBox="0 0 200 130" className="absolute inset-0 h-full w-full opacity-50">
              {Array.from({ length: 5 }).map((_, i) => <line key={`h${i}`} x1="0" x2="200" y1={i * 30} y2={i * 30} stroke="#1A3A8C" strokeWidth="0.8" />)}
              {Array.from({ length: 7 }).map((_, i) => <line key={`v${i}`} y1="0" y2="130" x1={i * 30} x2={i * 30} stroke="#1A3A8C" strokeWidth="0.8" />)}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-puq-mint shadow-[0_0_24px_rgba(125,249,196,0.6)]">
                <span className="absolute h-12 w-12 animate-puq-radar rounded-full bg-puq-mint/40" />
              </div>
              <div className="mt-2 text-center text-[11px] font-semibold">Café Einstein, Mitte</div>
            </div>
          </div>
        </Card>
        <Card variant="success" className="mt-3 border-puq-mint/40">
          <SectionLabel color="mint">SHARED WITH</SectionLabel>
          <div className="mt-2 flex items-center gap-3">
            <Avatar initials="SM" color="pink" size={36} />
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">Sarah M. · 2h verbleibend</div>
            </div>
          </div>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="rounded-full border border-puq-line-2 py-3 text-[13px] font-semibold">Verlängern</button>
          <button className="rounded-full bg-puq-danger/15 border border-puq-danger/40 py-3 text-[13px] font-semibold text-puq-danger">Stoppen</button>
        </div>
      </div>
    </Screen>
  );
}

/* Screen 53 — Emergency */
export function S53_Emergency() {
  const list = [
    { num: "110", t: "Police", s: "Imminent danger · crime", c: "danger" as const },
    { num: "112", t: "Fire / EMT", s: "Injury · fire", c: "lemon" as const },
    { num: "08000 116 016", t: "Help Hotline", s: "Violence support · 24/7", c: "pink" as const },
    { num: "0800 111 0 111", t: "Crisis Helpline", s: "Anonymous · free", c: "mint" as const },
  ];
  const tone = {
    danger: ["border-puq-danger/60", "bg-puq-danger", "text-puq-danger"],
    lemon: ["border-puq-lemon/60", "bg-puq-lemon-2", "text-puq-lemon"],
    pink: ["border-puq-pink/60", "bg-puq-pink", "text-puq-pink"],
    mint: ["border-puq-mint/60", "bg-puq-mint", "text-puq-mint"],
  };
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Emergency" />
      <div className="relative z-10 flex-1 px-6 pb-6 text-center">
        <SectionLabel color="pink" className="text-center">★ NOTFALL · 24/7</SectionLabel>
        <h1 className="mt-1 text-[28px] font-bold">Instant Help</h1>
        <p className="text-[12.5px] text-puq-muted">Direct call · no typing</p>
        <div className="mt-5 space-y-2.5 text-left">
          {list.map((l) => (
            <div key={l.num} className={`flex items-center gap-3 rounded-2xl border-2 ${tone[l.c][0]} bg-puq-card/70 p-3`}>
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tone[l.c][1]}/15 text-2xl ${tone[l.c][2]}`}>📞</div>
              <div className="flex-1">
                <div className="text-[20px] font-bold">{l.num}</div>
                <div className={`text-[12px] font-bold ${tone[l.c][2]}`}>{l.t}</div>
                <div className="text-[10.5px] text-puq-muted">{l.s}</div>
              </div>
              <div className={`grid h-9 w-9 place-items-center rounded-full ${tone[l.c][1]} text-puq-deep`}>→</div>
            </div>
          ))}
        </div>
        <Card className="mt-6 border-puq-line-2/40">
          <div className="text-[13.5px] font-bold">Activate stealth mode →</div>
        </Card>
        <div className="mt-2 text-[11px] text-puq-muted">App disguises as weather app</div>
      </div>
    </Screen>
  );
}

/* Screen 77 — Encounter actions */
export function S77_EncounterActions() {
  const list = [
    { ic: "✕", t: "Skip", s: "Hide profile for 30 days" },
    { ic: "🚫", t: "Block", s: "Invisible in both directions" },
    { ic: "⚠", t: "Report", s: "Forward to safety team", danger: true },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Encounter" />
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 text-center">
        <Avatar initials="EM" color="pink" size={130} />
        <h1 className="mt-4 text-[22px] font-bold">Was möchtest du tun?</h1>
        <p className="mt-1 text-[12.5px] text-puq-muted">Diese Aktionen schützen dich.</p>
        <div className="mt-6 w-full space-y-2.5 text-left">
          {list.map((o) => (
            <div key={o.t} className={`flex items-center gap-3 rounded-2xl border ${o.danger ? "border-puq-danger/40 bg-puq-danger/8" : "border-puq-line-2/40 bg-puq-card/70"} p-3.5`}>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${o.danger ? "bg-puq-danger/15 text-puq-danger" : "bg-puq-card-2"} text-lg`}>{o.ic}</div>
              <div className="flex-1">
                <div className={`text-[14px] font-bold ${o.danger ? "text-puq-danger" : ""}`}>{o.t}</div>
                <div className="text-[11.5px] text-puq-muted">{o.s}</div>
              </div>
              <span className="text-puq-muted">›</span>
            </div>
          ))}
        </div>
        <Card variant="danger" className="mt-5 w-full border-puq-danger/40 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-puq-danger/20 text-puq-danger">!</span>
            <div>
              <div className="text-[13.5px] font-bold text-puq-danger">Notfall — sofortige Hilfe</div>
              <div className="text-[11px] text-puq-muted">Polizei 110 · Hilfetelefon 08000 116 016</div>
            </div>
          </div>
        </Card>
        <div className="mt-4 text-center text-[12px] text-puq-muted">Abbrechen</div>
      </div>
    </Screen>
  );
}

/* Screen 78 — Report Status */
export function S78_ReportStatus() {
  const steps = [
    { t: "Bericht erhalten", d: "26.04. · 14:23", done: true, c: "mint" },
    { t: "Sicherheits-Team prüft", d: "26.04. · 16:08", done: true, c: "mint" },
    { t: "Account temporär gesperrt", d: "26.04. · 18:42", done: true, c: "lemon" },
    { t: "Permanent gebannt", d: "Endgültige Entscheidung", c: "muted" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="My Report" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">★ VERFOLGE DEINE MELDUNG</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">Bericht <span className="text-puq-pink">#4732</span></h1>
        <p className="mt-1 text-[12.5px] text-puq-muted">Eingereicht 26.04. · 14:23 Uhr</p>
        <Card className="mt-4 border-puq-line-2/40">
          <div className="flex items-center gap-3">
            <Avatar initials="?" color="indigo" size={36} />
            <div>
              <div className="text-[13.5px] font-bold">Anonymer Nutzer</div>
              <div className="text-[11.5px] text-puq-muted">Belästigung · unangemessene Bilder</div>
              <div className="mt-0.5 text-[11.5px] font-bold text-puq-pink">→ Bereits blockiert</div>
            </div>
          </div>
        </Card>
        <SectionLabel color="muted" className="mt-5">PROGRESS</SectionLabel>
        <div className="relative mt-3 pl-6">
          <div className="absolute left-2.5 top-0 h-full w-0.5 bg-puq-line-2" />
          {steps.map((s, i) => {
            const dot = s.c === "mint" ? "bg-puq-mint" : s.c === "lemon" ? "bg-puq-lemon" : "border-2 border-puq-line-2 bg-puq-deep";
            return (
              <div key={i} className="relative mb-4">
                <span className={`absolute -left-[18px] top-0.5 grid h-6 w-6 place-items-center rounded-full ${dot} text-[12px] text-puq-deep`}>{s.done ? "✓" : ""}</span>
                <div className={`text-[14px] font-bold ${s.c === "muted" ? "text-puq-muted/60" : ""}`}>{s.t}</div>
                <div className="text-[11.5px] text-puq-muted">{s.d}</div>
              </div>
            );
          })}
        </div>
        <Card variant="success" className="mt-2 border-puq-mint/40">
          <SectionLabel color="mint">★ DANKE FÜR DEINE MELDUNG</SectionLabel>
          <div className="mt-1 text-[12px]">Du machst PuQ.me sicherer für alle.</div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 81 — Account temporär gesperrt */
export function S81_AccountSuspended() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-8 text-center">
        <div className="grid h-32 w-32 place-items-center rounded-full bg-puq-danger/20">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-puq-danger text-3xl text-white">!</div>
        </div>
        <h1 className="mt-6 text-[26px] font-bold leading-tight">Konto temporär<em className="block font-serif italic text-puq-pink">gesperrt.</em></h1>
        <p className="mt-2 text-[12.5px] text-puq-muted">Wegen Verdacht auf Verstoß gegen unsere Regeln.</p>
        <Card variant="danger" className="mt-5 w-full text-left border-puq-danger/40">
          <SectionLabel color="pink">★ REASON</SectionLabel>
          <div className="mt-1 text-[14px] font-bold">Mehrere Belästigungs-Meldungen</div>
          <div className="text-[11.5px] text-puq-muted">Sperre läuft 72 Std · bis 29.04. 14:00</div>
        </Card>
        <SectionLabel color="muted" className="mt-5 self-start">YOUR OPTIONS</SectionLabel>
        <div className="mt-2 w-full space-y-2 text-left">
          <ActionLine t="Einspruch einlegen" s="Wenn du das für unfair hältst" />
          <ActionLine t="Regeln nachlesen" s="Was zählt als Verstoß" />
          <ActionLine t="Daten exportieren" s="DSGVO Art. 20 — sofort" />
        </div>
      </div>
    </Screen>
  );
}
function ActionLine({ t, s }: { t: string; s: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-puq-line-2/40 bg-puq-card/70 px-3 py-3">
      <div>
        <div className="text-[13.5px] font-bold">{t}</div>
        <div className="text-[11.5px] text-puq-muted">{s}</div>
      </div>
      <span className="text-puq-muted">›</span>
    </div>
  );
}
