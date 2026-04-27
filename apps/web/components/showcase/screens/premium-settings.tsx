"use client";
import { Screen, StatusBar, BellIcon, PuqWordmark } from "../chrome";
import { ScreenHeader, SectionLabel, Card, Pill, Avatar, FootBar, PrimaryBtn, Toggle, Input, Field } from "../ui";

/* Screen 66 — PuQ.me Plus */
export function S66_Plus() {
  const benefits = [
    { ic: "✓", t: "Who Likes You", s: "See who has shown interest in your profile.", c: "mint" as const },
    { ic: "📊", t: "Extended History", s: "5 years of encounters instead of 12 months.", c: "indigo" as const },
    { ic: "🌐", t: "Global Mode", s: "Travel, weekend trips, long-distance dating.", c: "lemon" as const },
    { ic: "↑", t: "Priority Ranking", s: "Your card appears more prominently to others.", c: "pink" as const },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="PuQ.me Plus" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10 text-center">
        <div className="mt-4 grid place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-puq-lemon/15 text-puq-lemon">★</div>
        </div>
        <h1 className="mt-3 text-[34px] font-bold leading-[1.05]">PuQ.me<em className="block font-serif italic text-puq-lemon">Plus.</em></h1>
        <p className="mt-2 text-[13px] text-puq-muted">See more. Meet more. Stay in control.</p>
        <div className="mt-5 space-y-2.5 text-left">
          {benefits.map((b) => {
            const map = { mint: "bg-puq-mint/15 text-puq-mint", indigo: "bg-puq-indigo-2/20 text-[#5BC8FF]", lemon: "bg-puq-lemon/15 text-puq-lemon", pink: "bg-puq-pink/15 text-puq-pink" };
            return (
              <div key={b.t} className="flex items-center gap-3 rounded-2xl border border-puq-line-2/40 bg-puq-card/70 p-3.5">
                <div className={`grid h-10 w-10 place-items-center rounded-2xl ${map[b.c]} text-lg`}>{b.ic}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold">{b.t}</div>
                  <div className="text-[11.5px] text-puq-muted">{b.s}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Plan label="MONTHLY" price="9,99 €" sub="/Month" />
          <Plan label="3 MONTHS" price="7,99 €" sub="/Month · save 20%" highlight />
          <Plan label="YEARLY" price="5,99 €" sub="/Month · save 40%" />
        </div>
      </div>
    </Screen>
  );
}
function Plan({ label, price, sub, highlight }: { label: string; price: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`relative rounded-2xl border-2 ${highlight ? "border-puq-lemon" : "border-puq-line-2/50"} bg-puq-card/70 p-3 text-center`}>
      {highlight ? <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-puq-lemon px-3 py-0.5 text-[10px] font-bold text-puq-deep">POPULAR</span> : null}
      <div className="text-[10px] font-bold tracking-wider text-puq-muted">{label}</div>
      <div className="mt-1 text-[18px] font-bold">{price}</div>
      <div className="text-[10px] text-puq-faint">{sub}</div>
    </div>
  );
}

/* Screen 67 — Likes You */
export function S67_LikesYou() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Likes You" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <SectionLabel color="lemon">★ PUQ.ME PLUS · EXCLUSIVE</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">8 Personen<em className="block font-serif italic text-puq-pink">mögen dich.</em></h1>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <BlurCard i="EM" c="from-puq-pink to-puq-pink-2" t="Emma, 28" l="Kreuzberg" tm="Heute, 14:32" reveal />
          <BlurCard i="LK" c="from-puq-lemon to-orange-400" t="Lukas, 31" l="Mitte" tm="Vor 1h" reveal />
          <BlurCard blur />
          <BlurCard blur />
        </div>
        <Card variant="warning" className="mt-4 border-puq-lemon/40 bg-gradient-to-br from-puq-lemon/15 to-puq-lemon-2/10">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel color="lemon">★ ALLE 8 SEHEN</SectionLabel>
              <div className="mt-1 text-[14px] font-bold">Plus aktivieren — €9,99/Month</div>
            </div>
            <button className="rounded-full bg-puq-lemon px-4 py-2 text-[12px] font-bold text-puq-deep">Upgrade</button>
          </div>
        </Card>
      </div>
    </Screen>
  );
}
function BlurCard({ i, c, t, l, tm, reveal, blur }: { i?: string; c?: string; t?: string; l?: string; tm?: string; reveal?: boolean; blur?: boolean }) {
  if (blur)
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-puq-card/40 backdrop-blur">
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-puq-indigo-2/40 text-2xl text-white">?</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2 text-center">
          <div className="text-[13px] font-bold">Mit Plus</div>
          <div className="text-[10px] text-puq-muted">freischalten</div>
        </div>
      </div>
    );
  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${c}`}>
      <div className="absolute inset-0 grid place-items-center text-7xl font-bold text-white/15">{i}</div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
        <div className="text-[14px] font-bold">{t}</div>
        <div className="text-[10.5px] text-white/80">{l}</div>
        <div className="text-[10px] text-puq-mint">{tm}</div>
      </div>
    </div>
  );
}

/* Screen 68 — Boost */
export function S68_Boost() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Boost" />
      <div className="relative z-10 flex-1 px-6 pb-6">
        <SectionLabel color="lemon">★ YOUR MOMENT</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">30 Min ganz<em className="block font-serif italic text-puq-lemon">oben.</em></h1>
        <div className="mt-8 grid place-items-center">
          <div className="relative grid h-56 w-56 place-items-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#FCD34D" strokeWidth="2" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#FCD34D" strokeWidth="1.5" opacity="0.6" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <circle key={deg} cx={100 + 80 * Math.cos((deg * Math.PI) / 180)} cy={100 + 80 * Math.sin((deg * Math.PI) / 180)} r="6" fill="#5C6E8C" />
              ))}
            </svg>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-puq-lemon font-bold text-puq-deep">DU</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <BoostStat v="10×" l="mehr Hallos" c="border-puq-pink/50" tx="text-puq-pink" />
          <BoostStat v="3×" l="mehr Profil-Views" c="border-puq-mint/50" tx="text-puq-mint" />
          <BoostStat v="30 Min" l="Aktive Spotlight" c="border-puq-lemon/50" tx="text-puq-lemon" />
        </div>
      </div>
      <FootBar>
        <button className="flex w-full items-center justify-center gap-3 rounded-full bg-puq-lemon py-4 text-[15px] font-bold text-puq-deep">
          🚀 Boost starten <span className="rounded bg-puq-deep/10 px-2 py-0.5 text-[12px]">€2,99</span>
        </button>
        <div className="mt-2 text-center text-[11px] text-puq-muted">1× kostenlos pro Woche mit Plus</div>
      </FootBar>
    </Screen>
  );
}
function BoostStat({ v, l, c, tx }: { v: string; l: string; c: string; tx: string }) {
  return (
    <div className={`rounded-2xl border ${c} bg-puq-card/70 p-3 text-center`}>
      <div className={`text-[20px] font-bold ${tx}`}>{v}</div>
      <div className="text-[10.5px] text-puq-muted">{l}</div>
    </div>
  );
}

/* Screen 69 — Stories */
export function S69_Stories() {
  const stories = [
    { i: "Du", color: "pink", plus: true },
    { i: "EM", color: "pink", n: "Emma", l: "NEU" },
    { i: "LK", color: "lemon", n: "Lukas", l: "2 Std" },
    { i: "AN", color: "mint", n: "Ana", l: "5 Std" },
    { i: "MH", color: "indigo", n: "Mia", l: "Heute" },
  ] as const;
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3">
        <PuqWordmark size="md" />
        <BellIcon />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24">
        <SectionLabel color="muted">DEINE STORIES</SectionLabel>
        <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
          {(stories as readonly any[]).map((s) => (
            <div key={s.i} className="flex flex-col items-center">
              {s.plus ? (
                <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-puq-pink text-puq-pink"><span className="grid h-9 w-9 place-items-center rounded-full bg-puq-pink text-white text-2xl">+</span></div>
              ) : (
                <Avatar initials={s.i} color={s.color as any} size={64} ring={(s.color === "pink" ? "pink" : s.color === "lemon" ? "lemon" : s.color === "mint" ? "mint" : "indigo") as any} />
              )}
              <div className="mt-1 text-[11px]">{s.n ?? "Du"}</div>
              {s.l ? <div className="text-[10px] font-bold text-puq-lemon">{s.l}</div> : null}
            </div>
          ))}
        </div>
        <SectionLabel color="muted" className="mt-5">EMMAS STORY · GERADE EBEN</SectionLabel>
        <div className="mt-2 relative aspect-[3/5] overflow-hidden rounded-3xl bg-gradient-to-br from-puq-pink-2 via-puq-pink to-orange-400">
          <div className="absolute inset-x-2 top-2 flex gap-1">
            <span className="h-0.5 flex-1 rounded-full bg-white" /><span className="h-0.5 flex-1 rounded-full bg-white" />
            <span className="h-0.5 flex-1 rounded-full bg-white/40" /><span className="h-0.5 flex-1 rounded-full bg-white/40" />
          </div>
          <div className="absolute left-3 top-5 flex items-center gap-2">
            <Avatar initials="EM" color="pink" size={28} />
            <div>
              <div className="text-[13px] font-bold">Emma</div>
              <div className="text-[10px] text-white/80">vor 3 Min · Kreuzberg</div>
            </div>
          </div>
          <div className="absolute bottom-12 left-3 right-3">
            <div className="text-[28px] font-bold leading-tight">Sunrise at<br />Spreeufer 🌞</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-full bg-puq-card/70 px-4 py-3">
          <div className="text-[12px] text-puq-muted">Send reaction …</div>
          <div className="flex gap-2">
            <span className="text-lg">👍</span><span className="text-lg">✨</span><span className="text-lg">🔥</span><span className="text-lg">💖</span>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* Screen 70 — Events */
export function S70_Events() {
  const events = [
    { t: "Wein-Tasting Naturwein", d: "Heute · 19:30", l: "Wein·Stein, Mitte", k: "8 / 12", c: "border-puq-pink" },
    { t: "Sonnenaufgangs-Yoga", d: "Sa · 7:00", l: "Tempelhofer Feld", k: "16 / 25", c: "border-puq-mint" },
    { t: "Pasta-Making Workshop", d: "So · 18:00", l: "Markthalle Neun", k: "5 / 10", c: "border-puq-lemon" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Events" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <SectionLabel color="mint">★ REAL ENCOUNTERS · GROUP</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">12 Events<em className="block font-serif italic text-puq-pink">in deiner Stadt.</em></h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill variant="active">Alle</Pill>
          <Pill variant="outline">Heute</Pill>
          <Pill variant="outline">Wochenende</Pill>
          <Pill variant="outline">Kostenlos</Pill>
        </div>
        <div className="mt-4 space-y-3">
          {events.map((e) => (
            <div key={e.t} className={`rounded-2xl border-l-4 ${e.c} border-y border-r border-puq-line-2/40 bg-puq-card/70 p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[15px] font-bold">{e.t}</div>
                  <div className={`mt-0.5 text-[11.5px] font-bold ${e.c.replace("border-", "text-")}`}>{e.d}</div>
                  <div className="text-[11.5px] text-puq-muted">{e.l}</div>
                </div>
                <div className="flex -space-x-2">
                  <Avatar initials="+" color="indigo" size={26} />
                  <Avatar initials="AN" color="mint" size={26} />
                  <Avatar initials="LK" color="lemon" size={26} />
                  <Avatar initials="EM" color="pink" size={26} />
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="rounded-full border border-puq-mint/50 bg-puq-mint/10 px-2.5 py-0.5 text-[11px] font-bold text-puq-mint">{e.k}</span>
                <span className={`text-[12px] font-bold ${e.c.replace("border-", "text-")}`}>Anmelden ›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FootBar><PrimaryBtn>Create Your Event</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 71 — Invite Friends */
export function S71_Invite() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Invite Friends" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <SectionLabel color="mint">★ TOGETHER · MORE REAL</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">Lade Freunde<em className="block font-serif italic text-puq-pink">zu PuQ.me ein.</em></h1>
        <p className="mt-2 text-[12.5px] text-puq-muted">Pro Freund: 1 Monat Plus für euch beide.</p>
        <Card className="mt-4 grid place-items-center bg-white p-6">
          <svg viewBox="0 0 80 80" className="h-44 w-44">
            {Array.from({ length: 60 }).map((_, i) => {
              const x = (i % 8) * 9 + 4;
              const y = Math.floor(i / 8) * 9 + 4;
              return Math.random() > 0.5 ? <rect key={i} x={x} y={y} width="8" height="8" fill="#000" /> : null;
            })}
            <rect x="36" y="36" width="14" height="14" fill="#FF3D7F" />
            <text x="43" y="47" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">P</text>
          </svg>
        </Card>
        <Card className="mt-3 flex items-center justify-between border-puq-line-2/40">
          <span className="text-[13.5px] font-mono">puq.me/alan-best</span>
          <span className="rounded-full bg-puq-pink px-3 py-1.5 text-[12px] font-bold">Kopieren</span>
        </Card>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
          {[
            { ic: "●", n: "WhatsApp", c: "bg-emerald-500" },
            { ic: "●", n: "Signal", c: "bg-blue-500" },
            { ic: "●", n: "SMS", c: "bg-puq-lemon" },
            { ic: "●", n: "Mehr", c: "bg-puq-card-2" },
          ].map((s) => (
            <div key={s.n}>
              <div className={`grid h-12 w-12 place-items-center rounded-full ${s.c} mx-auto`}>{s.ic}</div>
              <div className="mt-1 font-bold">{s.n}</div>
            </div>
          ))}
        </div>
        <Card variant="success" className="mt-4 border-puq-mint/40">
          <SectionLabel color="mint">★ YOUR REFERRAL STATS</SectionLabel>
          <div className="mt-1 text-[13px] font-bold">3 Freunde haben sich registriert</div>
          <div className="text-[11px] text-puq-muted">3 Months Plus auf deinem Konto · gratis</div>
        </Card>
      </div>
    </Screen>
  );
}

