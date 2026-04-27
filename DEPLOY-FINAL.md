# PuQ.me — Final Deploy Steps (Live-verifiziert)

> Stand: 2026-04-27, im Browser gegen deinen eingeloggten Account verifiziert.
>
> Diese Datei dokumentiert exakt was JETZT live ist und welche drei Schritte
> dich zur lauffähigen App führen.

---

## ✅ Was bereits live ist (Browser-verifiziert)

### Cloudflare (Account `b7730525…`)

- **Pages-Projekt `puq-me`** — Auto-Deploy von `PuqMe/puq-me`#main
- **Worker `puqme-api`** — D1+KV+Durable-Object-Bindings, 645 Anfragen / 24h
- **Worker `puqme-cdn`** — seit 34 Tagen, 86 Anfragen / 24h
- **D1 `puqme-db`** — 64 Tabellen, aktiv (285 Reads / 101 Writes pro Tag)
- **Letzter Build**: `a7e2a00` ("feat(mail): MailChannels integration")

### IDrive E2 (Account `7puqme@gmail.com`)

- **Region**: London-2 / `eu-west-3` ✅ aktiviert
- **Endpunkt**: `s3.eu-west-3.idrivee2.com`
- **5 Buckets** ✅ angelegt, alle privat:
  - `puq-avatars`
  - `puq-images`
  - `puq-chat-media`
  - `puq-id-docs` — **mit 2-Tage-Lifecycle** (DSGVO Auto-Delete)
  - `puq-backups`
- **Access Key** `puqme-api-worker` ✅ generiert mit Lese-/Schreibzugriff
  - CSV liegt jetzt in `~/Downloads/`

### Lokal im Workspace

- Backup-Tag `pre-puqme-app-impl-20260426-2355`
- 83 Showcase-Screens in `apps/web/components/showcase/`
- Mobile-PWA-Shell, AuthProvider, ApiClient
- 4 neue Routes: `/splash`, `/language`, `/onboarding/values`, `/notifications`
- Worker-Code in `workers/api/` mit aktualisierter Region `eu-west-3`

---

## 🚀 Drei Schritte bis live

### Schritt 1 — Lokaler Push (dein Mac-Terminal)

```bash
cd "/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine Ablage/03. Akdeniz.Group/- - Projects/PuQ.me/PuQ.me"
rm -f .git/index.lock
git add -A
git commit -m "feat(web): 83 mockup screens + mobile PWA shell + auth/api client + new app routes; chore(infra): IDrive E2 eu-west-3"
git push origin main
```

Cloudflare Pages baut automatisch in ~60–90 s. Du kannst live mitschauen unter
`https://dash.cloudflare.com/b7730525ee304e08cce2716ca8519c06/pages/view/puq-me`.

Nach erfolgreichem Build erreichbar:

| URL | Funktion |
|---|---|
| https://puq.me/showcase | Galerie aller 83 Mockup-Screens |
| https://puq.me/splash | App-Splash mit Auto-Routing |
| https://puq.me/language | Funktionale Sprachwahl (10 Sprachen) |
| https://puq.me/onboarding/values | 4-Step Wert-Slides |
| https://puq.me/notifications | Notifications-Inbox (auth-protected) |

### Schritt 2 — IDrive-Secrets in Cloudflare Worker setzen

> ⚠️ **WICHTIG, im Browser entdeckt**: der Worker `puqme-api` hat bereits
> `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`
> als Geheimnis-Variablen. Der existierende Worker-Code in `apps/api-worker/`
> nutzt diese Namen, nicht `IDRIVE_E2_*`.
>
> Du **updatest** also bestehende Variablen, statt neue anzulegen.
> Falls der Worker bisher gegen ein anderes IDrive-Konto/Region ging, prüfe
> erst ob da produktive Daten drin sind, bevor du überschreibst.

