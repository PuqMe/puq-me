"use client";
import { Screen, StatusBar, BottomNav, PuqWordmark, MenuIcon, BellIcon } from "../chrome";
import { ScreenHeader, SectionLabel, Card, Pill, Avatar, FootBar, PrimaryBtn, OptionRow } from "../ui";

/* Screen 60 — Profil Übersicht */
export function S60_ProfilOverview() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <div className="flex items-center gap-2"><PuqWordmark size="md" /><span className="text-[14px] font-medium text-puq-muted">Profile</span></div>
        <MenuIcon />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <div className="flex flex-col items-center">
          <Avatar initials="AB" color="pink" size={120} online />
          <div className="mt-3 text-[24px] font-bold">Alan, 32</div>
          <div className="text-[12px] text-puq-muted">Berlin · Verifiziert</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatBox v="47" l="Begegnungen" />
          <StatBox v="12" l="Matches" />
          <StatBox v="Lvl 4" l="Badges" />
        </div>
        <Card variant="warning" className="mt-4 border-puq-lemon/40 bg-gradient-to-br from-puq-lemon/15 to-puq-lemon-2/10">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel color="lemon">★ PUQ.ME PLUS</SectionLabel>
              <div className="mt-1 text-[15px] font-bold">Sieh, wer dich beobachtet hat</div>
              <div className="text-[11.5px] text-puq-muted">Plus erweiterte Begegnungs-Historie</div>
            </div>
            <span className="text-puq-lemon">›</span>
          </div>
        </Card>
        <div className="mt-4 space-y-2">
          <SettingRow color="pink" t="Bio & Details" s="Name, Birthday, Beruf" />
          <SettingRow color="lemon" t="Interessen" s="8 Hobbys" />
          <SettingRow color="mint" t="Sichtbarkeit" s="Global · 50 km" />
          <SettingRow color="pink" t="Datenschutz" s="DSGVO-Cockpit" />
          <SettingRow color="indigo" t="Einstellungen" s="" />
        </div>
      </div>
      <BottomNav active="profil" variant="matches" />
    </Screen>
  );
}
function StatBox({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-2xl border border-puq-line-2/40 bg-puq-card/70 p-3 text-center">
      <div className="text-[22px] font-bold">{v}</div>
      <div className="mt-0.5 text-[10.5px] text-puq-muted">{l}</div>
    </div>
  );
}
function SettingRow({ color, t, s }: { color: "pink" | "mint" | "lemon" | "indigo"; t: string; s: string }) {
  const map = { pink: "bg-puq-pink/15 text-puq-pink", mint: "bg-puq-mint/15 text-puq-mint", lemon: "bg-puq-lemon/15 text-puq-lemon", indigo: "bg-puq-indigo-2/20 text-puq-indigo-2" };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-puq-line-2/30 bg-puq-card/60 px-3 py-3">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${map[color]} text-lg`}>★</div>
      <div className="flex-1">
        <div className="text-[14px] font-bold">{t}</div>
        {s ? <div className="text-[11px] text-puq-muted">{s}</div> : null}
      </div>
      <span className="text-puq-muted">›</span>
    </div>
  );
}

/* Screen 61 — Profil bearbeiten */
export function S61_ProfilEdit() {
  return (
    <Screen bg="deep">
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <div className="flex items-center gap-2 text-puq-pink">‹ <span className="text-[16px] font-semibold text-white">Profil bearbeiten</span></div>
        <button className="text-[13px] font-bold text-puq-mint">Speichern</button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-10">
        <SectionLabel color="muted">FOTOS</SectionLabel>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 to-puq-pink-2 grid place-items-center">
            <span className="absolute left-1.5 top-1.5 rounded-md bg-puq-lemon px-1.5 py-0.5 text-[10px] font-bold text-puq-deep">★ HAUPT</span>
            <div className="text-3xl font-bold text-white/85">AB</div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-puq-line-2/40 bg-puq-card/40 text-2xl text-puq-faint">+</div>
          ))}
        </div>
        <SectionLabel color="muted" className="mt-5">BIO</SectionLabel>
        <Card className="mt-2">
          <p className="font-serif italic text-[13px]">"Lieber spontan als perfekt."</p>
          <div className="mt-1 text-[11.5px] text-puq-muted">Klick zum Bearbeiten · 32 / 200 Zeichen</div>
        </Card>
        <SectionLabel color="muted" className="mt-5">INTERESSEN · 6 / 10</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill variant="active">Yoga</Pill><Pill variant="active">Bouldern</Pill><Pill variant="active">Indie-Musik</Pill>
          <Pill variant="active">Kaffee</Pill><Pill variant="active">Lesen</Pill><Pill variant="active">Vinyl</Pill>
          <span className="rounded-full border border-dashed border-puq-mint px-3 py-1 text-[12px] font-semibold text-puq-mint">+ Hinzufügen</span>
        </div>
      </div>
    </Screen>
  );
}

