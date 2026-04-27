"use client";
import { Screen, StatusBar, BottomNav, PuqWordmark, MenuIcon, MicIcon, PlayIcon, CloseIcon } from "../chrome";
import { ScreenHeader, SectionLabel, Card, Pill, Avatar, FootBar } from "../ui";

/* Screen 55 — Discover (outside radius) */
export function S55_DiscoverOutside() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Entdecken" subtitle="SEKUNDÄRER MODE · OUTSIDE-RADIUS" trailing={<MenuIcon />} />
      <div className="relative z-10 flex-1 px-4 pb-24">
        <Card variant="warning" className="border-puq-lemon/50 bg-puq-lemon/5">
          <SectionLabel color="lemon">⊙ DISCOVERY-MODE</SectionLabel>
          <div className="mt-1 text-[12px]">Menschen außerhalb deines Begegnungs-Radius — noch nie getroffen, aber könntest ihr passen.</div>
        </Card>
        <div className="mt-3 relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-puq-pink/70 via-puq-pink to-orange-400">
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-puq-pink/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"><span>📍</span>Berlin · 4 km</div>
          <div className="absolute right-3 top-3"><span className="rounded-full bg-puq-mint px-2.5 py-1 text-[11px] font-bold text-puq-deep">✓ Verified</span></div>
          <div className="absolute inset-0 grid place-items-center text-[120px] font-bold text-white/15">SO</div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="text-[28px] font-bold leading-tight">Sophie, 27</div>
            <p className="mt-1 font-serif italic text-[12.5px] text-white/85">"Lieber spontan als perfekt."</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Pill variant="outline">Kaffee</Pill><Pill variant="outline">Bouldern</Pill><Pill variant="outline">Buchhandlungen</Pill>
            </div>
            <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-puq-lemon/50 bg-puq-lemon/10 p-2 text-left">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-puq-lemon" />
              <div>
                <div className="text-[10.5px] font-bold tracking-wider text-puq-lemon">PROGNOSE</div>
                <div className="text-[11.5px]">Ihr trinkt beide oft Kaffee am Hauptbahnhof.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="entdecken" />
    </Screen>
  );
}

