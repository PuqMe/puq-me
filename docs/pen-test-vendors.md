# Penetration-Test-Anbieter — Empfehlungen für PuQ.me

**Stand:** April 2026
**Empfohlener Zeitpunkt:** Vor öffentlichem Markt-Launch (nach Soft-Launch München, vor Berlin/DACH-Rollout)
**Scope:** Web (puq.me), API (api.puq.me), Mobile-PWA, OWASP Top 10 + DSGVO-spezifische Risiken

---

## TL;DR

| Anbieter | Lead-Zeit | Preisrange | Methode | Sprache | Empfehlung |
|---|---|---|---|---|---|
| **Cure53** (DE) | 4–8 Wochen | €25k–€80k | rein manuell | DE/EN | **Erste Wahl** wenn Budget vorhanden |
| **SECUINFRA** (DE) | 3–5 Wochen | €15k–€40k | manuell + Tools | DE | Solide DACH-Alternative |
| **HackerOne PaaS** | 2–3 Wochen | €10k–€25k | manuell, Crowd | EN | Schnell + günstig, weniger DACH-Fokus |
| **Bugcrowd Pen Test** | 2–4 Wochen | €12k–€30k | manuell, Crowd | EN | Vergleichbar mit HackerOne |
| **NCC Group** (UK/DE) | 6–10 Wochen | €40k–€120k | rein manuell | DE/EN | Enterprise-Tier, für größere Runden |

---

## Empfehlung in Reihenfolge

### 1. Cure53 (Erste Wahl für PuQ.me)

- **Sitz:** Berlin
- **Vorteile:** Top-Tier deutscher Pen-Tester, hohe Reputation in DSGVO-/Privacy-relevanten Audits, kennen Cloudflare-Stack + WebSocket-Sicherheit (haben u.a. Mullvad, ProtonMail, Signal auditiert), kommunizieren auf Deutsch
- **Nachteile:** Lead-Zeit oft 6–8 Wochen, hochpreisig
- **Realistisches Paket:** Web + API Pen-Test, 8–12 Tester-Tage, ca. €30k–€50k netto
- **Kontakt:** mail@cure53.de · https://cure53.de
- **Warum Cure53 für PuQ.me:** Standortbasiertes Social Network mit Foto-Upload + Chat ist ein klassisches Privacy-Risk-Profil (Stalking, Geo-Leaks, ATO). Cure53 hat genau dafür Track Record.

### 2. SECUINFRA (DACH-Alternative)

- **Sitz:** Berlin / Köln
- **Vorteile:** Deutsch, BSI-konform, schneller verfügbar als Cure53, kombinieren manuelle Tests mit Burp/ZAP-gestützter Coverage
- **Nachteile:** Weniger internationaler Track-Record
- **Realistisches Paket:** Web + API Black-/Grey-Box, 5–7 Tage, ca. €15k–€25k
- **Kontakt:** info@secuinfra.com · https://www.secuinfra.com
- **Warum für PuQ.me:** Wenn du DSGVO-konformen Audit-Bericht für Investor- oder Datenschutz-Behörden-Vorzeige brauchst.

### 3. HackerOne Pentest-as-a-Service

- **Sitz:** USA, mit EU-Tester-Pool
- **Vorteile:** Schnellste Lead-Zeit (2–3 Wochen), Plattform-basierte Findings-Verwaltung, kombiniert Crowd-Tester mit ausgewählten Top-Hackern
- **Nachteile:** Englischsprachig, Tester-Pool ist heterogen (Qualität schwankt)
- **Realistisches Paket:** Standard PaaS Web + API, 60–80 Stunden Tester-Zeit, ca. €12k–€20k
- **Kontakt:** sales@hackerone.com · https://www.hackerone.com/product/pentest
- **Warum für PuQ.me:** Wenn das Budget knapp ist und du einen schnellen 90-%-OWASP-Coverage-Audit willst.

### 4. Bugcrowd Pen Test as a Service

- **Sitz:** USA, EU-Tester-Pool
- **Vorteile:** Vergleichbar mit HackerOne, etwas günstiger im Mid-Market-Segment
- **Nachteile:** Wie HackerOne — englisch, Crowd-Heterogenität
- **Realistisches Paket:** Standard Pentest, 50–70 Stunden, ca. €10k–€18k
- **Kontakt:** sales@bugcrowd.com · https://www.bugcrowd.com/products/penetration-testing

### 5. NCC Group

- **Sitz:** Manchester (UK), Frankfurt-Office, weltweit
- **Vorteile:** Enterprise-Klasse, kombinieren Pen-Test mit Threat-Modeling und Code-Review
- **Nachteile:** Sehr hochpreisig (€40k–€120k), Lead-Zeit oft 8+ Wochen, Overkill für PuQ.me-Größe
- **Wann sinnvoll:** Erst wenn PuQ.me >100k DAU, B2B-Enterprise-Umsätze oder Banken-/Versicherungs-Daten verarbeitet

---

## Was die Anfrage enthalten muss