/* Screen 62 — Profile Check */
export function S62_ProfileCheck() {
  const bars = [
    { l: "Foto-Qualität", v: 91, s: "9.1", c: "bg-puq-mint" },
    { l: "Bio-Klarheit", v: 84, s: "8.4", c: "bg-puq-mint-2" },
    { l: "Voice-Intro", v: 0, s: "0.0", c: "bg-puq-danger" },
    { l: "Profil-Vollständigkeit", v: 68, s: "6.8", c: "bg-puq-lemon" },
    { l: "Aktivitäts-Frische", v: 52, s: "5.2", c: "bg-puq-lemon-2" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Profile Check" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        <SectionLabel color="indigo">★ AI-AUDIT · YOUR POTENTIAL</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Dein Profil
          <em className="block font-serif italic text-puq-pink">performt 7.2 / 10.</em>
        </h1>
        <div className="mt-6 grid place-items-center">
          <div className="relative grid h-44 w-44 place-items-center rounded-full">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="45" stroke="#0D1F3A" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="45" stroke="#5BC8FF" strokeWidth="6" strokeLinecap="round" strokeDasharray="282" strokeDashoffset="78" fill="none" />
            </svg>
            <div className="text-5xl font-bold">7.2</div>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {bars.map((b) => (
            <div key={b.l}>
              <div className="flex justify-between text-[13px] font-bold"><span>{b.l}</span><span className={b.v < 30 ? "text-puq-danger" : b.v < 70 ? "text-puq-lemon" : "text-puq-mint"}>{b.s}</span></div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-puq-card-2"><div className={`h-full ${b.c}`} style={{ width: `${Math.max(b.v, 4)}%` }} /></div>
            </div>
          ))}
        </div>
        <Card className="mt-5 border-[#5BC8FF]/40">
          <SectionLabel color="indigo">★ TOP TIP — +1.4 PUNKTE</SectionLabel>
          <div className="mt-1 text-[12.5px]">Voice-Intro hinzufügen → größter Hebel.</div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 63 — My Circle */
export function S63_MyCircle() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <div className="flex items-center gap-2"><PuqWordmark size="md" /><span className="text-[14px] font-medium text-puq-muted">My Circle</span></div>
        <MenuIcon />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <SectionLabel color="muted">ZEITRAUM</SectionLabel>
        <div className="mt-2 flex gap-1.5">
          {[
            { v: "00", l: "YEARE" },
            { v: "00", l: "MONTHE" },
            { v: "07", l: "DAYE", on: true },
            { v: "00", l: "STUNDEN" },
            { v: "00", l: "MINUTEN" },
          ].map((c) => (
            <div key={c.l} className={`flex flex-1 flex-col items-center rounded-2xl border ${c.on ? "border-puq-pink" : "border-puq-line-2/40"} bg-puq-card/70 p-2`}>
              <div className="text-[20px] font-bold">{c.v}</div>
              <div className="text-[8px] tracking-wider text-puq-muted">{c.l}</div>
            </div>
          ))}
        </div>
        <Card className="mt-4 h-44 overflow-hidden p-0">
          <div className="relative h-full w-full bg-puq-night">
            <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full">
              <path d="M40 110 Q 110 60 170 80 T 260 30" stroke="#FF3D7F" strokeWidth="2" strokeDasharray="4 5" fill="none" />
            </svg>
            <div className="absolute left-[12%] bottom-[26%] grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-[10px] font-bold">1</div>
            <div className="absolute left-[55%] top-[45%] grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-[10px] font-bold">2</div>
            <div className="absolute right-[10%] top-[15%] grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-[10px] font-bold">3</div>
          </div>
        </Card>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <StatBox v="4" l="Begegnungen" />
          <StatBox v="3" l="Orte" />
          <StatBox v="12" l="Personen" />
        </div>
        <SectionLabel color="muted" className="mt-4">HEUTE</SectionLabel>
        <div className="mt-2 space-y-2">
          {[
            { i: "EM", c: "pink", n: "Emma, 26", l: "Café Einstein · +150m", t: "18:30" },
            { i: "LK", c: "indigo", n: "Lukas, 28", l: "Tempelhofer Feld · +200m", t: "14:10" },
            { i: "SV", c: "blue", n: "Svenja, 24", l: "Hauptbahnhof · +350m", t: "08:45" },
          ].map((r) => (
            <div key={r.i} className="flex items-center gap-3 rounded-2xl border border-puq-line-2/30 bg-puq-card/70 p-3">
              <Avatar initials={r.i} color={r.c as any} size={40} />
              <div className="flex-1">
                <div className="text-[13px] font-bold">{r.n}</div>
                <div className="text-[11px] text-puq-muted">{r.l}</div>
              </div>
              <div className="text-[11px] text-puq-faint">{r.t}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="radar" variant="matches" />
    </Screen>
  );
}

/* Screen 64 — This Week */
export function S64_ThisWeek() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="This Week" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <SectionLabel color="pink">★ KW 17 · 21.04 – 27.04</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Eine starke
          <em className="block font-serif italic text-puq-pink">Woche.</em>
        </h1>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <BigStat v="7" c="pink" l="Begegnungen" sub="+3 vs. letzte Woche" />
          <BigStat v="12" c="lemon" l="Hallos" sub="→ 4 Antworten" />
          <BigStat v="3" c="mint" l="Matches" sub="Neu in Friedrichshain" />
          <BigStat v="47" c="indigo" l="Orte besucht" sub="Café Einstein 4×" />
        </div>
        <SectionLabel color="muted" className="mt-5">YOUR TOP 5 PLACES</SectionLabel>
        <div className="mt-2 space-y-2">
          {[
            { n: "Café Einstein", v: "4×", c: "border-puq-pink" },
            { n: "Spreeufer Friedrichshain", v: "3×", c: "border-puq-lemon" },
            { n: "Tempelhofer Feld", v: "2×", c: "border-puq-mint" },
            { n: "Kreuzberg Markthalle", v: "2×", c: "border-[#5BC8FF]" },
            { n: "U Schlesisches Tor", v: "1×", c: "border-puq-pink-2" },
          ].map((p) => (
            <div key={p.n} className={`flex items-center justify-between rounded-2xl border-l-4 ${p.c} border-y border-r border-puq-line-2/40 bg-puq-card/70 px-3 py-2.5`}>
              <span className="text-[13.5px] font-bold">{p.n}</span>
              <span className={`text-[13.5px] font-bold ${p.c.replace("border-", "text-")}`}>{p.v}</span>
            </div>
          ))}
        </div>
        <Card className="mt-5 border-puq-pink/40">
          <SectionLabel color="pink">★ INSIGHT</SectionLabel>
          <div className="mt-1 text-[12.5px]">Du bist morgens am aktivsten — nutze das.</div>
        </Card>
      </div>
    </Screen>
  );
}
function BigStat({ v, l, sub, c }: { v: string; l: string; sub: string; c: "pink" | "mint" | "lemon" | "indigo" }) {
  const map = { pink: ["text-puq-pink", "border-puq-pink/40"], mint: ["text-puq-mint", "border-puq-mint/40"], lemon: ["text-puq-lemon", "border-puq-lemon/40"], indigo: ["text-[#5BC8FF]", "border-[#5BC8FF]/40"] } as const;
  return (
    <div className={`rounded-2xl border ${map[c][1]} bg-puq-card/70 p-3.5`}>
      <div className={`text-[40px] font-bold ${map[c][0]} leading-none`}>{v}</div>
      <div className="mt-2 text-[14px] font-bold">{l}</div>
      <div className="text-[11px] text-puq-muted">{sub}</div>
    </div>
  );
}

/* Screen 65 — My Day */
export function S65_MyDay() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="My Day" />
      <div className="relative z-10 flex-1 px-6 pb-6">
        <SectionLabel color="lemon">🔥 DAY 12 · STREAK</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">12 Tage in<em className="block font-serif italic text-puq-pink">Folge.</em></h1>
        <SectionLabel color="muted" className="mt-5">DIESE WOCHE</SectionLabel>
        <div className="mt-2 flex justify-between gap-1">
          {[
            { l: "Mo", on: true }, { l: "Di", on: true }, { l: "Mi", on: true },
            { l: "Do", on: true }, { l: "Fr", on: true }, { l: "Sa", on: true },
            { l: "So", today: true },
          ].map((d) => (
            <div key={d.l} className={`flex h-14 w-9 flex-col items-center justify-center rounded-2xl ${d.on ? "border-2 border-puq-lemon bg-puq-lemon/15 text-puq-lemon" : d.today ? "border-2 border-dashed border-puq-line-2/60 text-puq-muted" : ""}`}>
              <div className="text-[10px] font-bold">{d.l}</div>
              <div className="text-[14px] font-bold">{d.on ? "✓" : d.today ? "heute" : ""}</div>
            </div>
          ))}
        </div>
        <SectionLabel color="muted" className="mt-5">TODAY GOALS · 2 / 4</SectionLabel>
        <div className="mt-2 space-y-2">
          <Goal done t="App geöffnet" xp="+25 XP" />
          <Goal done t="Profil-Check abgeschlossen" xp="+25 XP" />
          <Goal t="1 Hallo gesagt" />
          <Goal t="Tagesfrage beantwortet" />
        </div>
        <Card variant="warning" className="mt-5 border-puq-lemon/40">
          <SectionLabel color="lemon">★ DAY 14 · BELOHNUNG</SectionLabel>
          <div className="mt-1 text-[12.5px]">2× kostenlose Boosts freischalten</div>
        </Card>
      </div>
    </Screen>
  );
}
function Goal({ t, xp, done }: { t: string; xp?: string; done?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border ${done ? "border-puq-mint/30" : "border-puq-line-2/40"} bg-puq-card/60 px-3 py-3`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-puq-mint text-puq-deep" : "border-2 border-dashed border-puq-line-2/70"}`}>{done ? "✓" : ""}</span>
        <span className={`text-[13.5px] font-bold ${done ? "" : "text-puq-text"}`}>{t}</span>
      </div>
      {xp ? <span className="text-[12px] font-bold text-puq-mint">{xp}</span> : <span className="text-puq-muted">→</span>}
    </div>
  );
}
