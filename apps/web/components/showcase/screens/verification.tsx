"use client";
import { Screen, StatusBar, ShieldIcon, CheckIcon } from "../chrome";
import { PrimaryBtn, ScreenHeader, SectionLabel, FootBar, Card } from "../ui";

/* Screen 29 — Verification Start */
export function S29_VerifyStart() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Verification" />
      <div className="relative z-10 flex-1 px-6">
        <div className="mt-4 grid place-items-center">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-puq-mint/15 border border-puq-mint/30 text-puq-mint">
            <ShieldIcon />
          </div>
        </div>
        <SectionLabel color="lemon" className="mt-5 text-center">★ PUQ.ME VERIFIED</SectionLabel>
        <h1 className="mt-2 text-center text-[30px] font-bold leading-tight">
          Werde verifiziert.
          <em className="block font-serif italic text-puq-pink">2 einfache Optionen.</em>
        </h1>
        <Card variant="success" className="mt-5 border-puq-mint/50">
          <SectionLabel color="mint">A · SELFIE-SCAN · 30 SEK</SectionLabel>
          <div className="mt-1 text-[14px] font-bold">Quick-Check — nur Selfie</div>
          <div className="mt-1 text-[12px] text-puq-muted">Vergleich mit deinen Profilfotos · Standard-Verified-Badge</div>
          <div className="mt-2 text-[10.5px] font-bold text-puq-mint">RECOMMENDED</div>
        </Card>
        <Card variant="warning" className="mt-3 border-puq-lemon/40">
          <SectionLabel color="lemon">B · DOKUMENT · 1 MIN</SectionLabel>
          <div className="mt-1 text-[14px] font-bold">Trust-Boost — viele Optionen</div>
          <div className="mt-1 text-[12px] text-puq-muted">Pass · Personalausweis · Führerschein · Aufenthaltstitel · Telefon-/Wasser-/Strom-Rechnung &amp; mehr</div>
          <div className="mt-2 text-[10.5px] font-bold text-puq-lemon">GOLD-BADGE</div>
        </Card>
      </div>
      <FootBar>
        <PrimaryBtn>Start Verification</PrimaryBtn>
        <div className="mt-2 text-center text-xs text-puq-muted">Skip · später machen</div>
      </FootBar>
    </Screen>
  );
}

/* Screen 30 — Selfie-Scan */
export function S30_VerifySelfie() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Verification" />
      <div className="relative z-10 flex-1 px-6">
        <div className="mt-4 grid place-items-center">
          <div className="relative grid h-72 w-72 place-items-center">
            <div className="absolute inset-0 rounded-full border border-puq-mint/30" />
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-puq-mint" />
            <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-puq-mint" />
            <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-puq-mint" />
            <span className="absolute left-2 bottom-2 h-5 w-5 border-l-2 border-b-2 border-puq-mint" />
            <span className="absolute right-2 bottom-2 h-5 w-5 border-r-2 border-b-2 border-puq-mint" />
            <div className="grid h-32 w-32 place-items-center rounded-full bg-puq-indigo/40">
              <div className="text-3xl">😊</div>
            </div>
          </div>
        </div>
        <SectionLabel color="mint" className="mt-6 text-center">SCAN LAEUFT</SectionLabel>
        <h2 className="mt-2 text-center text-[24px] font-bold">Halte dein Gesicht in den Rahmen</h2>
        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-puq-card-2"><div className="h-full w-2/3 bg-puq-mint" /></div>
          <div className="mt-2 text-center text-[11px] text-puq-mint">65 % · noch 12 Sekunden</div>
        </div>
        <div className="mt-6 grid place-items-center">
          <button className="grid h-16 w-16 place-items-center rounded-full bg-puq-pink shadow-puq-glow ring-4 ring-puq-pink/20" />
        </div>
      </div>
    </Screen>
  );
}

/* Screen 31 — Verified Success */
export function S31_VerifiedSuccess() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="grid h-40 w-40 place-items-center rounded-full bg-puq-mint">
          <CheckIcon className="h-16 w-16 text-puq-deep" />
        </div>
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: ["#FF3D7F", "#7DF9C4", "#FCD34D", "#5BC8FF"][i % 4],
            }}
          />
        ))}
        <div className="mt-8 text-[10.5px] font-bold tracking-[0.2em] text-puq-mint">★ DU BIST VERIFIZIERT</div>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">
          Echt. Verifiziert.
          <em className="block font-serif italic text-puq-pink">Bereit fuer Begegnungen.</em>
        </h1>
        <p className="mt-4 text-[12.5px] text-puq-muted">
          Dein Profil zeigt jetzt das Mint-Badge.<br />Andere wissen — du bist eine echte Person.
        </p>
      </div>
      <FootBar><PrimaryBtn>Zur App</PrimaryBtn></FootBar>
    </Screen>
  );
}

/* Screen 32 — Document selection */
export function S32_VerifyDoc() {
  const A = [
    { ic: "🛂", t: "Reisepass", s: "Passport", on: true },
    { ic: "🪪", t: "Personalausweis", s: "ID Card" },
    { ic: "🚗", t: "Führerschein", s: "Driver License" },
    { ic: "🏷️", t: "Aufenthaltstitel", s: "Residence" },
  ];
  const B = [
    { ic: "📞", t: "Phone Bill" },
    { ic: "💧", t: "Water Bill" },
    { ic: "🔥", t: "Gas Bill" },
    { ic: "⚡", t: "Electric Bill" },
    { ic: "🏠", t: "Rental / Lease" },
    { ic: "🏦", t: "Bank Statement" },
  ];
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Verification" />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-32">
        <SectionLabel color="lemon">★ OPTIONAL · TRUST-BOOST</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          Wähle dein
          <em className="block font-serif italic text-puq-pink">Dokument.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">Wir machen es dir leicht — viele Optionen, alle DSGVO-konform.</p>
        <SectionLabel color="lemon" className="mt-5">A · IDENTITÄTS-DOKUMENT</SectionLabel>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {A.map((o) => (
            <div key={o.t} className={`rounded-2xl border bg-puq-card/70 p-3 ${o.on ? "border-puq-lemon" : "border-puq-line-2/40"}`}>
              <div className="text-2xl">{o.ic}</div>
              <div className="mt-2 text-[13px] font-bold">{o.t}</div>
              <div className="text-[11px] text-puq-muted">{o.s}</div>
            </div>
          ))}
        </div>
        <SectionLabel color="lemon" className="mt-5">B · ADRESS-NACHWEIS (ALTERNATIV)</SectionLabel>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {B.map((o) => (
            <div key={o.t} className="rounded-2xl border border-puq-line-2/40 bg-puq-card/70 p-2.5 text-center">
              <div className="text-xl">{o.ic}</div>
              <div className="mt-1.5 text-[10.5px] font-bold leading-tight">{o.t}</div>
            </div>
          ))}
        </div>
        <Card variant="success" className="mt-5 border-puq-mint/40">
          <SectionLabel color="mint">★ YOUR BENEFITS</SectionLabel>
          <div className="mt-1 text-[12px]">✓ Verified-Badge · ✓ 3× mehr Hallos · ✓ Daten 24h dann weg</div>
        </Card>
      </div>
      <FootBar>
        <PrimaryBtn>Photograph Document</PrimaryBtn>
        <div className="mt-2 text-center text-xs text-puq-muted">Skip · später machen</div>
      </FootBar>
    </Screen>
  );
}
