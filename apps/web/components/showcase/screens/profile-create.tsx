"use client";
import { Screen, StatusBar, MicIcon, PlayIcon, PauseIcon } from "../chrome";
import { PrimaryBtn, Field, Input, ScreenHeader, OptionRow, Pill, FootBar, SectionLabel, StepBar, Card, InterestPills, Avatar } from "../ui";

/* Screen 15 — Step 2/8 Birthday */
export function S15_StepBirthday() {
  const Col = ({ label, items, sel }: { label: string; items: string[]; sel: number }) => (
    <div className="flex-1 rounded-2xl border border-puq-line-2/40 bg-puq-card/70 p-3">
      <div className="mb-2 text-center text-[10.5px] font-bold tracking-[0.2em] text-puq-muted">{label}</div>
      {items.map((v, i) => (
        <div key={v + i} className={`py-1.5 text-center text-[18px] ${i === sel ? "rounded-xl border border-puq-pink bg-puq-card text-2xl font-bold" : "text-puq-muted/70"}`}>{v}</div>
      ))}
    </div>
  );
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">STEP 2 / 8 · AGE</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          When is your
          <em className="block font-serif italic text-puq-pink">birthday?</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Min age 18 — stays private.</p>
        <div className="mt-6 flex gap-2.5">
          <Col label="DAY" items={["11", "12", "13"]} sel={1} />
          <Col label="MONTH" items={["Apr", "May", "Jun"]} sel={1} />
          <Col label="YEAR" items={["1991", "1992", "1993"]} sel={1} />
        </div>
        <Card variant="success" className="mt-5">
          <SectionLabel color="mint">YOUR AGE</SectionLabel>
          <div className="mt-1 text-[14px] text-white">33 years · visible on profile</div>
        </Card>
      </div>
      <FootBar><PrimaryBtn>Continue</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 16 — Step 3/8 Gender */
export function S16_StepGender() {
  const opts = [
    { l: "Frau", s: "she/her", emoji: "👩", color: "pink" as const, on: true },
    { l: "Mann", s: "he/him", emoji: "🧑", color: "indigo" as const },
    { l: "Divers", s: "they/them", emoji: "⚧", color: "indigo" as const },
    { l: "Lieber nicht sagen", s: "private", emoji: "👥", color: "indigo" as const },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">STEP 3 / 8 · I AM</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          My
          <em className="block font-serif italic text-puq-pink">Gender.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Du kannst es später in Einstellungen ändern.</p>
        <div className="mt-5 space-y-2.5">
          {opts.map((o) => (
            <OptionRow
              key={o.l}
              icon={<span className="text-2xl">{o.emoji}</span>}
              title={o.l}
              subtitle={o.s}
              selected={!!o.on}
              selectColor="pink"
            />
          ))}
        </div>
      </div>
      <FootBar><PrimaryBtn>Continue</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 17 — Photos (Step 1/3 alt) */
export function S17_StepPhotos1() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <StepBar value={1} total={3} />
      <div className="relative z-10 flex-1 px-6 pt-4">
        <h1 className="text-[28px] font-bold leading-tight">
          Zeig dich von<br />deiner besten Seite.
        </h1>
        <p className="mt-2 text-[13px] text-puq-muted">Lade mindestens 2 Fotos hoch.</p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <PhotoTile filled label="AB" main />
          {[1, 2, 3, 4, 5].map((i) => <PhotoTile key={i} />)}
        </div>
      </div>
      <FootBar>
        <PrimaryBtn>Continue</PrimaryBtn>
        <div className="mt-2 text-center text-[11px] text-puq-faint">Tipp: Echte Fotos bekommen 4× mehr Begegnungen</div>
      </FootBar>
    </Screen>
  );
}
function PhotoTile({ filled, label, main }: { filled?: boolean; label?: string; main?: boolean }) {
  if (filled) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-puq-indigo to-puq-pink/70 grid place-items-center">
        <div className="text-3xl font-bold text-white/85">{label}</div>
        {main ? <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-puq-pink text-[10px]">★</span> : null}
      </div>
    );
  }
  return (
    <div className="grid aspect-[4/5] place-items-center rounded-2xl border-2 border-dashed border-puq-line-2/40 bg-puq-card/40 text-2xl text-puq-faint">+</div>
  );
}

