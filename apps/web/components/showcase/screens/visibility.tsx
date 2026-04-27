"use client";
import { Screen, StatusBar, PinIcon } from "../chrome";
import { PrimaryBtn, ScreenHeader, OptionRow, Pill, FootBar, SectionLabel, Card, Dots, TextBtn } from "../ui";

const HEADER = "Who can see you?";

function VisibilityHdr({ active }: { active: number }) {
  return (
    <>
      <StatusBar />
      <ScreenHeader title={HEADER} subtitle="6 Steps for full control" centered />
      <div className="relative z-10 flex justify-center pb-3"><Dots total={6} active={active} /></div>
    </>
  );
}

function CardFrame({ tone, children }: { tone: "pink" | "mint" | "lemon" | "indigo" | "cyan"; children: React.ReactNode }) {
  const map = {
    pink: "border-puq-pink/70",
    mint: "border-puq-mint/70",
    lemon: "border-puq-lemon/70",
    indigo: "border-puq-indigo-2/70",
    cyan: "border-[#5BC8FF]/70",
  };
  return <div className={`mx-4 rounded-3xl border-2 ${map[tone]} bg-puq-deep/95 p-5`}>{children}</div>;
}

/* Screen 23 — Step 1 Visibility Mode */
export function S23_Visibility1() {
  const opts = [
    { ic: "🌍", t: "Global", s: "Everyone can see you", c: "pink" as const, on: true },
    { ic: "🏙", t: "Region", s: "City · District · Street" },
    { ic: "👻", t: "Phantom", s: "You see others — invisible" },
    { ic: "🚫", t: "Zero", s: "All off, no data" },
  ];
  return (
    <Screen>
      <VisibilityHdr active={0} />
      <div className="relative z-10 flex-1">
        <CardFrame tone="pink">
          <div className="text-[12px] font-bold text-puq-pink"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-puq-pink text-[10px] text-white">1</span>Visibility Mode</div>
          <div className="mt-4 space-y-2.5">
            {opts.map((o) => (
              <OptionRow key={o.t} icon={<span className="text-2xl">{o.ic}</span>} title={o.t} subtitle={o.s} selected={!!o.on} selectColor="pink" />
            ))}
          </div>
          <div className="mt-5"><PrimaryBtn>Next → Step 2</PrimaryBtn></div>
        </CardFrame>
      </div>
    </Screen>
  );
}

