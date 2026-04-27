"use client";
import { Screen, StatusBar, PuqMark } from "../chrome";
import { PrimaryBtn, GhostBtn, Field, Input, ScreenHeader, OptionRow, Pill, FootBar, SectionLabel, TextBtn, Card } from "../ui";

/* Screen 09 — Login */
export function S09_Login() {
  return (
    <Screen>
      <StatusBar />
      <div className="relative z-10 flex-1 px-6 pt-10">
        <div className="flex flex-col items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-puq-pink/60"><PuqMark size={28} /></div>
          <h1 className="mt-5 text-[26px] font-bold">Willkommen zurück</h1>
          <p className="mt-1 text-[13px] text-puq-muted">Melde dich mit deiner E-Mail an</p>
        </div>
        <div className="mt-8 space-y-4">
          <Field label="E-MAIL"><Input value="alan@puq.me" /></Field>
          <Field
            label="PASSWORT"
            hint={<div className="text-right text-puq-pink">Passwort vergessen?</div>}
          >
            <Input type="password" value="••••••••••" trailing={<span className="text-xs font-semibold text-puq-pink">Zeigen</span>} />
          </Field>
        </div>
        <div className="mt-6"><PrimaryBtn>Anmelden</PrimaryBtn></div>
        <div className="my-5 flex items-center gap-3 text-xs text-puq-muted">
          <div className="h-px flex-1 bg-puq-line-2/60" />oder<div className="h-px flex-1 bg-puq-line-2/60" />
        </div>
        <GhostBtn>G  Mit Google anmelden</GhostBtn>
      </div>
      <div className="relative z-10 pb-7 text-center text-sm">
        <span className="text-puq-muted">Noch kein Konto? </span>
        <span className="font-semibold text-puq-pink">Registrieren</span>
      </div>
    </Screen>
  );
}

/* Screen 10 — Register */
export function S10_Register() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col items-center">
          <PuqMark size={28} />
          <h1 className="mt-3 text-[26px] font-bold">Create Account</h1>
          <p className="mt-1 text-[12.5px] text-puq-muted">In 30 Sekunden mit PuQ.me starten</p>
        </div>
        <div className="mt-7 space-y-3.5">
          <Field label="EMAIL"><Input placeholder="your@email.com" /></Field>
          <Field label="PASSWORD">
            <Input type="password" value="••••••••••" trailing={<span className="text-xs font-semibold text-puq-pink">Show</span>} />
          </Field>
          <div className="flex gap-1.5">
            {[true, true, true, false].map((on, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${on ? "bg-puq-mint" : "bg-puq-line-2/40"}`} />
            ))}
          </div>
          <div className="text-xs font-bold text-puq-mint">Strong</div>
          <Field label="BIRTHDAY · MIN. 18">
            <Input value="12 / 05 / 1992" trailing={<span>📅</span>} />
          </Field>
          <div className="space-y-2.5">
            <Check label={<>Ich stimme den <span className="text-puq-pink">Nutzungsbedingungen</span> zu</>} on />
            <Check label={<>Ich bin <b>über 18 Jahre alt</b></>} on />
          </div>
        </div>
        <div className="mt-6"><PrimaryBtn>Sign Up — Create Account</PrimaryBtn></div>
        <div className="my-4 text-center text-xs text-puq-muted">oder</div>
        <GhostBtn>G  Continue with Google</GhostBtn>
        <div className="mt-5 text-center text-sm">
          <span className="text-puq-muted">Schon Konto? </span>
          <span className="font-semibold text-puq-pink">Login</span>
        </div>
      </div>
    </Screen>
  );
}
function Check({ label, on }: { label: React.ReactNode; on?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-puq-text/90">
      <span className={`grid h-5 w-5 place-items-center rounded-md text-[11px] font-bold ${on ? "bg-puq-pink text-white" : "border border-puq-line-2/70"}`}>{on ? "✓" : ""}</span>
      <span>{label}</span>
    </div>
  );
}

/* Screen 11 — Forgot Password */
export function S11_Forgot() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Password" />
      <div className="relative z-10 flex-1 px-6">
        <h1 className="text-[34px] font-bold leading-[1.05]">
          Passwort
          <em className="block font-serif italic text-puq-pink">vergessen?</em>
        </h1>
        <p className="mt-3 text-[13px] text-puq-muted">Kein Problem — wir senden dir einen Link per E-Mail.</p>
        <div className="mt-5">
          <Field label="E-MAIL-ADRESSE">
            <Input value="alan@example.com" className="border-puq-pink/70" />
          </Field>
        </div>
        <div className="mt-7 space-y-4">
          <SectionLabel color="muted">SO GEHT'S</SectionLabel>
          {[
            ["1", "E-Mail eingeben", "Wir senden dir einen Reset-Link"],
            ["2", "Link öffnen", "Innerhalb von 15 Min gültig"],
            ["3", "Neues Passwort", "Mind. 8 Zeichen, gemischt"],
          ].map(([n, t, s]) => (
            <div key={n} className="flex gap-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-puq-pink text-xs font-bold">{n}</div>
              <div>
                <div className="text-[14px] font-bold">{t}</div>
                <div className="text-[12px] text-puq-muted">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FootBar>
        <PrimaryBtn>Send Reset Link</PrimaryBtn>
        <div className="mt-2 text-center text-xs text-puq-muted">Zurück zum Login</div>
      </FootBar>
    </Screen>
  );
}

/* Screen 12 — 2FA */
export function S12_TwoFA() {
  return (
    <Screen>
      <StatusBar />
      <ScreenHeader title="Security" />
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-32">
        <SectionLabel color="mint">★ SICHERHEIT · RECOMMENDED</SectionLabel>
        <h1 className="mt-2 text-[34px] font-bold leading-[1.05]">
          2-Faktor-
          <em className="block font-serif italic text-puq-pink">Authentifizierung.</em>
        </h1>
        <p className="mt-3 text-[12.5px] text-puq-muted">
          Auch wenn dein Passwort geklaut wird — dein Konto ist sicher.
        </p>
        <div className="mt-5 space-y-2.5">
          <OptionRow
            icon={<span className="text-2xl">📱</span>}
            title="SMS"
            subtitle={<>+49 ••• •••• 4567 ·{" "}<span className="text-puq-mint font-semibold">Code per SMS</span></> as any}
            selected
            selectColor="mint"
            trailing={<span className="grid h-6 w-6 place-items-center rounded-full bg-puq-mint text-puq-deep">✓</span>}
          />
          <OptionRow icon={<span className="text-2xl">🧮</span>} title="Authenticator-App" subtitle={<>Google · Authy · 1Password ·{" "}<span className="text-[#5BC8FF] font-semibold">Code aus App ablesen</span></> as any} />
          <OptionRow icon={<span className="text-2xl">🔑</span>} title="Hardware-Key" subtitle={<>YubiKey · Solokey ·{" "}<span className="text-puq-lemon font-semibold">Physischer USB-Stick</span></> as any} />
        </div>
      </div>
      <FootBar><PrimaryBtn>Enable 2FA</PrimaryBtn></FootBar>
    </Screen>
  );
}