/* Screen 72 — Settings */
export function S72_Settings() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Settings" />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-10">
        <Card>
          <div className="flex items-center gap-3">
            <Avatar initials="AB" color="pink" size={48} />
            <div className="flex-1">
              <div className="text-[15px] font-bold">Alan Best</div>
              <div className="text-[11.5px] text-puq-muted">alan@puq.me · ID 7842</div>
              <span className="mt-1 inline-block rounded-full border border-puq-lemon bg-puq-lemon/15 px-2 py-0.5 text-[10px] font-bold text-puq-lemon">★ PLUS</span>
            </div>
            <span className="text-[12px] font-bold text-puq-pink">Edit ›</span>
          </div>
        </Card>
        <Group title="PROFILE">
          <SettingRow ic="✏" t="Edit Profile" c="lemon" />
          <SettingRow ic="🔒" t="App Lock" c="indigo" />
          <SettingRow ic="✓" t="Identity Verification" c="mint" />
        </Group>
        <Group title="VISIBILITY">
          <SettingRow ic="🌍" t="Visibility Mode" c="pink" />
          <SettingRow ic="●" t="Search Radius" c="mint" />
          <SettingRow ic="∥" t="Pause Mode" c="lemon" />
        </Group>
        <Group title="NOTIFICATIONS">
          <SettingRow ic="🔔" t="Push Notifications" c="indigo" />
          <SettingRow ic="✉" t="Email Notifications" c="pink" />
        </Group>
        <Group title="PRIVACY · SAFETY">
          <SettingRow ic="🛡" t="Data Privacy (DSGVO)" c="indigo" />
          <SettingRow ic="🚫" t="Blocked Users" c="pink" />
          <SettingRow ic="📞" t="Emergency Contacts" c="pink" />
        </Group>
        <Group title="PREMIUM">
          <SettingRow ic="★" t="Manage Plus" c="lemon" />
        </Group>
      </div>
    </Screen>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <SectionLabel color="muted">{title}</SectionLabel>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}
