"use client";
import { Screen, StatusBar, HomeBar, PuqMark, PuqWordmark, BellIcon, PinIcon, ShieldIcon } from "../chrome";
import { PrimaryBtn, GhostBtn, OptionRow, Pill, ScreenHeader, Card, FootBar, Dots, SectionLabel, TextBtn } from "../ui";

/* ─────────────────────────────────────────────────────────────
   Screen 01 — Lockscreen mit App-Icons
   ───────────────────────────────────────────────────────────── */
export function S01_Lockscreen() {
  const apps = [
    { l: "Spot", n: "Spotify", b: "bg-emerald-500" },
    { l: "X", n: "X", b: "bg-black" },
    { l: "IG", n: "IG", b: "bg-amber-500" },
    { l: "PuQ", n: "PuQ.me", b: "bg-gradient-to-br from-puq-indigo-2 to-puq-pink", badge: 3 },
    { l: "Wett", n: "Wetter", b: "bg-sky-500" },
    { l: "Mail", n: "Mail", b: "bg-rose-500" },
    { l: "WApp", n: "WApp", b: "bg-emerald-600" },
    { l: "Appl", n: "Apple", b: "bg-zinc-800" },
    { l: "Maps", n: "Maps", b: "bg-blue-600" },
    { l: "Calc", n: "Calc", b: "bg-violet-600" },
    { l: "Note", n: "Notes", b: "bg-yellow-500" },
    { l: "Phot", n: "Photos", b: "bg-rose-600" },
    { l: "Safa", n: "Safari", b: "bg-blue-500" },
    { l: "Face", n: "FaceT", b: "bg-emerald-500" },
    { l: "Cam", n: "Cam", b: "bg-orange-500" },
    { l: "Musi", n: "Music", b: "bg-puq-pink" },
  ];
  return (
    <Screen bg="deep">
      <StatusBar />
      <div className="relative z-10 flex flex-col items-center pt-6">
        <div className="text-[88px] font-light leading-none tracking-tight">14:23</div>
        <div className="mt-1 text-sm text-puq-muted">Donnerstag, 26. April</div>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-4 gap-x-3 gap-y-4 px-6">
        {apps.map((a) => (
          <div key={a.n} className="flex flex-col items-center">
            <div className={`relative grid h-16 w-16 place-items-center rounded-2xl ${a.b} text-sm font-bold text-white`}>{a.l}
              {a.badge ? (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-puq-pink text-[11px] font-bold text-white">{a.badge}</span>
              ) : null}
            </div>
            <div className="mt-1.5 text-[10.5px] font-medium text-white">{a.n}</div>
          </div>
        ))}
      </div>
      <div className="relative z-10 mt-6 flex justify-center">
        <div className="rounded-full bg-white/15 px-6 py-2 text-sm text-white/80 backdrop-blur">Suche</div>
      </div>
      <div className="relative z-10 mt-auto px-3 pb-7">
        <div className="flex justify-around rounded-3xl bg-white/10 p-2 backdrop-blur">
          <div className="h-12 w-12 rounded-xl bg-blue-500" />
          <div className="h-12 w-12 rounded-xl bg-emerald-500" />
          <div className="h-12 w-12 rounded-xl bg-blue-700" />
          <div className="h-12 w-12 rounded-xl bg-puq-pink" />
        </div>
      </div>
      <HomeBar />
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 02 — Splash
   ───────────────────────────────────────────────────────────── */
export function S02_Splash() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="relative grid h-44 w-44 place-items-center">
          <div className="absolute inset-0 animate-puq-radar rounded-full border border-puq-pink/40" />
          <div className="absolute inset-6 animate-puq-radar rounded-full border border-puq-pink/30" style={{ animationDelay: "0.6s" }} />
          <PuqMark size={96} />
        </div>
        <h1 className="mt-10 text-5xl font-bold tracking-tight">
          PuQ <span className="font-serif italic text-puq-pink">.me</span>
        </h1>
        <p className="mt-2 text-base text-puq-muted">Echte Begegnungen</p>
      </div>
      <div className="relative z-10 pb-10 text-center text-xs text-puq-faint">
        Gemacht in Berlin · DSGVO-konform
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 03 — Sprachwahl
   ───────────────────────────────────────────────────────────── */
export function S03_Language() {
  const langs = [
    { code: "DE", label: "Deutsch", sub: "Deutsch", on: true },
    { code: "EN", label: "English", sub: "English" },
    { code: "ES", label: "Español", sub: "Spanisch" },
    { code: "FR", label: "Français", sub: "Französisch" },
    { code: "PT", label: "Português", sub: "Portugiesisch" },
    { code: "RU", label: "Русский", sub: "Russisch" },
    { code: "TR", label: "Türkçe", sub: "Türkisch" },
    { code: "ZH", label: "中文", sub: "Chinesisch" },
    { code: "HI", label: "हिन्दी", sub: "Hindi" },
    { code: "AR", label: "العربية", sub: "Arabisch" },
  ];
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-28 pt-3">
        <PuqWordmark size="md" />
        <div className="mt-7">
          <SectionLabel color="mint">★ WORLDWIDE AVAILABLE</SectionLabel>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
            Waehle deine
            <em className="block font-serif italic text-puq-pink">Sprache.</em>
          </h1>
          <p className="mt-3 text-sm text-puq-muted">10 Sprachen — von Berlin bis Tokio.</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {langs.map((l) => (
            <button
              key={l.code}
              className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left ${l.on ? "border-puq-pink bg-puq-card" : "border-puq-line-2/40 bg-puq-card/60"}`}
            >
              <div className={`grid h-8 w-8 place-items-center rounded-xl text-[11px] font-bold ${l.on ? "bg-puq-pink text-white" : "bg-puq-card-2 text-puq-muted"}`}>{l.code}</div>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">{l.label}</div>
                <div className="text-[11px] text-puq-faint">{l.sub}</div>
              </div>
              {l.on ? <span className="grid h-5 w-5 place-items-center rounded-full bg-puq-pink text-[10px]">✓</span> : null}
            </button>
          ))}
        </div>
      </div>
      <FootBar><PrimaryBtn>Confirm</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 04 — Welcome
   ───────────────────────────────────────────────────────────── */
export function S04_Welcome() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
        <div className="mt-4 flex w-full justify-center"><Dots total={3} active={0} /></div>
        <div className="relative grid h-72 w-72 place-items-center">
          <div className="absolute inset-12 rounded-full border border-puq-indigo-2/60" />
          <div className="absolute inset-3 rounded-full border border-puq-indigo-2/30" />
          <div className="absolute left-3 top-12 grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-[11px] font-bold">L</div>
          <div className="absolute right-2 top-16 grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-[11px] font-bold">E</div>
          <div className="absolute left-12 bottom-4 grid h-7 w-7 place-items-center rounded-full bg-puq-card text-[11px] font-bold text-white">M</div>
          <div className="absolute right-8 bottom-12 grid h-7 w-7 place-items-center rounded-full bg-puq-mint text-[11px] font-bold text-puq-deep">S</div>
          <div className="grid h-16 w-16 place-items-center rounded-full bg-puq-pink/60">
            <div className="h-3 w-3 rounded-full bg-puq-pink" />
          </div>
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-tight">
            Echte Begegnungen,<br />in deiner Stadt.
          </h1>
          <p className="mx-4 mt-3 text-[13.5px] text-puq-muted">
            Triff Menschen, denen du wirklich begegnet bist — nicht nur ein Profil.
          </p>
        </div>
        <div className="w-full">
          <PrimaryBtn>Loslegen</PrimaryBtn>
          <button className="mt-3 w-full text-sm text-puq-pink">Ich habe schon ein Konto</button>
        </div>
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 05 — Wert-Slide 1
   ───────────────────────────────────────────────────────────── */
export function S05_ValueSlide1() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
        <Dots total={3} active={0} />
        <div className="relative grid h-64 w-64 place-items-center">
          <div className="absolute -left-2 top-12 grid h-10 w-10 place-items-center rounded-full bg-puq-card text-xs font-bold ring-2 ring-puq-indigo-2">L</div>
          <div className="absolute -right-1 top-20 grid h-10 w-10 place-items-center rounded-full bg-puq-pink text-xs font-bold">E</div>
          <div className="absolute left-20 -bottom-2 grid h-10 w-10 place-items-center rounded-full bg-puq-mint text-xs font-bold text-puq-deep">S</div>
          <svg viewBox="0 0 200 130" className="h-full w-full">
            <circle cx="80" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2.5" />
            <circle cx="120" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2.5" />
            <circle cx="80" cy="55" r="3.5" fill="#FF3D7F" />
            <circle cx="120" cy="55" r="3.5" fill="#FF3D7F" />
            <path d="M85 80 Q100 92 115 80" stroke="#FF3D7F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <SectionLabel color="mint">Step 1 / 3</SectionLabel>
          <h1 className="mt-3 text-[30px] font-bold leading-tight">
            Du gehst durch
            <em className="block font-serif italic text-puq-pink">deine Stadt.</em>
          </h1>
          <p className="mx-2 mt-3 text-sm text-puq-muted">
            PuQ.me läuft im Hintergrund — leise, akku-schonend, unsichtbar.
          </p>
        </div>
        <PrimaryBtn>Continue</PrimaryBtn>
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 06 — Wert-Slide 2
   ───────────────────────────────────────────────────────────── */
export function S06_ValueSlide2() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
        <Dots total={3} active={1} />
        <div className="relative grid h-64 w-64 place-items-center">
          <svg viewBox="0 0 200 130" className="h-full w-full opacity-50">
            <circle cx="80" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2" />
            <circle cx="120" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2" />
          </svg>
          <div className="absolute left-2 top-2 flex items-center gap-2 rounded-2xl border border-puq-pink/60 bg-puq-card px-2.5 py-1.5">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-puq-pink text-[10px]">EM</div>
            <div className="text-left text-[11px]"><div className="font-bold">12:30</div><div className="text-puq-muted">Cafe</div></div>
          </div>
          <div className="absolute right-0 top-12 flex items-center gap-2 rounded-2xl border border-puq-mint/60 bg-puq-card px-2.5 py-1.5">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-puq-mint text-[10px] text-puq-deep">LK</div>
            <div className="text-left text-[11px]"><div className="font-bold">12:30</div><div className="text-puq-muted">Park</div></div>
          </div>
          <div className="absolute left-1/2 -bottom-1 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-puq-lemon/60 bg-puq-card px-2.5 py-1.5">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-puq-lemon text-[10px] text-puq-deep">SV</div>
            <div className="text-left text-[11px]"><div className="font-bold">12:30</div><div className="text-puq-muted">U-Bahn</div></div>
          </div>
        </div>
        <div>
          <SectionLabel color="mint">Step 2 / 3</SectionLabel>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            Ich merke mir,
            <em className="block font-serif italic text-puq-pink">wem du begegnet bist.</em>
          </h1>
          <p className="mx-2 mt-3 text-sm text-puq-muted">
            Ohne Pop-up. Ohne Stoerung. Standorte werden nur grob gespeichert.
          </p>
        </div>
        <PrimaryBtn>Continue</PrimaryBtn>
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 07 — Wert-Slide 3
   ───────────────────────────────────────────────────────────── */
export function S07_ValueSlide3() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 py-10 text-center">
        <Dots total={3} active={2} />
        <div className="relative grid h-64 w-64 place-items-center">
          <svg viewBox="0 0 24 24" fill="#FF3D7F" className="absolute -top-2 h-7 w-7"><path d="M12 21s-7-4.35-9.5-9.5C0.5 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.5 3.5 4.5 7.5C19 16.65 12 21 12 21z" /></svg>
          <svg viewBox="0 0 200 130" className="h-full w-full">
            <circle cx="80" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2.5" />
            <circle cx="120" cy="65" r="55" fill="none" stroke="#FF3D7F" strokeWidth="2.5" />
            <line x1="80" y1="55" x2="80" y2="55" stroke="#FF3D7F" strokeWidth="6" strokeLinecap="round" />
            <circle cx="125" cy="50" r="5" fill="#FF3D7F" />
          </svg>
        </div>
        <div>
          <SectionLabel color="mint">Step 3 / 3</SectionLabel>
          <h1 className="mt-3 text-[28px] font-bold leading-tight">
            Abends zeige
            <em className="block font-serif italic text-puq-pink">ich dir die Momente.</em>
          </h1>
          <p className="mx-2 mt-3 text-sm text-puq-muted">
            Du entscheidest, wem du Hallo sagst. Echt. Real. In deiner Stadt.
          </p>
        </div>
        <PrimaryBtn>Los geht's!</PrimaryBtn>
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 08 — Privacy
   ───────────────────────────────────────────────────────────── */
export function S08_Privacy() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-6 text-center">
        <Dots total={3} active={2} />
        <div className="mt-6">
          <svg viewBox="0 0 100 100" className="h-32 w-32">
            <path d="M50 5 L90 22 L90 60 Q90 88 50 95 Q10 88 10 60 L10 22 Z" fill="none" stroke="#FF3D7F" strokeWidth="2.5" />
            <path d="M50 5 L90 22 L90 60 Q90 88 50 95 Q10 88 10 60 L10 22 Z" fill="rgba(13,31,58,0.5)" />
            <circle cx="42" cy="48" r="8" fill="none" stroke="#FF3D7F" strokeWidth="1.5" />
            <circle cx="56" cy="48" r="8" fill="none" stroke="#FF3D7F" strokeWidth="1.5" />
          </svg>
        </div>
        <h1 className="mt-4 text-[30px] font-bold leading-tight">
          Du behältst die
          <em className="block font-serif italic text-puq-pink">Kontrolle.</em>
        </h1>
        <div className="mt-6 w-full space-y-3 text-left">
          <Bullet n={8} bg="bg-puq-mint" tx="text-puq-deep" label="Sichtbarkeits-Modi: Global, Phantom, Zero …" />
          <Bullet dot bg="bg-puq-pink" tx="text-white" label="Standorte werden niemals exakt gespeichert" />
          <Bullet x bg="bg-puq-lemon" tx="text-puq-deep" label="Lösche jederzeit alle Daten — DSGVO Art. 17" />
        </div>
      </div>
      <FootBar>
        <PrimaryBtn>Verstanden, weiter</PrimaryBtn>
        <div className="mt-2 text-center text-xs text-puq-faint">Datenschutzerklärung lesen</div>
      </FootBar>
    </Screen>
  );
}
function Bullet({ label, n, dot, x, bg, tx }: { label: string; n?: number; dot?: boolean; x?: boolean; bg: string; tx: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${bg} ${tx}`}>
        {n ?? (dot ? "●" : x ? "✕" : "")}
      </div>
      <div className="flex-1 text-[13.5px] text-puq-text/90">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 13 — Standort-Erlauben
   ───────────────────────────────────────────────────────────── */
export function S13_LocationPermission() {
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 mx-3 my-4 flex flex-1 flex-col items-center justify-center rounded-3xl border border-puq-pink/40 bg-puq-deep/80 p-6 text-center backdrop-blur">
        <div className="grid h-20 w-20 place-items-center">
          <PinIcon />
        </div>
        <SectionLabel color="mint" className="mt-2">★ REAL ENCOUNTERS</SectionLabel>
        <h2 className="mt-3 text-[26px] font-bold leading-tight">
          Aktiviere deinen<br /><em className="font-serif italic text-puq-pink">Standort.</em>
        </h2>
        <p className="mt-3 text-[13.5px] text-puq-muted">
          Ohne Standort gibt es keine Begegnungen — das ist der Kern von PuQ.me.
        </p>
        <Card variant="success" className="mt-5 text-left">
          <SectionLabel color="mint">DSGVO-FIRST</SectionLabel>
          <div className="mt-1 text-[12.5px] text-puq-text/90">Standorte werden niemals exakt gespeichert — nur als ungenaue Zellen.</div>
          <div className="mt-1 text-[11.5px] text-puq-faint">Roh-Daten werden nach 24h gelöscht.</div>
        </Card>
        <div className="mt-5 w-full">
          <PrimaryBtn>Standort erlauben</PrimaryBtn>
          <div className="mt-3 text-center text-xs text-puq-muted">Später · Phantom-Modus aktivieren</div>
        </div>
      </div>
    </Screen>
  );
}

/* ─────────────────────────────────────────────────────────────
   Screen 14 — Notifications
   ───────────────────────────────────────────────────────────── */
export function S14_Notifications() {
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 mx-3 my-4 flex flex-1 flex-col items-center justify-center rounded-3xl border border-puq-mint/40 bg-puq-deep/80 p-6 text-center backdrop-blur">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-puq-mint/10 text-puq-mint">
          <BellIcon />
        </div>
        <SectionLabel color="lemon" className="mt-2">★ NUR WENN ES ZÄHLT</SectionLabel>
        <h2 className="mt-3 text-[26px] font-bold leading-tight">
          Bleib in<br /><em className="font-serif italic text-puq-mint">Verbindung.</em>
        </h2>
        <p className="mt-3 text-[13.5px] text-puq-muted">Wir benachrichtigen dich nur bei echten Momenten — nie mehr.</p>
        <div className="mt-5 w-full space-y-2 text-left text-[12.5px]">
          <Tick>Match — wenn jemand zurück Hallo sagt</Tick>
          <Tick>Begegnung — wenn ihr euch heute begegnet seid</Tick>
          <Tick>Treffen — wenn deine Aktivität bestätigt wurde</Tick>
        </div>
        <div className="mt-5 w-full">
          <PrimaryBtn>Aktivieren</PrimaryBtn>
          <div className="mt-3 text-center text-xs text-puq-muted">Später</div>
        </div>
      </div>
    </Screen>
  );
}
function Tick({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-puq-mint/15 text-[10px] text-puq-mint">✓</span>
      <span className="flex-1 text-puq-text/90">{children}</span>
    </div>
  );
}