/* Screen 24 — Step 2 Visible to */
export function S24_Visibility2() {
  const opts = [
    { ic: "👥", t: "Alle", s: "Jeder kann dich sehen", on: true },
    { ic: "👫", t: "Freunde", s: "Nur deine Freunde" },
    { ic: "✋", t: "Nur diese Freunde", s: "Einzeln auswählen" },
    { ic: "😎", t: "Außer meine Freunde", s: "Everyone except friends" },
    { ic: "👨‍👩‍👧", t: "Gruppe", s: "Only a specific group" },
  ];
  return (
    <Screen>
      <VisibilityHdr active={1} />
      <div className="relative z-10 flex-1">
        <CardFrame tone="mint">
          <div className="text-[12px] font-bold text-puq-mint"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-puq-mint text-[10px] text-puq-deep">2</span>Visible to</div>
          <div className="mt-4 space-y-2.5">
            {opts.map((o) => (
              <OptionRow key={o.t} icon={<span className="text-2xl">{o.ic}</span>} title={o.t} subtitle={o.s} selected={!!o.on} selectColor="mint" />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-puq-pink">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-puq-pink">+</span>
            Neue Gruppe erstellen
          </div>
          <div className="mt-4"><PrimaryBtn color="mint">Next → Step 3</PrimaryBtn></div>
        </CardFrame>
      </div>
    </Screen>
  );
}

/* Screen 25 — Step 3 Visible to Gender */
export function S25_Visibility3() {
  const opts = [
    { ic: "👥", t: "Alle", s: "Keine Einschränkung", on: true },
    { ic: "👩", t: "Nur Frauen", s: "Nur für Frauen sichtbar" },
    { ic: "🧑", t: "Nur Männer", s: "Nur für Männer sichtbar" },
    { ic: "⚧", t: "Nur Divers", s: "Nur für Divers sichtbar" },
  ];
  return (
    <Screen>
      <VisibilityHdr active={2} />
      <div className="relative z-10 flex-1">
        <CardFrame tone="lemon">
          <div className="text-[12px] font-bold text-puq-lemon"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-puq-lemon text-[10px] text-puq-deep">3</span>Visible to Gender</div>
          <div className="mt-4 space-y-2.5">
            {opts.map((o) => (
              <OptionRow key={o.t} icon={<span className="text-2xl">{o.ic}</span>} title={o.t} subtitle={o.s} selected={!!o.on} selectColor="lemon" />
            ))}
          </div>
          <div className="mt-5"><PrimaryBtn color="lemon">Next → Step 4</PrimaryBtn></div>
        </CardFrame>
      </div>
    </Screen>
  );
}

/* Screen 26 — Step 4 Visibility Radius */
export function S26_Visibility4() {
  return (
    <Screen>
      <VisibilityHdr active={3} />
      <div className="relative z-10 flex-1">
        <CardFrame tone="cyan">
          <div className="text-[12px] font-bold text-[#5BC8FF]"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-[#5BC8FF] text-[10px] text-puq-deep">4</span>Visibility Radius</div>
          <div className="mt-4 text-center text-[64px] font-bold tracking-tight">50 km</div>
          <div className="relative mt-4 h-3 rounded-full bg-puq-card-2">
            <div className="absolute left-0 top-0 h-full w-[55%] rounded-full bg-[#5BC8FF]" />
            <span className="absolute left-[55%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#5BC8FF] ring-4 ring-[#5BC8FF]/30" />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-puq-muted"><span>0,1 km</span><span>10.000 km</span></div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Pill variant="outline">1 km</Pill>
            <Pill variant="outline">5 km</Pill>
            <Pill variant="default" className="bg-[#5BC8FF]/15 border border-[#5BC8FF]/60 text-[#5BC8FF]">50 km</Pill>
            <Pill variant="outline">500 km</Pill>
            <Pill variant="outline">∞</Pill>
          </div>
          <div className="mt-4"><PrimaryBtn color="cyan">Next → Step 5</PrimaryBtn></div>
        </CardFrame>
      </div>
    </Screen>
  );
}

/* Screen 27 — Step 5 Visibility Duration */
export function S27_Visibility5() {
  const slots = [
    { l: "Jahre", v: "0" },
    { l: "Monate", v: "0" },
    { l: "Tage", v: "0" },
    { l: "Stunden", v: "6", on: true },
    { l: "Minuten", v: "0" },
  ];
  return (
    <Screen>
      <VisibilityHdr active={4} />
      <div className="relative z-10 flex-1">
        <CardFrame tone="lemon">
          <div className="text-[12px] font-bold text-puq-lemon-2"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-puq-lemon-2 text-[10px] text-puq-deep">5</span>Visibility Duration</div>
          <div className="mt-4 rounded-2xl border border-puq-lemon-2/40 bg-puq-card/70 p-3">
            <div className="text-[12.5px] font-semibold">Bis zur Deaktivierung sichtbar.</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-puq-pink px-2.5 py-1 text-[10px] font-bold"><PinIcon /> Standort ✏️</div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {slots.map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-puq-muted">{s.l}</div>
                  <div className={`mt-1 grid h-12 place-items-center rounded-xl text-2xl font-bold ${s.on ? "border-2 border-puq-lemon-2 bg-puq-card text-white" : "bg-puq-card-2 text-puq-text"}`}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <Card variant="success" className="mt-4 border-puq-mint/40">
            <div className="text-[12.5px] font-semibold">Deine aktuelle Sichtbarkeit:</div>
            <div className="mt-1 text-[12px] text-puq-muted flex items-center gap-1.5">🌍 Global · 👥 Freunde · 📍 50 km <span className="font-bold text-white">6 Std</span></div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-puq-line-2"><div className="h-full w-1/2 bg-gradient-to-r from-puq-mint to-puq-lemon" /></div>
          </Card>
          <div className="mt-4"><PrimaryBtn color="lemon">Next → Step 6</PrimaryBtn></div>
        </CardFrame>
      </div>
    </Screen>
  );
}

/* Screen 28 — Step 6 Map + Summary */
export function S28_Visibility6() {
  return (
    <Screen>
      <VisibilityHdr active={5} />
      <div className="relative z-10 flex-1 px-4 pb-6">
        <div className="grid place-items-center"><PinIcon /></div>
        <h2 className="mt-2 text-center text-[22px] font-bold">Wo bist du sichtbar?</h2>
        <div className="text-center text-[12px] text-puq-muted">Stufe 6 — Standort &amp; Karte</div>
        <Card className="mt-4 h-44 overflow-hidden border-puq-line-2/40 p-0">
          <div className="relative h-full w-full bg-puq-night">
            <div className="absolute inset-4 grid place-items-center">
              <div className="relative grid h-32 w-32 place-items-center rounded-full border border-puq-pink/40">
                <div className="absolute inset-8 rounded-full border border-puq-pink/30" />
                <div className="h-3 w-3 rounded-full bg-puq-pink" />
              </div>
            </div>
            <div className="absolute bottom-2 right-3 text-[11px] text-puq-muted">Radius: <span className="font-bold text-puq-pink">50 km</span></div>
          </div>
        </Card>
        <Card variant="success" className="mt-3 border-puq-mint/40">
          <div className="flex items-center gap-2"><PinIcon /><div><div className="text-[13.5px] font-bold">Standort aktivieren</div><div className="text-[11px] text-puq-muted">Damit wir Leute in deiner Nähe finden</div></div></div>
          <button className="mt-3 w-full rounded-full bg-puq-mint/15 border border-puq-mint/50 py-2 text-[13px] font-bold text-puq-mint">Standort freigeben</button>
        </Card>
        <div className="mt-3"><SectionLabel color="muted">MODE</SectionLabel></div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill variant="active">🌍 Global</Pill>
          <Pill variant="outline">🏙 Region</Pill>
          <Pill variant="outline">👻 Phantom</Pill>
          <Pill variant="outline">🚫 Zero</Pill>
        </div>
        <Card variant="danger" className="mt-3 border-puq-pink/40 bg-puq-pink/5">
          <SectionLabel color="pink">Zusammenfassung (6 Stufen):</SectionLabel>
          <ul className="mt-2 space-y-0.5 text-[12.5px] text-puq-text/90">
            <li>1. 🌍 Modus: Global</li>
            <li>2. 👫 Für Wen: Freunde</li>
            <li>3. 👩 Geschlecht: Nur Frauen</li>
            <li>4. 📍 Radius: 50 km</li>
            <li>5. ⏱ Dauer: 6 Stunden</li>
            <li>6. 📍 Standort: Aktiv</li>
          </ul>
        </Card>
        <div className="mt-3"><PrimaryBtn>Fertig — Los geht's! 🎉</PrimaryBtn></div>
      </div>
    </Screen>
  );
}