/* Screen 18 — Step 4/8 Photos with AI Profile Check */
export function S18_StepPhotosAI() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">STEP 4 / 8 · PHOTOS</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Zeig dich von
          <em className="block font-serif italic text-puq-pink">deiner besten Seite.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Mindestens 3 Fotos · max. 6 · KI-Tipp inklusive.</p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { c: "from-puq-indigo via-violet-700 to-puq-pink", main: true, score: 9.2 },
            { c: "from-amber-500 via-orange-500 to-puq-pink", score: 9.2 },
            { c: "from-emerald-700 to-puq-indigo", score: 9.2 },
          ].map((t, i) => (
            <div key={i} className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${t.c}`}>
              {t.main ? <span className="absolute left-1.5 top-1.5 rounded-md bg-puq-lemon px-2 py-0.5 text-[10px] font-bold text-puq-deep">★ HAUPT</span> : null}
              <span className="absolute right-1.5 bottom-1.5 rounded-md bg-puq-mint px-2 py-0.5 text-[10px] font-bold text-puq-deep">{t.score}</span>
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-puq-line-2/40 bg-puq-card/40 text-2xl text-puq-faint">+</div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-puq-lemon/50 bg-puq-lemon/5 p-3.5">
          <div className="text-[10.5px] font-bold tracking-[0.2em] text-puq-lemon">★ AI PROFILE CHECK</div>
          <div className="mt-1 text-[13px] font-semibold">Foto 1 ist stark — Foto 2 ist zu dunkel.</div>
          <div className="mt-0.5 text-[12px] text-puq-muted">Tausch Foto 2 gegen ein helleres aus.</div>
        </div>
      </div>
      <FootBar><PrimaryBtn>Continue</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 19 — Step 5/8 Bio */
export function S19_StepBio() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">STEP 5 / 8 · BIO</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Drei Sätze, die
          <em className="block font-serif italic text-puq-pink">dich ausmachen.</em>
        </h1>
        <Card className="mt-5 relative">
          <p className="font-serif italic text-[14px] text-puq-text/90">"Lieber spontan als perfekt."</p>
          <p className="mt-2 text-[14px] text-puq-text/90">Ich liebe lange Spaziergänge in Friedrichshain, gutes Wein und noch bessere Gespräche bis 2 Uhr.</p>
          <div className="mt-3 h-0.5 w-12 rounded bg-puq-pink" />
          <div className="mt-2 text-right text-[11px] text-puq-faint">98 / 240 Zeichen</div>
        </Card>
        <div className="mt-5">
          <SectionLabel color="indigo">KI-VORSCHLÄGE</SectionLabel>
          <div className="mt-2.5 space-y-2">
            <Suggestion color="mint" title="Authentischer" sub="Eher 'echt' als 'authentisch'" />
            <Suggestion color="lemon" title="Kürzen" sub="Letzten Satz raus → kürzer wirkt" />
            <Suggestion color="pink" title="Warmer Ton" sub="Ersten Satz anpassen" />
          </div>
        </div>
      </div>
      <FootBar><PrimaryBtn>Continue</PrimaryBtn></FootBar>
    </Screen>
  );
}
function Suggestion({ color, title, sub }: { color: "mint" | "lemon" | "pink"; title: string; sub: string }) {
  const map = { mint: "border-puq-mint", lemon: "border-puq-lemon", pink: "border-puq-pink" } as const;
  const tx = { mint: "text-puq-mint", lemon: "text-puq-lemon", pink: "text-puq-pink" } as const;
  return (
    <div className={`rounded-xl border-l-2 ${map[color]} bg-puq-card/70 px-3 py-2.5 flex items-center gap-3`}>
      <div className="flex-1">
        <div className={`text-[13.5px] font-bold ${tx[color]}`}>{title}</div>
        <div className="text-[12px] text-puq-muted">{sub}</div>
      </div>
      <span className={`text-lg ${tx[color]}`}>→</span>
    </div>
  );
}

/* Screen 20 — Interests */
export function S20_StepInterests() {
  const all = ["Yoga", "Bouldern", "Indie-Musik", "Kaffee", "Kochen", "Lesen", "Joggen", "Brettspiele", "Vinyl", "Wandern", "Filme", "Reisen", "Tanzen", "Fotografie", "Yoga ", "Kunst", "Schach", "Gaming"];
  const sel = ["Yoga", "Bouldern", "Indie-Musik", "Lesen", "Vinyl", "Reisen"];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <StepBar value={3} total={3} />
      <div className="relative z-10 flex-1 px-6 pt-4">
        <h1 className="text-[28px] font-bold leading-tight">Was magst du?</h1>
        <p className="mt-2 text-[12.5px] text-puq-muted">Wähle 5-10 Interessen, um bessere Begegnungen zu bekommen.</p>
        <div className="mt-5"><InterestPills items={all} selected={sel} variant="pink" /></div>
      </div>
      <FootBar>
        <div className="mb-3 text-center text-[12px] text-puq-muted">7 von 10 ausgewählt</div>
        <PrimaryBtn>Finish Profile</PrimaryBtn>
      </FootBar>
    </Screen>
  );
}

/* Screen 21 — Intent */
export function S21_StepIntent() {
  const opts = [
    { l: "Relationship", s: "Eine ernste Verbindung — etwas Echtes.", emoji: "❤️", on: true },
    { l: "Casual Date", s: "Locker treffen, schauen was passiert.", emoji: "☕" },
    { l: "Friendship", s: "Neue Leute kennenlernen, ohne Druck.", emoji: "👓" },
    { l: "Explore", s: "Ich bin offen für alles.", emoji: "✨" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Create Profile" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">STEP 4 / 4</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Was suchst du
          <em className="block font-serif italic text-puq-pink">auf PuQ.me?</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">You can change this later.</p>
        <div className="mt-5 space-y-2.5">
          {opts.map((o) => (
            <OptionRow key={o.l} icon={<span className="text-2xl">{o.emoji}</span>} title={o.l} subtitle={o.s} selected={!!o.on} selectColor="pink" />
          ))}
        </div>
      </div>
      <FootBar><PrimaryBtn>Finish Profile</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 22 — Filter */
export function S22_Filter() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Filter" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <h1 className="text-[28px] font-bold">Suchpräferenzen</h1>
        <p className="mt-1 text-[13px] text-puq-muted">Wer soll dir vorgeschlagen werden?</p>

        <div className="mt-5">
          <SectionLabel color="muted">GENDER</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill variant="active">Frauen</Pill>
            <Pill variant="outline">Maenner</Pill>
            <Pill variant="mint">Diverse</Pill>
            <Pill variant="outline">Alle</Pill>
          </div>
        </div>
        <div className="mt-5">
          <SectionLabel color="muted">AGE</SectionLabel>
          <div className="mt-1 text-2xl font-bold">23 — 35 Jahre</div>
          <DualSlider />
        </div>
        <div className="mt-5">
          <SectionLabel color="muted">DISTANCE · 1 – 10.000 KM</SectionLabel>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold">Bis 25 km</div>
            <div className="text-[11px] text-puq-mint">aktueller Radius</div>
          </div>
          <SingleSlider />
          <div className="mt-1 flex justify-between text-[10.5px] text-puq-muted">
            <span>1 km</span><span>10.000 km</span>
          </div>
        </div>
        <div className="mt-5">
          <SectionLabel color="muted">RELATIONSHIP GOAL</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill variant="active">Beziehung</Pill>
            <Pill variant="outline">Freundschaft</Pill>
            <Pill variant="outline">Casual</Pill>
            <Pill variant="active">Erkunden</Pill>
          </div>
        </div>
      </div>
      <FootBar><PrimaryBtn>Save Filter</PrimaryBtn></FootBar>
    </Screen>
  );
}
function DualSlider() {
  return (
    <div className="relative mt-3 h-3 rounded-full bg-gradient-to-r from-puq-pink/40 via-puq-pink to-puq-indigo-2/40">
      <span className="absolute left-[15%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-puq-pink ring-4 ring-puq-pink/30" />
      <span className="absolute right-[20%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-puq-pink ring-4 ring-puq-pink/30" />
    </div>
  );
}
function SingleSlider() {
  return (
    <div className="relative mt-3 h-3 rounded-full bg-puq-card-2">
      <div className="absolute left-0 top-0 h-full w-[40%] rounded-full bg-gradient-to-r from-puq-pink to-puq-mint" />
      <span className="absolute left-[40%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-puq-mint ring-4 ring-puq-mint/30" />
    </div>
  );
}

/* Screen 33 — Voice Intro Recording */
export function S33_VoiceIntroRec() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Voice-Intro" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="lemon">★ NEU · YOUR VOICE COUNTS</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          15 Sekunden,
          <em className="block font-serif italic text-puq-pink">die alles aendern.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Eine kurze Sprachaufnahme schlaegt jeden Bio-Text.</p>
        <div className="mt-12 flex flex-col items-center">
          <div className="relative grid h-56 w-56 place-items-center">
            <div className="absolute inset-4 animate-puq-radar rounded-full border border-puq-pink/40" />
            <div className="absolute inset-12 rounded-full border border-puq-pink/30" />
            <div className="flex h-20 items-center gap-1">
              {Array.from({ length: 26 }).map((_, i) => (
                <span key={i} className="block w-1 rounded-full bg-puq-pink" style={{ height: `${20 + Math.abs(13 - i) * 4}px` }} />
              ))}
            </div>
          </div>
          <button className="-mt-2 grid h-16 w-16 place-items-center rounded-full bg-puq-pink shadow-puq-glow">
            <span className="h-5 w-5 rounded bg-white" />
          </button>
          <div className="mt-3 text-3xl font-bold tracking-tight">00:08</div>
          <div className="text-[11px] text-puq-muted">7 Sekunden uebrig</div>
        </div>
        <Card variant="warning" className="mt-6">
          <SectionLabel color="lemon">★ TIP</SectionLabel>
          <div className="mt-1 text-[12.5px]">Sag, was du dieses Wochenende vorhast.</div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 34 — Voice Intro Playback */
export function S34_VoiceIntroPlay() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Voice-Intro" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="mint">★ YOUR RECORDING</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold">Wie klingt es?</h1>
        <Card className="mt-5 border-puq-pink/40">
          <div className="flex h-20 items-center gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className={`block w-1 rounded-full ${i < 12 ? "bg-puq-pink" : "bg-puq-indigo-2"}`} style={{ height: `${10 + Math.abs(10 - (i % 12)) * 4}px` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[12.5px] font-semibold">
            <span>00:09</span><span className="text-puq-muted">00:15</span>
          </div>
          <div className="mt-3 grid place-items-center">
            <button className="grid h-12 w-12 place-items-center rounded-full bg-puq-pink"><PauseIcon className="h-5 w-5 text-white" /></button>
          </div>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="rounded-full border border-puq-line-2 bg-transparent py-3 text-sm font-semibold text-puq-text/90">Neu aufnehmen</button>
          <button className="rounded-full bg-puq-pink py-3 text-sm font-semibold text-white">Speichern</button>
        </div>
        <Card variant="warning" className="mt-5">
          <SectionLabel color="lemon">PROFI-TIP</SectionLabel>
          <div className="mt-1 text-[12.5px]">Spuerbar laenger im Profil sichtbar als Text.</div>
          <div className="mt-0.5 text-[11.5px] text-puq-muted">Nutzer mit Voice-Intro: 4× mehr Hallos.</div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 35 — Profile Preview */
export function S35_ProfilePreview() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Profile Preview" trailing={<button className="grid h-7 w-7 place-items-center text-puq-text"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6"><path d="M5 7h14M5 12h14M5 17h14" /></svg></button>} />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-puq-pink to-orange-400">
          <div className="absolute inset-0 grid place-items-center text-7xl font-bold text-white/30">AB</div>
          <div className="absolute left-3 top-3"><span className="rounded-full bg-puq-mint/15 border border-puq-mint/50 px-2.5 py-0.5 text-[11px] font-semibold text-puq-mint">● Online</span></div>
          <div className="absolute right-3 top-3"><span className="rounded-full border border-puq-mint/50 bg-puq-mint/15 px-2.5 py-0.5 text-[11px] font-semibold text-puq-mint">✓ Verifiziert</span></div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[28px] font-bold leading-tight">Alan, 32</div>
            <div className="text-sm text-white/80">Berlin Mitte</div>
          </div>
        </div>
        <Card className="mt-4 border-puq-pink/50">
          <div className="text-[10.5px] font-bold tracking-[0.2em] text-puq-pink">★ VOICE-INTRO · 0:15</div>
          <div className="mt-2 flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-puq-pink"><PlayIcon className="h-4 w-4 text-white" /></button>
            <div className="flex h-8 flex-1 items-center gap-1">
              {Array.from({ length: 32 }).map((_, i) => (
                <span key={i} className="block w-0.5 rounded-full bg-puq-pink/80" style={{ height: `${6 + Math.abs(15 - i) * 2}px` }} />
              ))}
            </div>
          </div>
        </Card>
        <div className="mt-5">
          <SectionLabel color="muted">UEBER MICH</SectionLabel>
          <p className="mt-2 font-serif italic text-[14px]">"Lieber spontan als perfekt."</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill variant="outline">Yoga</Pill><Pill variant="outline">Bouldern</Pill><Pill variant="outline">Indie</Pill>
        </div>
      </div>
    </Screen>
  );
}