Beim Anbieter-Briefing diese Infos vorbereiten:

1. **Scope-Liste** — welche Hosts/Apps:
   - `https://puq.me` (Cloudflare Pages, Next.js)
   - `https://api.puq.me` (Cloudflare Worker, Hono + D1 + KV)
   - WebSocket: `wss://api.puq.me/v1/ws`
   - PWA-Manifest + Service-Worker
2. **Auth-Methode** für Pen-Tester:
   - Test-User mit Standard-Berechtigung
   - Test-User mit Admin-Rolle (falls vorhanden)
   - API-Token, falls relevant
3. **No-Go-Liste:**
   - Keine Echtnutzer-Daten antasten
   - Kein Account-Spam (Rate-Limit kann auslösen)
   - Erst nach Vorab-Absprache: aktive Geo-Faking-Tests
4. **Reporting-Format:** Markdown + PDF, mit OWASP-WSTG-Referenzen, jeder Befund mit CVSS 4.0 Score und Reproduktions-Schritten
5. **Re-Test:** Nach Fix-Implementierung 1× kostenloser Re-Test innerhalb 30 Tagen

---

## Spezifische PuQ.me-Risiken die der Tester beachten muss

| Risiko-Kategorie | Was getestet werden sollte |
|---|---|
| **Geo-Privacy** | Lat/Lon-Coarsening tatsächlich serverseitig erzwungen? IDOR auf `/v1/circle/location-events`? Distanz-Berechnungen leak-anfällig? |
| **Foto-Upload** | IDrive E2 Pre-Signed URLs replay-anfällig? EXIF-Metadaten gestrippt? File-Type-Spoofing (SVG mit Script)? |
| **Chat-Sicherheit** | WebSocket Message-Validation, Rate-Limits, Cross-User-Message-Injection via Durable Objects, XSS via User-Eingaben |
| **Auth-Flows** | JWT-Refresh-Replay, Email-Verify-Token Brute-Force, Password-Reset-Token-Reuse, OAuth-State-CSRF |
| **DSGVO-Compliance** | Daten-Export Art. 20 wirklich vollständig + maschinenlesbar? Account-Delete kaskadiert über alle Tabellen? Recht auf Vergessenwerden vs. Backups? |
| **Phantom-/Stealth-Modi** | Zero-Trace-Mode hält dicht? Kein Server-Log-Leak? IDOR auf Visibility-Settings? |
| **Mobile-PWA** | Service-Worker Cache-Poisoning, Installation-Spoofing, Push-Notification-Hijack |
| **Stalker-Risiko** | Profile-Enumeration via Sequence-IDs, Timing-Side-Channel auf User-Existenz, Massen-Like-Bot-Resistenz |
| **Header-Hardening** | CSP-Bypass via permitted Domains? HSTS preload eingereicht? Subresource-Integrity auf 3rd-Party-Scripts? |

---

## Budget-Empfehlung nach Phase

| Phase | Empfehlung | Begründung |
|---|---|---|
| **Soft-Launch München (jetzt)** | Skip oder HackerOne-Light | Tester-Userbase < 500, Risk-Exposure niedrig, Findings via Sentry + manuell ausreichend |
| **DACH-Rollout (3–6 Monate später)** | **Cure53 oder SECUINFRA** | Erst wenn DAU > 5k oder Foto-Upload aktiv genutzt wird |
| **EU-weit / Funding-Runde** | NCC Group oder Cure53 + Code-Review-Add-on | VC + B2B-Versicherungen erwarten Top-Tier-Audit |

---

## Nicht buchen

- **Anbieter ohne deutsche/EU-Datenverarbeitung** für DSGVO-Audit-Doku (ein paar US-Anbieter werben mit „GDPR Pentest" haben aber Tester außerhalb der EU — Datenflüsse mit Test-User-Profilen problematisch)
- **„Pentest-Hersteller", die nur automatisierte Scans verkaufen** (Acunetix-/Nessus-Reports unter $5k-Marketing) — fängt höchstens Low-Hanging-Fruit, kein echter Pen-Test
- **Bugbounty-only** als Ersatz — Bug-Bounty kommt **nach** Pen-Test, nicht stattdessen

---

## Nächster Schritt

1. **Schreibe an Cure53** (mail@cure53.de) mit kurzer Scope-Beschreibung + Wunsch-Termin
2. **Parallel SECUINFRA + HackerOne** anfragen für Vergleichs-Angebote
3. **Nicht das erste Angebot annehmen** — Lead-Zeit verhandelbar, Preise weniger
4. **Vor dem Pen-Test:** Sentry läuft, internes Bug-Tracking läuft, Test-User-Pool existiert (sonst verschwendet der Tester Zeit auf Bugs die du selbst hättest finden können)

---

*Erstellt für PuQ.me-Markt-Launch-Vorbereitung. Preise sind Listenpreise April 2026, Verhandlung üblich. Lead-Zeiten variieren saisonal (Q4 ist meist ausgebucht, Q1+Q3 günstigste Slots).*