/* Screen 56 — Discover Profile (with actions) */
export function S56_DiscoverProfile() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <div>
          <div className="text-[24px] font-bold">Entdecken</div>
          <div className="text-[10.5px] font-bold tracking-[0.18em] text-puq-lemon">SECONDARY · OUTSIDE-RADIUS</div>
        </div>
        <button className="text-puq-muted">⚙</button>
      </div>
      <div className="relative z-10 flex-1 px-4 pb-32">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-puq-pink-2 via-puq-pink to-orange-300">
          <div className="absolute left-3 top-3"><span className="rounded-full bg-puq-mint/15 border border-puq-mint/50 px-2.5 py-0.5 text-[11px] font-semibold text-puq-mint">● Online jetzt</span></div>
          <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-puq-lemon">🌹</div>
          <div className="absolute inset-0 grid place-items-center text-[120px] font-bold text-white/15">SO</div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="text-[26px] font-bold leading-tight">Sophie, 27</div>
            <p className="mt-1 font-serif italic text-[12.5px] text-white/85">"Lieber spontan als perfekt."</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Pill variant="outline">Kaffee</Pill><Pill variant="outline">Bouldern</Pill><Pill variant="outline">Buchhandlungen</Pill>
            </div>
            <Card variant="warning" className="mt-2 bg-puq-lemon/10 border-puq-lemon/40">
              <div className="text-[10.5px] font-bold tracking-wider text-puq-lemon">PROGNOSE · 87%</div>
              <div className="text-[11.5px]">Ihr trinkt beide oft Kaffee am Hauptbahnhof.</div>
            </Card>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px] text-puq-muted">
          {[
            { ic: "✕", n: "Skip", c: "border-puq-line-2" },
            { ic: "✦", n: "Favorite", c: "border-puq-lemon" },
            { ic: "♡", n: "Hello", c: "bg-puq-pink border-puq-pink" },
            { ic: "☕", n: "Meet", c: "border-puq-mint" },
          ].map((b) => (
            <div key={b.n}>
              <div className={`grid h-12 w-12 place-items-center rounded-full border-2 mx-auto text-lg ${b.c}`}>{b.ic}</div>
              <div className="mt-1 font-semibold text-puq-text/80">{b.n}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="entdecken" />
    </Screen>
  );
}

/* Screen 57 — Chat Detail */
export function S57_ChatDetail() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center gap-3 px-4 pt-2 pb-3">
        <button className="text-puq-pink">‹</button>
        <Avatar initials="EM" color="pink" size={36} />
        <div className="flex-1">
          <div className="text-[14px] font-bold">Emma, 26</div>
          <div className="text-[10.5px] text-puq-mint">Online · vor 2 Min</div>
        </div>
        <button className="text-puq-muted">⋯</button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-20">
        <Card className="border-puq-pink/40 bg-puq-card/70">
          <div className="text-[12px] text-puq-pink-2">⊙ Ihr wart heute beide bei</div>
          <div className="mt-1 text-[13.5px] font-bold">Café Einstein, 18:30 Uhr</div>
          <div className="mt-1 text-[11.5px] text-puq-muted">Sagt Hallo, solange der Moment frisch ist.</div>
        </Card>
        <div className="mt-3 text-center text-[11px] text-puq-muted">Heute · 19:42</div>
        <Bubble side="me">War das vielleicht der Latte-Macchiato-Tisch am Fenster?</Bubble>
        <Bubble side="them">Haha, genau der!</Bubble>
        <Bubble side="them">Das Buch lag bei mir.</Bubble>
        <Bubble side="them">Was hast du eigentlich gelesen?</Bubble>
        <SectionLabel color="muted" className="mt-4">VORSCHLÄGE</SectionLabel>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl border border-puq-line-2/40 bg-puq-card/50 px-3 py-2 text-[12.5px]">Ich war beim Reisetagebuch</div>
          <div className="rounded-xl border border-puq-line-2/40 bg-puq-card/50 px-3 py-2 text-[12.5px]">Erzähl ruhig — bin neugierig.</div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-puq-line-2/40 bg-puq-deep/95 px-3 pb-7 pt-3">
        <div className="flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded-full bg-puq-card-2 text-puq-muted">+</button>
          <div className="flex-1 rounded-full bg-puq-card-2 px-4 py-2.5 text-[13px] text-puq-faint">Nachricht schreiben…</div>
          <button className="grid h-8 w-8 place-items-center rounded-full bg-puq-pink">→</button>
        </div>
      </div>
    </Screen>
  );
}
function Bubble({ side, children }: { side: "me" | "them"; children: React.ReactNode }) {
  if (side === "me")
    return (
      <div className="mt-3 flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-puq-pink px-3.5 py-2 text-[13.5px] text-white">{children}</div>
      </div>
    );
  return (
    <div className="mt-2 flex justify-start">
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-puq-card-2 px-3.5 py-2 text-[13.5px] text-puq-text">{children}</div>
    </div>
  );
}

/* Screen 58 — Voice Chat (Live Recording) */
export function S58_VoiceChat() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center gap-3 px-4 pt-2 pb-3">
        <button className="text-puq-pink">‹</button>
        <Avatar initials="EM" color="pink" size={36} />
        <div className="flex-1">
          <div className="text-[14px] font-bold">Emma</div>
          <div className="text-[10.5px] text-puq-mint">● Hört Voice-Message</div>
        </div>
        <button className="text-puq-muted">≡</button>
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
        <Bubble side="them">Hi Alan! Wie war dein Tag?</Bubble>
        <div className="mt-1 text-right text-[11px] text-puq-faint">vor 2 Min</div>
        <div className="mt-3 flex justify-end">
          <div className="flex items-center gap-2 rounded-2xl bg-puq-pink px-3 py-2">
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-puq-pink"><PlayIcon className="h-4 w-4" /></button>
            <div className="flex h-8 items-center gap-0.5">
              {Array.from({ length: 22 }).map((_, i) => (
                <span key={i} className="block w-0.5 rounded-full bg-white/90" style={{ height: `${6 + Math.abs(11 - i) * 1.5}px` }} />
              ))}
            </div>
            <div className="text-[11.5px] font-bold text-white">0:23</div>
          </div>
        </div>
        <div className="mt-1 text-right text-[11px] font-semibold text-puq-mint">✓✓ gehört</div>
        <SectionLabel color="muted" className="mt-6">LIVE RECORDING</SectionLabel>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-puq-pink/70 bg-puq-card/70 px-3 py-3">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-puq-pink"><span className="h-2 w-2 rounded-full bg-white" /></div>
          <div className="flex h-8 flex-1 items-center gap-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="block w-0.5 rounded-full bg-puq-pink" style={{ height: `${6 + Math.abs(14 - i) * 1.4}px` }} />
            ))}
          </div>
          <div className="text-[12.5px] font-bold">0:08</div>
        </div>
      </div>
      <FootBar>
        <div className="flex items-center justify-center gap-4">
          <button className="grid h-12 w-12 place-items-center rounded-full bg-puq-card-2 text-puq-muted"><CloseIcon /></button>
          <button className="grid h-16 w-16 place-items-center rounded-full bg-puq-pink shadow-puq-glow"><MicIcon /></button>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-puq-mint text-puq-deep"><PlayIcon className="h-5 w-5" /></button>
        </div>
      </FootBar>
    </Screen>
  );
}

