"use client";
import { Screen, StatusBar, BottomNav, PuqWordmark, BellIcon, MenuIcon } from "../chrome";
import { PrimaryBtn, ScreenHeader, FootBar, SectionLabel, Card, Pill, Avatar, OnlinePill, RepeatBadge, VerifiedBadge, TextBtn } from "../ui";

/* Screen 36 — Begegnung Empty (Day 1) */
export function S36_BegegnungEmpty() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-4">
        <PuqWordmark size="md" />
        <button className="grid h-8 w-8 place-items-center text-puq-muted"><BellIcon /></button>
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 36 24" className="h-20 w-32">
          <circle cx="13" cy="12" r="10" fill="none" stroke="#FF3D7F" strokeWidth="1.5" />
          <circle cx="23" cy="12" r="10" fill="none" stroke="#FF3D7F" strokeWidth="1.5" />
          <circle cx="13" cy="10" r="2" fill="#FF3D7F" />
          <circle cx="23" cy="10" r="2" fill="#FF3D7F" />
          <path d="M14 16 Q18 20 22 16" stroke="#FF3D7F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <SectionLabel color="mint" className="mt-6">★ DAY 1 · WILLKOMMEN</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">
          Noch keine
          <em className="block font-serif italic text-puq-pink">Begegnungen.</em>
        </h1>
        <p className="mt-3 text-[13px] text-puq-muted">PuQ.me läuft im Hintergrund.<br />Geh raus — der Rest passiert von selbst.</p>
        <div className="mt-8 w-full">
          <PrimaryBtn>Wie funktioniert das?</PrimaryBtn>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="rounded-full border border-puq-mint/60 py-3 text-sm font-semibold text-puq-mint">In der Nähe</button>
            <button className="rounded-full border border-puq-lemon/60 py-3 text-sm font-semibold text-puq-lemon">Entdecken</button>
          </div>
        </div>
      </div>
      <BottomNav active="begegnung" />
    </Screen>
  );
}

/* Screen 37 — Begegnung Empty Radius */
export function S37_BegegnungEmptyRadius() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-4">
        <PuqWordmark size="md" />
        <button className="grid h-8 w-8 place-items-center text-puq-muted"><BellIcon /></button>
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative grid h-44 w-44 place-items-center">
          <div className="absolute inset-0 animate-puq-radar rounded-full border border-puq-pink/40" />
          <div className="absolute inset-6 rounded-full border border-puq-indigo-2/30" />
          <div className="absolute inset-12 rounded-full border border-puq-indigo-2/20" />
          <div className="grid h-12 w-12 place-items-center rounded-full bg-puq-pink text-[10px] font-bold">DU</div>
        </div>
        <h1 className="mt-6 text-[28px] font-bold leading-tight">
          Hier ist es ruhig.
          <em className="block font-serif italic text-puq-pink">Aber nicht für lange.</em>
        </h1>
        <p className="mt-3 text-[13px] text-puq-muted">In 25 km Radius noch keine Begegnungen.</p>
        <div className="mt-7 w-full space-y-2.5">
          <ActionRow tone="pink" title="Radius vergrößern" sub="Auf 50 km · mehr Menschen" />
          <ActionRow tone="lemon" title="Entdecken-Modus" sub="Profile außerhalb Begegnungen" />
          <ActionRow tone="mint" title="Freunde einladen" sub="Berlin füllen — gemeinsam" />
        </div>
      </div>
    </Screen>
  );
}
function ActionRow({ tone, title, sub }: { tone: "pink" | "mint" | "lemon"; title: string; sub: string }) {
  const map = { pink: "border-l-puq-pink", mint: "border-l-puq-mint", lemon: "border-l-puq-lemon" };
  return (
    <div className={`flex items-center rounded-xl border border-puq-line-2/40 ${map[tone]} border-l-4 bg-puq-card/70 p-3.5 text-left`}>
      <div className="flex-1">
        <div className="text-[14px] font-bold">{title}</div>
        <div className="text-[11.5px] text-puq-muted">{sub}</div>
      </div>
      <span className="text-puq-muted">→</span>
    </div>
  );
}