function SettingRow({ ic, t, c }: { ic: string; t: string; c: "pink" | "mint" | "lemon" | "indigo" }) {
  const map = { pink: "bg-puq-pink/15 text-puq-pink", mint: "bg-puq-mint/15 text-puq-mint", lemon: "bg-puq-lemon/15 text-puq-lemon", indigo: "bg-puq-indigo-2/20 text-[#5BC8FF]" };
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-puq-card/70 px-3 py-3">
      <div className={`grid h-9 w-9 place-items-center rounded-2xl ${map[c]} text-base`}>{ic}</div>
      <div className="flex-1 text-[13.5px] font-semibold">{t}</div>
      <span className={`${map[c].split(" ")[1]}`}>›</span>
    </div>
  );
}

/* Screen 73 — App Lock */
export function S73_AppLock() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="App Lock" />
      <div className="relative z-10 flex-1 px-6">
        <SectionLabel color="indigo">★ DEINE PRIVATSPHÄRE · IM HANDUMDREHE</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">App Lock<em className="block font-serif italic text-puq-pink">aktivieren.</em></h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Niemand kann PuQ.me öffnen — auch wenn dein Handy</p>
        <div className="mt-7 grid place-items-center">
          <div className="relative grid h-44 w-44 place-items-center">
            <div className="absolute inset-0 rounded-full border border-[#5BC8FF]/40" />
            <div className="absolute inset-6 rounded-full border border-[#5BC8FF]/40" />
            <div className="absolute inset-12 rounded-full border border-[#5BC8FF]/40" />
            <div className="absolute inset-16 rounded-full border border-[#5BC8FF]/60" />
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[#5BC8FF]" />
          </div>
        </div>
        <SectionLabel color="muted" className="mt-7">METHODE WÄHLEN</SectionLabel>
        <div className="mt-2 space-y-2">
          {[
            { t: "Face-ID", s: "Apple · 0,3 Sek", on: true, c: "border-[#5BC8FF]" },
            { t: "Touch-ID / Fingerprint", s: "iOS · Android", c: "border-puq-line-2/40" },
            { t: "PIN-Code", s: "6-stellig · Backup", c: "border-puq-line-2/40" },
            { t: "Auto-Lock nach 1 Min", s: "Wenn App im Hintergrund", on: true, c: "border-puq-pink" },
          ].map((m) => (
            <div key={m.t} className={`flex items-center justify-between rounded-2xl border-2 ${m.c} bg-puq-card/70 px-3.5 py-3`}>
              <div>
                <div className="text-[14px] font-bold">{m.t}</div>
                <div className="text-[11.5px] text-puq-muted">{m.s}</div>
              </div>
              <Toggle on={!!m.on} color="pink" />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* Screen 74 — Pause Mode */
export function S74_Pause() {
  const opts = [
    { t: "1 Tag", s: "Kurzer Reset · 24 Stunden" },
    { t: "1 Woche", s: "Urlaub · automatisch zurück", on: true, c: "lemon" },
    { t: "1 Monat", s: "Längere Pause · 30 Tage" },
    { t: "Unbegrenzt", s: "Bis selbst aktiviert" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Pause" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <SectionLabel color="lemon">★ ZEIT FÜR DICH · PUQ.ME SCHLÄFT</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">Pause-Modus<em className="block font-serif italic text-puq-pink">aktivieren.</em></h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Du verschwindest komplett — Profil unsichtbar, Begegnungen pausiert.</p>
        <div className="mt-6 grid place-items-center">
          <div className="grid h-32 w-32 place-items-center rounded-full border border-puq-lemon/40">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-puq-lemon/15">
              <span className="text-3xl text-puq-lemon">∥∥</span>
            </div>
          </div>
        </div>
        <SectionLabel color="muted" className="mt-6">DURATION</SectionLabel>
        <div className="mt-2 space-y-2">
          {opts.map((o) => (
            <div key={o.t} className={`flex items-center gap-3 rounded-2xl border-2 ${o.on ? "border-puq-lemon" : "border-puq-line-2/40"} bg-puq-card/70 px-3.5 py-3`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full ${o.on ? "bg-puq-lemon text-puq-deep" : "border-2 border-puq-line-2/70"}`}>{o.on ? "●" : ""}</span>
              <div className="flex-1">
                <div className="text-[14px] font-bold">{o.t}</div>
                <div className="text-[11.5px] text-puq-muted">{o.s}</div>
              </div>
            </div>
          ))}
        </div>
        <Card variant="success" className="mt-4 border-puq-mint/40">
          <div className="text-[12px]"><span className="font-bold text-puq-mint">★ WIE PAUSE FUNKTIONIERT:</span><br />✓ Profil unsichtbar aktiviert<br />✓ Begegnungen werden NICHT registriert<br />✓ Chats pausiert</div>
        </Card>
      </div>
      <FootBar><PrimaryBtn color="lemon">Activate Pause · 1 Week</PrimaryBtn></FootBar>
    </Screen>
  );
}