/* Screen 59 — Matches/Chats Tab */
export function S59_MatchesTab() {
  const stories = [
    { i: "EM", c: "pink", n: "Emma" },
    { i: "MR", c: "tangerine", ring: "mint", n: "Marie", online: true },
    { i: "LK", c: "lemon", ring: "lemon", n: "Lukas" },
    { i: "SV", c: "indigo", ring: "pink", n: "Svenja" },
  ] as const;
  const chats = [
    { i: "EM", c: "pink", n: "Emma, 26", t: "vor 5 Min", m: "Ich war beim Reisetagebuch — meinst du w", unread: 2, online: true },
    { i: "MR", c: "tangerine", n: "Marie, 27", t: "vor 2 Std", m: "Klingt nach einem Plan! Wann passt es di", online: true },
    { i: "LK", c: "indigo", n: "Lukas, 28", t: "gestern", m: "Du: Komme morgen wieder ins Café 😊" },
    { i: "SV", c: "blue", n: "Svenja, 24", t: "Mo", m: "Hat mich auch gefreut!" },
  ];
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-2">
        <PuqWordmark size="md" />
        <button className="text-puq-muted">≡</button>
      </div>
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-baseline gap-7 px-5">
          <div><div className="text-[22px] font-bold">Matches</div><div className="mt-1 h-0.5 w-10 rounded-full bg-puq-pink" /></div>
          <div className="text-[18px] font-semibold text-puq-muted/70">Chats</div>
          <div className="text-[18px] font-semibold text-puq-muted/40">Wartet</div>
        </div>
        <SectionLabel color="muted" className="mt-3 px-5">NEUE MATCHES · 4</SectionLabel>
        <div className="mt-2 flex gap-3 overflow-x-auto px-5 pb-1">
          {stories.map((s) => (
            <div key={s.i} className="flex flex-col items-center">
              <Avatar initials={s.i} color={s.c as any} size={64} ring={(s as any).ring} online={(s as any).online} />
              <div className="mt-1 text-[11px]">{s.n}</div>
            </div>
          ))}
        </div>
        <SectionLabel color="muted" className="mt-3 px-5">AKTUELLE KONVERSATIONEN</SectionLabel>
        <div className="mt-2 flex-1 overflow-y-auto px-5 pb-24">
          {chats.map((ch, i) => (
            <div key={ch.n} className={`flex items-center gap-3 rounded-2xl bg-puq-card/70 p-3 ${i === 0 ? "" : "mt-2"}`}>
              <Avatar initials={ch.i} color={ch.c as any} size={48} online={(ch as any).online} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between"><div className="text-[13.5px] font-bold">{ch.n}</div><div className="text-[10px] text-puq-faint">{ch.t}</div></div>
                <div className="text-[12px] text-puq-muted truncate max-w-[200px]">{ch.m}</div>
              </div>
              {(ch as any).unread ? <span className="grid h-5 w-5 place-items-center rounded-full bg-puq-pink text-[10px] font-bold">{(ch as any).unread}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="likes" variant="matches" />
    </Screen>
  );
}