/* Screen 38 — Begegnung Active */
export function S38_BegegnungActive() {
  const stories = [
    { i: "EM", c: "pink", n: "Emma" },
    { i: "LK", c: "mint", n: "Lukas", ring: "lemon" },
    { i: "SV", c: "indigo", n: "Svenja", ring: "mint" },
    { i: "MR", c: "tangerine", n: "Marie" },
    { i: "AN", c: "blue", n: "Anna" },
  ] as const;
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
        <button className="grid h-8 w-8 place-items-center text-puq-muted"><BellIcon /></button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <div className="rounded-full border border-puq-mint/50 bg-puq-mint/10 px-4 py-2 text-center text-[12.5px] font-semibold text-puq-mint">● 247 aktiv in deiner Nähe</div>
        <SectionLabel color="muted" className="mt-4">HEUTE AKTIV</SectionLabel>
        <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
          <div className="flex flex-col items-center"><div className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-puq-line-2/70 text-2xl text-puq-faint">+</div><div className="mt-1 text-[10px] text-puq-muted">Du</div></div>
          {stories.map((s) => (
            <div key={s.i} className="flex flex-col items-center">
              <Avatar initials={s.i} color={s.c as any} size={48} ring={(s as any).ring} online />
              <div className="mt-1 text-[10px] text-puq-muted">{s.n}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill variant="active">Alle</Pill>
          <Pill variant="lemon">● Kaffee</Pill>
          <Pill variant="mint">● Sport</Pill>
          <Pill variant="pink">● Spontan</Pill>
        </div>
        <Card className="mt-3 border-puq-line-2/30 bg-puq-card/50 p-2">
          <div className="flex items-center justify-between text-[11px]"><span className="text-puq-muted">Karte öffnen</span><div className="flex h-7 w-7 items-center justify-center text-puq-faint">+</div></div>
          <div className="relative mt-1 h-32 overflow-hidden rounded-xl bg-puq-night">
            <div className="absolute left-1/2 top-1/2 grid h-3 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-puq-pink shadow-puq-glow" />
            <div className="absolute inset-0">
              {[
                { x: 25, y: 35, c: "pink", l: "L" },
                { x: 65, y: 25, c: "mint", l: "S" },
                { x: 70, y: 60, c: "lemon", l: "E" },
              ].map((p) => (
                <div key={p.l} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  <div className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${p.c === "pink" ? "bg-puq-pink" : p.c === "mint" ? "bg-puq-mint text-puq-deep" : "bg-puq-lemon text-puq-deep"}`}>{p.l}</div>
                </div>
              ))}
              <div className="absolute inset-0 grid place-items-center"><div className="h-24 w-24 rounded-full border border-puq-pink/40" /></div>
            </div>
          </div>
        </Card>
        <div className="mt-3 flex items-center justify-between"><SectionLabel color="muted">HEUTE · 3 BEGEGNUNGEN</SectionLabel><span className="text-[11px] text-puq-pink">Alle ›</span></div>
        <div className="mt-2.5 rounded-2xl border border-puq-lemon/40 bg-gradient-to-br from-puq-pink/30 via-puq-pink/10 to-puq-card p-4">
          <div className="flex items-center justify-between"><OnlinePill /><RepeatBadge n={3} /></div>
          <div className="mt-12 text-7xl font-bold text-white/20">EM</div>
          <div className="mt-2 text-[20px] font-bold">Emma, 26</div>
          <div className="text-[12.5px] text-puq-muted">Café Einstein · ~150 m · vor 2 Std</div>
          <div className="mt-3 flex justify-between">
            {[
              { l: "Beobachten", icon: "●" },
              { l: "Hallo", icon: "✓", on: true },
              { l: "Skip", icon: "⊘" },
              { l: "Block", icon: "✕" },
            ].map((b) => (
              <button key={b.l} className={`grid h-11 w-11 place-items-center rounded-full text-[15px] ${b.on ? "bg-puq-pink text-white" : "bg-puq-card-2 text-puq-muted"}`}>{b.icon}</button>
            ))}
          </div>
        </div>
        <Card variant="warning" className="mt-3 border-puq-lemon/40">
          <div className="flex items-start gap-3"><div className="text-2xl">📚</div><div><SectionLabel color="lemon">ENTDECKEN-MODE</SectionLabel><div className="mt-0.5 text-[12px] text-puq-text/90">12 neue Vorschläge außerhalb deines Radius ›</div></div></div>
        </Card>
      </div>
      <BottomNav active="begegnung" />
    </Screen>
  );
}

/* Screen 41 — Encounter Detail */
export function S41_EncounterDetail() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Encounter" trailing={<MenuIcon />} />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-28">
        <Card className="overflow-hidden bg-gradient-to-br from-puq-pink/40 via-puq-pink/10 to-puq-card border-puq-line-2/40 p-0">
          <div className="flex items-center justify-between p-4"><OnlinePill /><RepeatBadge /></div>
          <div className="relative mx-auto -mt-4 grid h-44 place-items-center text-7xl font-bold text-white/15">EM</div>
          <div className="px-4 pb-4">
            <div className="text-[28px] font-bold">Emma, 26</div>
            <div className="text-[12.5px] text-puq-muted">Berlin Mitte</div>
          </div>
        </Card>
        <Card className="mt-3 divide-y divide-puq-line-2/30 p-0">
          <Row k="Begegnung" v="Café Einstein" />
          <Row k="Wann" v="Heute · 18:30" />
          <Row k="Überlappung" v="18 Minuten" />
          <Row k="Diese Woche" v="2 weitere Orte" />
        </Card>
        <SectionLabel color="muted" className="mt-3">INTERESSEN</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill variant="outline">Yoga</Pill><Pill variant="outline">Bouldern</Pill><Pill variant="outline">Indie-Musik</Pill><Pill variant="outline">Kaffee</Pill>
        </div>
      </div>
      <FootBar>
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Beobachten", on: false, c: "bg-puq-card-2" },
            { l: "Hallo", on: true, c: "bg-puq-pink" },
            { l: "Skip", on: false, c: "bg-puq-card-2" },
            { l: "Block", on: false, c: "bg-puq-card-2" },
          ].map((b) => (
            <div key={b.l} className="flex flex-col items-center"><div className={`grid h-12 w-12 place-items-center rounded-full ${b.c} ${b.on ? "shadow-puq-glow" : ""}`}>{b.on ? "✓" : b.l === "Beobachten" ? "●" : b.l === "Skip" ? "⊘" : "✕"}</div><div className="mt-1 text-[10px] text-puq-muted">{b.l}</div></div>
          ))}
        </div>
      </FootBar>
    </Screen>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between p-3.5 text-[13.5px]"><span className="text-puq-muted">{k}</span><span className="font-semibold">{v}</span></div>
  );
}

/* Screen 42 — Hello Received */
export function S42_HelloReceived() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader trailing={<MenuIcon />} />
      <div className="relative z-10 flex-1 px-6 pb-24 text-center">
        <Avatar initials="MR" color="pink" size={150} />
        <SectionLabel color="pink" className="mt-4">♡ HELLO RECEIVED</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">Marie hat dir<em className="block font-serif italic text-puq-pink">Hallo gesagt!</em></h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Ihr seid euch heute begegnet:</p>
        <p className="text-[14px] font-bold">Café Einstein · vor 2 Std</p>
        <Card className="mt-5 text-left">
          <div className="text-[18px] font-bold">Marie, 27</div>
          <div className="text-[12px] text-puq-muted">Berlin Mitte · 320 m</div>
          <p className="mt-2 font-serif italic text-[13px]">"Sammle die kleinen Momente, die zählen."</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill variant="outline">Yoga</Pill><Pill variant="outline">Indie-Musik</Pill><Pill variant="outline">Bouldern</Pill>
          </div>
        </Card>
      </div>
      <FootBar><PrimaryBtn>♡ Say Hello Back</PrimaryBtn></FootBar>
      <BottomNav active="begegnung" />
    </Screen>
  );
}

/* Screen 44 — Hello Sent */
export function S44_HelloSent() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Encounter" trailing={<MenuIcon />} />
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-24 text-center">
        <div className="relative">
          <Avatar initials="EM" color="pink" size={150} />
          <span className="absolute -right-1 -bottom-1 grid h-9 w-9 place-items-center rounded-full bg-puq-pink-2 text-white">✓</span>
        </div>
        <h1 className="mt-4 text-[26px] font-bold">Hallo wurde gesendet</h1>
        <p className="mt-2 text-[12.5px] text-puq-muted">Emma erfährt davon, sobald sie selbst Hallo gesagt hat.</p>
        <SectionLabel color="muted" className="mt-6">DU WARTEST SEIT</SectionLabel>
        <div className="mt-2 flex gap-1.5">
          {["YEARE", "MONTHE", "DAYE", "STUNDEN", "MINUTEN"].map((l, i) => (
            <div key={l} className="flex flex-1 flex-col items-center rounded-2xl border border-puq-pink/30 bg-puq-card/60 px-1 py-2">
              <div className="text-2xl font-bold">{i === 4 ? "12" : "00"}</div>
              <div className="mt-0.5 text-[8px] tracking-wider text-puq-muted">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 w-full text-left">
          <div className="flex items-center justify-between"><SectionLabel color="muted">WEITERE BEGEGNUNGEN HEUTE</SectionLabel><span className="text-xs font-semibold text-puq-pink">Alle ›</span></div>
          <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
            <div className="flex flex-col items-center"><Avatar initials="LK" color="indigo" ring="mint" /><div className="mt-1 text-[10px]">Lukas</div></div>
            <div className="flex flex-col items-center"><Avatar initials="MR" color="pink" ring="lemon" /><div className="mt-1 text-[10px]">Marie</div></div>
            <div className="flex flex-col items-center"><Avatar initials="SV" color="indigo" /><div className="mt-1 text-[10px]">Svenja</div></div>
            <div className="flex flex-col items-center"><Avatar initials="AN" color="blue" ring="mint" /><div className="mt-1 text-[10px]">Anna</div></div>
          </div>
        </div>
      </div>
      <BottomNav active="likes" variant="matches" />
    </Screen>
  );
}

/* Screen 54 — In der Nähe Grid */
export function S54_NearbyGrid() {
  const cards = [
    { i: "EM", n: "Emma, 26", d: "150 m entfernt", note: "2× begegnet · Café Einstein", c: "from-puq-pink to-puq-pink-2", ring: "border-puq-mint" },
    { i: "LK", n: "Lukas, 28", d: "200 m entfernt", note: "Online · Tempelhofer Feld", c: "from-puq-pink-2 to-violet-500", ring: "border-puq-mint", online: true },
    { i: "MR", n: "Marie, 27", d: "320 m entfernt", note: "Hallo gesendet · vor 5 Min", c: "from-puq-pink to-orange-500", ring: "border-puq-pink", hallo: true },
    { i: "SO", n: "Sophie, 24", d: "450 m entfernt", note: "3× begegnet · Hauptbahnhof", c: "from-violet-700 to-orange-500", ring: "border-puq-lemon" },
    { i: "AN", n: "Anna, 25", d: "150 m entfernt", note: "Mit Freundin", c: "from-emerald-500 to-puq-pink-2", ring: "border-puq-mint" },
    { i: "PA", n: "Paul, 30", d: "200 m entfernt", note: "Neu in der Nähe", c: "from-puq-pink to-puq-indigo-2", ring: "border-puq-pink" },
  ];
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2">
        <div>
          <div className="text-[24px] font-bold">In der Nähe</div>
          <div className="text-[12px] text-puq-muted">23 Personen · Echtzeit</div>
        </div>
        <button className="grid h-8 w-8 place-items-center text-puq-muted">🔍</button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="rounded-full border border-puq-mint/50 bg-puq-mint/10 px-3 py-1.5 text-center text-[12px] font-semibold text-puq-mint">● 23 aktiv jetzt</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill variant="active">Alle</Pill>
          <Pill variant="mint">● Online</Pill>
          <Pill variant="lemon">● Begegnet</Pill>
          <Pill variant="pink">● Neu</Pill>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.n} className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 ${c.ring} bg-gradient-to-br ${c.c}`}>
              <div className="absolute right-2 top-2"><span className={`block h-3 w-3 rounded-full ${c.online ? "bg-puq-mint" : c.hallo ? "bg-puq-pink" : "bg-puq-mint"}`} /></div>
              <div className="absolute inset-0 grid place-items-center text-7xl font-bold text-white/20">{c.i}</div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                <div className="text-[14px] font-bold">{c.n}</div>
                <div className="text-[10.5px] text-white/80">{c.d}</div>
                <div className={`mt-0.5 text-[9.5px] font-bold ${c.hallo ? "text-puq-pink" : "text-puq-mint"}`}>{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="entdecken" />
    </Screen>
  );
}
