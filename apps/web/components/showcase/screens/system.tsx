"use client";
import { Screen, StatusBar, HomeBar, PuqMark, PuqWordmark } from "../chrome";
import { ScreenHeader, SectionLabel, Card, Pill, Avatar, FootBar, PrimaryBtn, Input, Field } from "../ui";

/* Screen 75 — Notifications Inbox */
export function S75_NotifInbox() {
  const tabs = ["All", "Hellos", "Matches", "System"];
  const items = [
    { ic: "💬", t: "New Hello", s: "Café Einstein · 3 min ago", c: "border-puq-pink", icBg: "bg-puq-pink/15 text-puq-pink" },
    { ic: "♡", t: "It's a Match!", s: "Lukas · say hi back", c: "border-puq-pink", icBg: "bg-puq-pink/15 text-puq-pink" },
    { ic: "★", t: "Daily Question", s: "8 answers nearby", c: "border-puq-lemon", icBg: "bg-puq-lemon/15 text-puq-lemon" },
    { ic: "↑", t: "Boost Active", s: "+12 profile views", c: "border-puq-line-2/40", icBg: "bg-puq-lemon/15 text-puq-lemon" },
    { ic: "✓", t: "Verified", s: "Document accepted", c: "border-puq-line-2/40", icBg: "bg-puq-mint/15 text-puq-mint" },
    { ic: "📍", t: "New Encounter", s: "Spreeufer · 1 hr ago", c: "border-puq-line-2/40", icBg: "bg-puq-pink/15 text-puq-pink" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Notifications" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <SectionLabel color="muted">12 NEW · 38 TOTAL</SectionLabel>
        <div className="mt-3 flex gap-5 border-b border-puq-line-2/40">
          {tabs.map((t, i) => (
            <div key={t} className={`pb-2 text-[13.5px] font-bold ${i === 0 ? "text-puq-pink border-b-2 border-puq-pink -mb-px" : "text-puq-muted"}`}>{t}</div>
          ))}
        </div>
        <div className="mt-4 space-y-2.5">
          {items.map((it) => (
            <div key={it.t} className={`flex items-center gap-3 rounded-2xl border ${it.c} bg-puq-card/70 px-3.5 py-3`}>
              <div className={`grid h-9 w-9 place-items-center rounded-2xl ${it.icBg} text-base`}>{it.ic}</div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{it.t}</div>
                <div className="text-[11.5px] text-puq-muted">{it.s}</div>
              </div>
              <span className="text-puq-muted">›</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* Screen 76 — Lockscreen with Push */
export function S76_LockPush() {
  return (
    <Screen bg="deep">
      <StatusBar />
      <div className="relative z-10 mt-12 text-center">
        <div className="text-[80px] font-light leading-none tracking-tight">19:42</div>
        <div className="mt-1 text-sm text-puq-muted">Donnerstag, 26. April</div>
      </div>
      <div className="relative z-10 mt-12 space-y-3 px-4">
        <div className="rounded-2xl border border-puq-line-2/40 bg-puq-card/80 p-3.5 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-puq-pink"><PuqMark size={18} /></div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <div className="text-[13px] font-bold">PuQ.me</div>
                <div className="text-[10.5px] text-puq-muted">Jetzt</div>
              </div>
              <div className="text-[13.5px] font-bold">Du hattest deine erste Begegnung!</div>
              <div className="mt-0.5 text-[12px] text-puq-muted">Emma war heute bei Café Einstein, als du auch dort warst. Schau dir den Moment an.</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-puq-pink/40 bg-puq-card/80 p-3.5 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-puq-pink"><PuqMark size={18} /></div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <div className="text-[13px] font-bold">PuQ.me</div>
                <div className="text-[10.5px] text-puq-muted">vor 2 Std</div>
              </div>
              <div className="text-[13.5px] font-bold">Lukas hat dir auch Hallo gesagt.</div>
              <div className="mt-0.5 text-[12px] text-puq-mint">Es ist ein Match — sag Hallo zurück!</div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-auto flex items-center justify-between px-12 pb-10">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-puq-card-2"><span className="h-3 w-3 rounded-full bg-white/70" /></div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-puq-card-2"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" className="h-5 w-5 text-white/80"><rect x="6" y="3" width="12" height="18" rx="3"/></svg></div>
      </div>
      <HomeBar />
    </Screen>
  );
}

/* Screen 79 — Privacy / Daten-Cockpit */
export function S79_Privacy() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Privacy" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <h1 className="text-[28px] font-bold">Dein Daten-Cockpit</h1>
        <p className="mt-1 text-[12.5px] text-puq-muted">DSGVO Art. 15 / 17 — alles in einer App.</p>
        <Card variant="danger" className="mt-4 border-puq-pink/40 bg-puq-pink/5">
          <SectionLabel color="pink">STORED ABOUT YOU</SectionLabel>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-[26px] font-bold text-puq-pink">47</div><div className="text-[10.5px] text-puq-muted">Begegnungen</div></div>
            <div><div className="text-[26px] font-bold text-puq-pink">3</div><div className="text-[10.5px] text-puq-muted">Aktive Modi</div></div>
            <div><div className="text-[26px] font-bold text-puq-pink">12</div><div className="text-[10.5px] text-puq-muted">Wochen Daten</div></div>
          </div>
        </Card>
        <div className="mt-3 space-y-2">
          <DataRow t="Meine Daten ansehen" s="Alle gespeicherten Begegnungen, Standorte" />
          <DataRow t="Daten exportieren" s="JSON-Datei herunterladen" />
          <DataRow t="Aufbewahrungsdauer" s="Aktuell: 12 Monate" />
          <DataRow t="Anonyme Statistiken" s="Aus" />
          <DataRow t="Konto löschen" s="Endgültig & sofort" danger />
        </div>
        <div className="mt-6 text-center text-[10.5px] text-puq-faint">PuQ.me · Made in Berlin · v1.0</div>
      </div>
    </Screen>
  );
}
function DataRow({ t, s, danger }: { t: string; s: string; danger?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border ${danger ? "border-puq-danger/40 bg-puq-danger/5" : "border-puq-line-2/30 bg-puq-card/70"} px-3.5 py-3`}>
      <div>
        <div className={`text-[13.5px] font-bold ${danger ? "text-puq-danger" : ""}`}>{t}</div>
        <div className="text-[11.5px] text-puq-muted">{s}</div>
      </div>
      <span className={`${danger ? "text-puq-danger" : "text-puq-muted"}`}>›</span>
    </div>
  );
}

/* Screen 80 — Delete Account */
export function S80_DeleteAccount() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Delete Account" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <SectionLabel color="pink">★ DSGVO ART. 17 · ENDGÜLTIG</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Konto
          <em className="block font-serif italic text-puq-pink">unwiderruflich löschen.</em>
        </h1>
        <div className="mt-5 grid place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-puq-danger/15 text-3xl text-puq-danger">🗑</div>
        </div>
        <SectionLabel color="muted" className="mt-5">THIS WILL BE DELETED</SectionLabel>
        <div className="mt-2 space-y-2">
          <DelLine t="Profil & alle Fotos" s="47 Fotos · 6 Bio-Texte" />
          <DelLine t="Begegnungs-Historie" s="184 Begegnungen · 12 Wochen" />
          <DelLine t="Chats & Matches" s="8 Matches · 256 Nachrichten" />
          <DelLine t="Voice-Intro & Daten" s="1 Audio · KI-Score-Verlauf" />
        </div>
        <Card variant="warning" className="mt-4 border-puq-lemon/40">
          <SectionLabel color="lemon">★ ALTERNATIVE</SectionLabel>
          <div className="mt-1 flex items-center justify-between"><div className="text-[12.5px]">Nur kurz Pause? → Pause-Mode</div><span className="text-[12px] font-bold text-puq-lemon">Pause ›</span></div>
        </Card>
        <SectionLabel color="muted" className="mt-4">TYPE "DELETE" TO CONFIRM</SectionLabel>
        <div className="mt-2"><Input placeholder="LÖSCHEN" className="border-puq-danger/60" /></div>
      </div>
      <FootBar><PrimaryBtn color="danger">Endgültig löschen</PrimaryBtn></FootBar>
    </Screen>
  );
}
function DelLine({ t, s }: { t: string; s: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-puq-danger/30 bg-puq-danger/5 px-3.5 py-2.5">
      <span className="text-puq-danger">✕</span>
      <div>
        <div className="text-[13.5px] font-bold">{t}</div>
        <div className="text-[11px] text-puq-muted">{s}</div>
      </div>
    </div>
  );
}

/* Screen 82 — Maintenance */
export function S82_Maintenance() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="grid h-32 w-32 place-items-center rounded-full bg-puq-lemon/15 ring-4 ring-puq-lemon/20">
          <div className="text-3xl">🐝</div>
        </div>
        <h1 className="mt-6 text-[24px] font-bold leading-tight">Kurze Pause —<em className="block font-serif italic text-puq-lemon">wir machen alles besser.</em></h1>
        <p className="mt-2 text-[13px] text-puq-muted">PuQ.me führt gerade ein Update durch.</p>
        <Card className="mt-5 w-full border-puq-lemon/40 text-center">
          <SectionLabel color="muted">READY IN</SectionLabel>
          <div className="mt-2 flex justify-center gap-2">
            {[
              { v: "00", l: "DAYE" },
              { v: "00", l: "STD" },
              { v: "23", l: "MIN" },
            ].map((c) => (
              <div key={c.l} className="rounded-2xl border border-puq-lemon/40 bg-puq-card/60 px-4 py-2">
                <div className="text-3xl font-bold">{c.v}</div>
                <div className="text-[9px] tracking-wider text-puq-muted">{c.l}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="success" className="mt-3 w-full flex items-center justify-between border-puq-mint/40">
          <div>
            <SectionLabel color="mint">★ STATUS LIVE</SectionLabel>
            <div className="text-[12px]">status.puq.me · für Updates</div>
          </div>
          <span className="text-[12px] font-bold text-puq-mint">Öffnen ›</span>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 83 — Offline */
export function S83_Offline() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center text-puq-muted">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" className="h-20 w-20">
            <path d="M2 9 a16 16 0 0 1 20 0" />
            <path d="M5 13 a10 10 0 0 1 14 0" opacity="0.6" />
            <path d="M8 17 a5 5 0 0 1 8 0" opacity="0.4" />
            <circle cx="12" cy="20" r="1.2" fill="currentColor" />
          </svg>
          <span className="absolute h-1 w-32 rotate-[-30deg] bg-puq-pink" />
        </div>
        <h1 className="mt-6 text-[28px] font-bold">Keine Verbindung.</h1>
        <p className="mt-2 text-[12.5px] text-puq-muted">PuQ.me funktioniert auch offline für<br />deine letzten 7 Tage Begegnungen.</p>
        <Card variant="success" className="mt-5 w-full border-puq-mint/40">
          <SectionLabel color="mint">★ OFFLINE AVAILABLE</SectionLabel>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-[24px] font-bold">47</div><div className="text-[10.5px] text-puq-muted">Begegnungen</div></div>
            <div><div className="text-[24px] font-bold">3</div><div className="text-[10.5px] text-puq-muted">Matches</div></div>
            <div><div className="text-[24px] font-bold">12</div><div className="text-[10.5px] text-puq-muted">Chats</div></div>
          </div>
          <div className="mt-2 text-[10.5px] text-puq-faint">Synchronisiert sich, sobald du wieder online bist.</div>
        </Card>
      </div>
      <FootBar>
        <PrimaryBtn>↻ Erneut versuchen</PrimaryBtn>
        <div className="mt-2 text-center text-[12px] text-puq-muted">Offline-Modus weiter nutzen</div>
      </FootBar>
    </Screen>
  );
}