Öffne `~/Downloads/<keys-csv>` aus IDrive — dort findest du:
- `Endpunkt: s3.eu-west-3.idrivee2.com`
- `Regionscode: eu-west-3`
- `Zugriffsschlüssel-ID: BKj5AwtjJzVm0AlcN8XN` (16 Zeichen, beginnt mit BKj…)
- `Geheimer Zugriffsschlüssel: zfqGqbm…` (40 Zeichen)

In **Cloudflare Workers-Dashboard** → `puqme-api` → **Einstellungen** →
**Variablen und geheime Schlüssel** → für jedes Feld den **Stift-Icon** klicken
und Wert ersetzen:

| Variable | Neuer Wert |
|---|---|
| `S3_ACCESS_KEY` | aus CSV: Zugriffsschlüssel-ID |
| `S3_SECRET_KEY` | aus CSV: Geheimer Zugriffsschlüssel |
| `S3_ENDPOINT` | `s3.eu-west-3.idrivee2.com` |
| `S3_REGION` | `eu-west-3` |
| `S3_BUCKET` | `puq-images` (oder welcher Bucket Default sein soll) |

Direkt-Link:
`https://dash.cloudflare.com/b7730525ee304e08cce2716ca8519c06/workers/services/view/puqme-api/production/settings`

> Hinweis: mein in `workers/api/src/index.ts` geschriebener Worker-Code
> verwendet `IDRIVE_E2_*` als Variablennamen — das ist eine **Referenz-
> Implementierung**, nicht der produktive Code. Der echte Worker liegt in
> `apps/api-worker/` und nutzt `S3_*`. Wenn du meinen Reference-Worker
> deployen willst, müsstest du ihn auf `S3_*` umbenennen oder die
> Variablen unter beiden Namen pflegen.

### Schritt 3 — Live-Test

Nach Push und Secrets-Setup:

1. Öffne `https://puq.me/showcase` → Galerie sollte 83 Screens zeigen.
2. Öffne `https://puq.me/splash` → leitet nach 1,5 s zu `/language` weiter.
3. Wähle Sprache → `/onboarding/values` → 4 Slides → `/login`.
4. Add-to-Homescreen testen auf iPhone Safari: PWA-Shell sollte fullscreen laufen,
   kein Pinch-Zoom, kein Auto-Zoom auf Inputs.

Wenn ein Schritt scheitert: Cloudflare-Pages-Deployment-Logs öffnen, Fehler
copy-pasten, ich fixe direkt.

---

## ⚠️ Was bewusst noch nicht gemacht ist

- **Lifecycle ist 2 Tage statt 24 h**: IDrive-E2-Free-Tier-Limit. Eine Worker-Cron
  als Defense-in-Depth (24h-Vorlöschung) ist noch zu schreiben.
- **CORS-Konfiguration auf Buckets**: aktuell sperren die Buckets alles, was
  okay ist solange nur die Worker zugreifen. Wenn der Browser direkt zu
  `cdn.puq.me` lesen soll, braucht's Bucket-CORS für `puq.me` und `www.puq.me`.
- **Auth-Endpoints auf Worker**: das existierende `apps/api-worker/src/routes/auth.ts`
  bedient bereits Login/Register. Refresh-Tokens, Email-Verify-Tokens und 2FA
  brauchen einen genauen Audit — eigene Session.
- **Existierende Frontend-Routes** (`/login`, `/register`, `/profile/create`,
  `/visibility`, `/encounter`, `/chat`, `/settings`) auf Mockup-Look umstellen
  ohne API-Logik zu verlieren — pro Route 30–60 Min Refactor.

## 🔁 Notfall-Rollback

Falls der neue Build kaputt ist, im Pages-Dashboard:

```
puq-me → Bereitstellungen → vorheriger Build (3fb665f) → "Roll back to this deployment"
```

Bringt den Stand vor diesem Push in <30 s zurück. Lokal ist
`pre-puqme-app-impl-20260426-2355` der Backup-Tag.
