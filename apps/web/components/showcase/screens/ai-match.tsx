"use client";
import { Screen, StatusBar, BottomNav, PuqWordmark, BellIcon } from "../chrome";
import { PrimaryBtn, ScreenHeader, FootBar, SectionLabel, Card, Pill, Avatar, OnlinePill, ModalSheet } from "../ui";

/* Screen 39 — Frage des Tages */
export function S39_DailyQuestion() {
  const answers = [
    { i: "EM", c: "pink", n: "Emma · Kreuzberg", t: "vor 12 Min", a: "Espresso, der mein Café-Kollege mir hinges" },
    { i: "LK", c: "lemon", n: "Lukas · Mitte", t: "vor 24 Min", a: "Ein streunender Hund, der mich anlächelte" },
    { i: "AN", c: "mint", n: "Ana · Friedrichshain", t: "vor 1 Std", a: "Zufällig die richtige Antwort im Quiz gewu" },
  ];
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
        <BellIcon />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <SectionLabel color="indigo">★ FRAGE DES DAYES · 26.04.</SectionLabel>
        <h1 className="mt-2 text-[26px] font-bold leading-tight">
          "Welche kleine Sache hat heute
          <em className="font-serif italic text-puq-pink"> dein Lächeln gerettet?"</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">8.247 Berliner haben heute schon geantwortet.</p>
        <Card className="mt-4 border-puq-lemon/40">
          <p className="font-serif italic text-[14px]">"Erste Sonnenstrahlen am Spreeufer um 7 Uhr."</p>
          <div className="mt-2 h-0.5 w-12 rounded bg-puq-lemon" />
          <div className="mt-2 text-right text-[11px] text-puq-faint">42 / 200</div>
        </Card>
        <SectionLabel color="muted" className="mt-4">3 ANSWERS NEARBY</SectionLabel>
        <div className="mt-2.5 space-y-2.5">
          {answers.map((a) => (
            <Card key={a.i} className="bg-puq-card/60">
              <div className="flex items-start gap-3">
                <Avatar initials={a.i} color={a.c as any} size={36} />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between"><div className="text-[13px] font-bold">{a.n}</div><div className="text-[10.5px] text-puq-faint">{a.t}</div></div>
                  <div className="mt-1 text-[12.5px] text-puq-text/80">{a.a}</div>
                  <div className="mt-1 text-right text-[11px] font-semibold text-puq-pink">Hallo sagen ›</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="begegnung" />
    </Screen>
  );
}

/* Screen 40 — Magic Match */
export function S40_MagicMatch() {
  const list = [
    { i: "EM", c: "pink", n: "Emma, 28", tags: ["Yoga", "Naturwein", "Berlin"], hint: "Ihr seid beide morgens aktiv", score: "9.4" },
    { i: "LK", c: "lemon", n: "Lukas, 31", tags: ["Indie", "Bouldern", "Foto"], hint: "Ähnlicher Musik-Geschmack", score: "8.9" },
    { i: "MH", c: "mint", n: "Mia H., 26", tags: ["Kunst", "Brunch", "Tanz"], hint: "Beide neu in Friedrichshain", score: "8.6" },
  ];
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
        <BellIcon />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <SectionLabel color="indigo">★ MAGIC-MATCH · DAILY 3</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.1]">
          Curated today for you
          <em className="block font-serif italic text-puq-pink">handpicked.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">KI vergleicht 47 Datenpunkte · echte Resonanz.</p>
        <div className="mt-4 space-y-3">
          {list.map((p) => (
            <Card key={p.i} className="bg-puq-card/80">
              <div className="flex items-start gap-3">
                <Avatar initials={p.i} color={p.c as any} size={64} />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between"><div className="text-[16px] font-bold">{p.n}</div><span className="rounded-full bg-[#5BC8FF]/15 px-2 py-0.5 text-[11px] font-bold text-[#5BC8FF]">{p.score}</span></div>
                  <div className="mt-1 flex flex-wrap gap-1">{p.tags.map((t) => <Pill key={t} variant="outline">{t}</Pill>)}</div>
                  <div className="mt-2 flex items-baseline justify-between"><div className="text-[11px] text-[#5BC8FF]"><span className="font-bold">★ KI</span> {p.hint}</div><div className="text-[11.5px] font-semibold text-puq-pink">Hallo sagen ›</div></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="begegnung" />
    </Screen>
  );
}

/* Screen 43 — AI Coach First Message */
export function S43_AICoach() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="AI Coach" />
      <div className="relative z-10 flex-1 px-6 pb-32">
        <SectionLabel color="indigo">★ AI COACH · FIRST MESSAGE</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Was schreibst du
          <em className="block font-serif italic text-puq-pink">Emma?</em>
        </h1>
        <Card className="mt-5">
          <div className="flex items-center gap-3">
            <Avatar initials="EM" color="pink" size={48} />
            <div>
              <div className="text-[14px] font-bold">Emma, 28 · 3 Begegnungen</div>
              <div className="text-[11.5px] text-puq-muted">Yoga · Naturwein · Indie · Reisen</div>
            </div>
          </div>
        </Card>
        <SectionLabel color="indigo" className="mt-5">★ 3 ICEBREAKERS · FROM HER PROFILE</SectionLabel>
        <div className="mt-2 space-y-2.5">
          <Ice tone="mint" tag="AUTHENTISCH" rate="92% Antwort-Rate" t={"\"Hallo Emma — habe gesehen, du warst auch im 'Mein Naturwein'. W"} />
          <Ice tone="lemon" tag="SPIELERISCH" rate="78% Antwort-Rate" t={"\"Yoga oder Bouldern — was war der größte 'Auf-die-Nase-fall' bisher?\""} />
          <Ice tone="pink" tag="DIRÉKT" rate="65% Antwort-Rate" t={"\"Hallo! 3 Begegnungen ist quasi Schicksal — Café diese Woche?\""} />
        </div>
      </div>
      <FootBar><PrimaryBtn>Write your own</PrimaryBtn></FootBar>
    </Screen>
  );
}
function Ice({ tone, tag, rate, t }: { tone: "mint" | "lemon" | "pink"; tag: string; rate: string; t: string }) {
  const map = { mint: ["border-puq-mint/40", "text-puq-mint"], lemon: ["border-puq-lemon/40", "text-puq-lemon"], pink: ["border-puq-pink/40", "text-puq-pink"] } as const;
  return (
    <div className={`rounded-2xl border ${map[tone][0]} bg-puq-card/60 p-3.5`}>
      <div className="flex items-center justify-between">
        <SectionLabel color={tone}>★ {tag}</SectionLabel>
        <div className="text-[10.5px] text-puq-muted">{rate}</div>
      </div>
      <p className="mt-1.5 text-[13px]">{t}</p>
      <div className={`mt-1 text-right text-[11.5px] font-semibold ${map[tone][1]}`}>Übernehmen ›</div>
    </div>
  );
}

/* Screen 45 — Match Modal */
export function S45_MatchModal() {
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 flex flex-1 items-center justify-center px-3">
        <ModalSheet>
          <div className="text-center">
            <SectionLabel color="pink">ES IST EIN MATCH</SectionLabel>
            <div className="mt-3 grid place-items-center"><svg viewBox="0 0 24 24" fill="#FF3D7F" className="h-12 w-12"><path d="M12 21s-7-4.35-9.5-9.5C0.5 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.5 3.5 4.5 7.5C19 16.65 12 21 12 21z" /></svg></div>
            <div className="mt-3 flex justify-center gap-2">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-puq-indigo-2 text-[24px] font-bold">DU</div>
              <div className="grid h-20 w-20 place-items-center rounded-full bg-puq-pink text-[24px] font-bold">EM</div>
            </div>
            <h2 className="mt-4 text-[22px] font-bold leading-tight">Ihr seid euch<br />begegnet!</h2>
            <p className="mt-2 text-[12.5px] text-puq-muted">Café Einstein · heute 18:30</p>
            <SectionLabel color="muted" className="mt-4">MATCH LÄUFT AB IN</SectionLabel>
            <div className="mt-2 flex justify-center gap-2">
              {[
                { v: "00", l: "DAY" },
                { v: "23", l: "STD" },
                { v: "45", l: "MIN" },
              ].map((c) => (
                <div key={c.l} className="rounded-2xl border border-puq-pink/40 bg-puq-card/60 px-4 py-2">
                  <div className="text-3xl font-bold">{c.v}</div>
                  <div className="text-[9px] tracking-wider text-puq-muted">{c.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-5"><PrimaryBtn>Nachricht schreiben</PrimaryBtn></div>
            <div className="mt-2 text-center text-xs text-puq-muted">Später</div>
          </div>
        </ModalSheet>
      </div>
    </Screen>
  );
}

/* Screen 46 — Super Hello */
export function S46_SuperHello() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Super Hello" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <SectionLabel color="indigo">★ DEINE STIMME ZÄHLT</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Super-Hallo
          <em className="block font-serif italic text-puq-pink">an Emma.</em>
        </h1>
        <Card className="mt-5">
          <div className="flex items-center gap-3">
            <Avatar initials="EM" color="tangerine" size={56} />
            <div>
              <div className="text-[16px] font-bold">Emma, 28</div>
              <div className="text-[11.5px] text-puq-muted">Café Einstein · vor 12 Min</div>
              <div className="mt-1.5 inline-flex items-center rounded-full border border-puq-mint/50 bg-puq-mint/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-puq-mint">✓ Verifiziert</div>
            </div>
          </div>
        </Card>
        <SectionLabel color="muted" className="mt-5">DEIN ANGEBOT</SectionLabel>
        <div className="mt-2 space-y-2.5">
          <Offer color="pink" t="Café einladen" s="in der Nähe · 12 Min" on />
          <Offer color="indigo" t="Wein-Bar heute Abend" s="20:30 · 4 Vorschläge" />
          <Offer color="mint" t="Spaziergang Spree" s="1h · spontan" />
        </div>
        <SectionLabel color="muted" className="mt-5">PERSÖNLICHE NOTE (OPTIONAL)</SectionLabel>
        <Card className="mt-2"><p className="text-[13px]">Hi! Habe dich heute morgens im Café Einstein gesehen — magst du …</p></Card>
      </div>
      <FootBar><PrimaryBtn>Send Super Hello · 1 of 5</PrimaryBtn></FootBar>
    </Screen>
  );
}
function Offer({ color, t, s, on }: { color: "pink" | "indigo" | "mint"; t: string; s: string; on?: boolean }) {
  const ring = on ? "border-puq-pink" : "border-puq-line-2/40";
  const c = { pink: "bg-puq-pink", indigo: "bg-puq-indigo-2", mint: "bg-puq-mint" }[color];
  return (
    <div className={`flex items-center gap-3 rounded-2xl border ${ring} bg-puq-card/70 p-3`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${c}`} />
      <div className="flex-1">
        <div className="text-[14px] font-bold">{t}</div>
        <div className="text-[11.5px] text-puq-muted">{s}</div>
      </div>
      {on ? <span className="grid h-6 w-6 place-items-center rounded-full bg-puq-pink text-white">✓</span> : null}
    </div>
  );
}

/* Screen 47 — Treffpunkt */
export function S47_Treffpunkt() {
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 flex flex-1 items-center justify-center px-3">
        <ModalSheet>
          <div className="text-center">
            <SectionLabel color="lemon">★ TREFFPUNKT-VORSCHLAG</SectionLabel>
            <h2 className="mt-2 text-[22px] font-bold leading-tight">
              Ihr wollt euch beide
              <em className="block font-serif italic text-puq-pink">begegnen.</em>
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-puq-indigo-2 font-bold">DU</div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-puq-pink font-bold">SO</div>
            </div>
            <Card className="mt-4 text-left">
              <SectionLabel color="muted">PUQ.ME SCHLÄGT VOR</SectionLabel>
              <div className="mt-1 text-[18px] font-bold">Café Einstein</div>
              <div className="text-[12px] text-puq-muted">Unter den Linden 42 · Berlin Mitte</div>
              <Card variant="success" className="mt-3 border-puq-mint/50">
                <SectionLabel color="mint">⊙ WARUM HIER?</SectionLabel>
                <div className="mt-1 text-[12px]">Ihr seid beide häufig dort gewesen.</div>
              </Card>
              <SectionLabel color="muted" className="mt-3">SUGGESTED TIME</SectionLabel>
              <div className="mt-1 flex items-center justify-between"><div className="text-[15px] font-bold">Donnerstag · 18:30</div><div className="text-[12px] font-bold text-puq-lemon">★ ändern</div></div>
            </Card>
            <div className="mt-4"><PrimaryBtn>Passt mir — bestätigen</PrimaryBtn></div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="rounded-full border border-puq-line-2 py-2.5 text-[13px] font-semibold">Anderer Ort</button>
              <button className="rounded-full border border-puq-line-2 py-2.5 text-[13px] font-semibold">Andere Zeit</button>
            </div>
          </div>
        </ModalSheet>
      </div>
    </Screen>
  );
}

/* Screen 48 — AI Suggestion 3 places */
export function S48_AISuggestion() {
  const places = [
    { n: 1, t: "Wein·Stein", l: "Mitte · 13 Min · 8 Min", note: "Beide mögen Naturwein", match: "96%", color: "mint" as const },
    { n: 2, t: "Café Komet", l: "Friedrichshain · 8 Min · 14 Min", note: "Du warst 3×, Sie 2×", match: "91%", color: "lemon" as const },
    { n: 3, t: "Spreebrücke", l: "Kreuzberg · 12 Min · 11 Min", note: "Spaziergang · ruhig", match: "84%", color: "pink" as const },
  ];
  const tone = { mint: "border-puq-mint", lemon: "border-puq-lemon", pink: "border-puq-pink" };
  const matchTone = { mint: "bg-puq-mint/15 text-puq-mint border-puq-mint/50", lemon: "bg-puq-lemon/15 text-puq-lemon border-puq-lemon/50", pink: "bg-puq-pink/15 text-puq-pink border-puq-pink/50" };
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="AI Suggestion" />
      <div className="relative z-10 flex-1 px-6 pb-32">
        <SectionLabel color="indigo">★ AI · YOUR COMMON TASTE</SectionLabel>
        <h1 className="mt-2 text-[28px] font-bold leading-[1.1]">
          3 places for you both
          <em className="block font-serif italic text-puq-pink">to enjoy.</em>
        </h1>
        <Card className="mt-5 border-[#5BC8FF]/40">
          <SectionLabel color="indigo">★ AI ANALYSIS · 0.8 SEC</SectionLabel>
          <div className="mt-1 text-[12.5px]">Both encounters + favorite genres + Distanz</div>
        </Card>
        <div className="mt-3 space-y-3">
          {places.map((p) => (
            <div key={p.n} className={`rounded-2xl border-l-4 ${tone[p.color]} border-y border-r border-puq-line-2/40 bg-puq-card/70 p-3.5`}>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${p.color === "mint" ? "bg-puq-mint text-puq-deep" : p.color === "lemon" ? "bg-puq-lemon text-puq-deep" : "bg-puq-pink text-white"}`}>{p.n}</span>
                  <div className="text-[16px] font-bold">{p.t}</div>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${matchTone[p.color]}`}>Match: {p.match}</span>
              </div>
              <div className="mt-1 text-[11.5px] text-puq-muted">{p.l}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[12px]">★ KI <span className="text-puq-text/80">{p.note}</span></span>
                <span className={`text-[11.5px] font-semibold ${p.color === "mint" ? "text-puq-mint" : p.color === "lemon" ? "text-puq-lemon" : "text-puq-pink"}`}>Treffpunkt teilen ›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FootBar><PrimaryBtn>Suggest Wein·Stein</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 49 — Treffen-Wahl */
export function S49_MeetType() {
  const opts = [
    { ic: "☕", t: "Coffee", s: "Spontan einen Kaffee", c: "pink" as const, on: true },
    { ic: "🍷", t: "Wine/Drinks", s: "Donnerstag etwas trinken?", c: "pink" as const, on: true },
    { ic: "🍽", t: "Restaurant", s: "Ein Lokal, das passt", c: "lemon" as const, plus: true },
    { ic: "🌳", t: "Walk", s: "Tempelhofer Feld?", c: "mint" as const },
    { ic: "🎬", t: "Cinema", s: "Ein Film läuft", c: "pink" as const },
    { ic: "📅", t: "Event", s: "Sa-Abend dabei?", c: "lemon" as const, plus: true },
  ];
  const tone = { pink: "border-puq-pink", mint: "border-puq-mint", lemon: "border-puq-lemon" };
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 mt-auto rounded-t-3xl bg-puq-deep p-5 pt-6 shadow-puq-glow">
        <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
        <SectionLabel color="lemon" className="mt-5 text-center">EINLADUNG AN SOPHIE</SectionLabel>
        <h2 className="mt-2 text-center text-[26px] font-bold leading-tight">Wie wollt ihr euch<em className="block font-serif italic text-puq-pink">treffen?</em></h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {opts.map((o) => (
            <div key={o.t} className={`relative rounded-2xl border-2 ${tone[o.c]}/${o.on ? "70" : "40"} bg-puq-card/70 p-3`}>
              {o.plus ? <span className="absolute right-2 top-2 rounded-md bg-puq-lemon px-1.5 py-0.5 text-[9px] font-bold text-puq-deep">PLUS</span> : null}
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${o.c === "pink" ? "bg-puq-pink/20" : o.c === "lemon" ? "bg-puq-lemon/20" : "bg-puq-mint/20"} text-xl`}>{o.ic}</div>
              <div className="mt-2 text-[14px] font-bold">{o.t}</div>
              <div className="text-[11px] text-puq-muted">{o.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center text-[13px] text-puq-muted">Abbrechen</div>
      </div>
    </Screen>
  );
}

/* Screen 50 — Echtes Treffen */
export function S50_RealMeet() {
  return (
    <Screen>
      <StatusBar dim />
      <div className="relative z-10 flex flex-1 items-center justify-center px-3">
        <ModalSheet ringColor="pink">
          <div className="text-center">
            <SectionLabel color="lemon">★ ECHTES TREFFEN ★</SectionLabel>
            <div className="mt-3 grid place-items-center"><svg viewBox="0 0 24 24" fill="#FF3D7F" className="h-12 w-12"><path d="M12 21s-7-4.35-9.5-9.5C0.5 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.5 3.5 4.5 7.5C19 16.65 12 21 12 21z" /></svg></div>
            <h2 className="mt-3 text-[22px] font-bold leading-tight">Ihr wollt euch beide<em className="block font-serif italic text-puq-pink">treffen!</em></h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-puq-indigo-2 font-bold">DU</div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-puq-pink font-bold">SO</div>
            </div>
            <Card className="mt-3 text-left border-puq-pink/50">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-puq-pink/20">☕</div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-puq-muted">YOUR MEETUP</div>
                  <div className="text-[16px] font-bold">Kaffee · Café Einstein</div>
                </div>
              </div>
              <Card variant="success" className="mt-3 border-puq-mint/50">
                <SectionLabel color="mint">⊙ PUQ.ME KNOWS</SectionLabel>
                <div className="mt-1 text-[12px]">Ihr seid beide häufig dort gewesen.</div>
              </Card>
              <SectionLabel color="muted" className="mt-3">SUGGESTED TIME</SectionLabel>
              <div className="mt-1 flex items-center justify-between"><div className="text-[15px] font-bold">Donnerstag · 18:30</div><div className="text-[12px] font-bold text-puq-lemon">★ ändern</div></div>
            </Card>
            <div className="mt-4"><PrimaryBtn>Bestätigen — wir treffen uns!</PrimaryBtn></div>
            <div className="mt-2 text-center text-xs text-puq-muted">Anpassen</div>
          </div>
        </ModalSheet>
      </div>
    </Screen>
  );
}
