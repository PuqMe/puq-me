# PuQ.me — Deploy-Now-Anleitung

> Stand: 2026-04-27 · live im Browser verifiziert
>
> Diese Datei ist der konkrete, geprüfte Pfad zum Live-Schalten der neuen
> Showcase-Seite + App-Shell (Splash, Sprache, Onboarding-Slides, Notifications).

---

## Live im Browser verifiziert

Cloudflare-Account `b7730525…` — alles eingeloggt:

| Was | Status |
|---|---|
| Pages-Projekt `puq-me` | ✅ aktiv, Auto-Deploy aus `PuqMe/puq-me`#main |
| Letzter erfolgreicher Build | `a7e2a00` "feat(mail): MailChannels integration" — 1 T alt |
| Worker `puqme-api` | ✅ deployed, 645 Anfragen / 24h, **3 Bindings**: Durable Object `CHAT_ROOM`, D1 `DB → puqme-db`, KV `KV` |
| D1 `puqme-db` | ✅ live, **64 Tabellen**, 285 Reads / 101 Writes pro Tag |
| Worker `puqme-cdn` | ✅ deployed (vor 34 T), 86 Anfragen / 24h |

GitHub-`main` HEAD = `a7e2a00`. Unser **lokaler** Stand mit den 83 Showcase-Screens
und der neuen App-Shell ist **noch nicht gepusht**.

---

## Was zu tun ist (nur 3 echte Schritte)

### 1 · Lokaler Push (du, im Mac-Terminal)

> Die Sandbox kann den `.git/index.lock` auf Google Drive nicht entfernen.
> Du bist die einzige, die das lokal pushen kann.

```bash
cd "/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine Ablage/03. Akdeniz.Group/- - Projects/PuQ.me/PuQ.me"
rm -f .git/index.lock
git add -A
git commit -m "feat(web): 83 mockup screens + mobile PWA shell + auth/api client + new app routes (splash, language, onboarding/values, notifications)"
git push origin main
```

Cloudflare Pages baut automatisch sobald `main` einen neuen Commit hat.
Der Build dauert ~60–90 s. Du kannst live mitschauen unter:

```
https://dash.cloudflare.com/b7730525ee304e08cce2716ca8519c06/pages/view/puq-me
```

Nach erfolgreichem Build erreichbar:

| URL | Was |
|---|---|
| https://puq.me/showcase | Galerie aller 83 Mockup-Screens |
| https://puq.me/showcase/welcome | Einzel-Screen (gleiche Struktur für alle 83 slugs) |
| https://puq.me/splash | Echter App-Splash mit Auto-Routing |
| https://puq.me/language | Funktionale Sprachwahl |
| https://puq.me/onboarding/values | 4-Step-Wert-Slides |
| https://puq.me/notifications | Notifications-Inbox (auth-protected) |

### 2 · IDrive E2 Buckets prüfen / anlegen

> Diese Schritte nur, wenn die Buckets noch nicht existieren. Da der Worker
> `puqme-api` schon 645 Anfragen / 24h serviert und es einen `puqme-cdn`-Worker
> seit 34 Tagen gibt, ist es plausibel, dass IDrive E2 schon teilweise steht.
> Verifiziere im IDrive-Dashboard.

Im IDrive-E2-Dashboard (https://console.idrivee2.com) prüfen, ob folgende Buckets
existieren — wenn nicht, anlegen:

- `puq-avatars` — Profilfotos
- `puq-images` — sonstige Bilder
- `puq-chat-media` — Voice-Messages, Chat-Bilder
- `puq-id-docs` — **mit 24h-Lifecycle-Regel** (DSGVO)
- `puq-backups` — DB-Dumps

Für `puq-id-docs` zwingend setzen:
- **Lifecycle**: alle Objekte nach 1 Tag löschen
- **Public Access**: blocked
- **CORS**: nur von api.puq.me erlaubt (kein cdn.puq.me)

Für die anderen Buckets:
- **Public Access**: blocked (nur Worker mit signiertem Key liest)
- **CORS**: lesend von puq.me, www.puq.me, cdn.puq.me — schreibend nur api.puq.me

### 3 · `api.puq.me` Custom-Domain (optional, wenn noch nicht aktiv)

Der Worker `puqme-api` läuft. Wenn `api.puq.me` noch nicht als Route eingetragen
ist, im Workers-Dashboard:

```
Workers and Pages → puqme-api → Settings → Domains and Routes → + Add Custom Domain
→ api.puq.me
```

Das ist binnen einer Minute fertig.

---

## Was NICHT zu tun ist

- **Keine D1-Migrations einspielen.** `puqme-db` hat bereits 64 Tabellen und
  bedient die existierenden Routes (login, register, profile, visibility, encounter,
  chat, settings). Jede manuelle Migration könnte produktive Daten zerstören.
- **Keinen neuen Worker erstellen.** `puqme-api` ist der eine Worker für api.puq.me.
  Mein neuer `workers/api/src/index.ts` aus der Architektur-Phase ist als
  *Referenz-Implementation* gemeint — nicht als Ersatz. Die existierenden
  API-Routes im Repo (`apps/api-worker/`) sind die produktive Codebasis und
  haben bereits Verbindung zu D1+KV+Durable Object.
- **Keine wrangler-Logins aus der Sandbox.** Wenn ein Worker-Update nötig wird,
  läuft `wrangler deploy` lokal aus deinem Mac.

---

## Was nach dem Push live ist

1. **Showcase-Galerie** — alle 83 Screens als Demo unter `/showcase`. Sofort
   benutzbar, um Stakeholdern, Investoren, Designern den Stand zu zeigen.
2. **PWA-Shell** — mobile fullscreen, kein Pinch-Zoom, kein iOS-Auto-Zoom auf
   Inputs, sauberes manifest mit Shortcuts. Add-to-Homescreen funktioniert.
3. **Onboarding-Routes** — `/splash`, `/language`, `/onboarding/values`. Die
   Sprachwahl persistiert in Cookie + localStorage und respektiert i18n des
   restlichen Systems.
4. **AuthProvider + ApiClient** — bereit, gegen api.puq.me zu sprechen. Mit
   Mock-Fallback solange keine echte Auth-Endpoint da ist.

## Was als Nächstes ansteht (nach erfolgreichem Push)

In dieser Reihenfolge, jeweils eine eigene Session:

1. **Auth-Worker fertig schreiben** — die existierenden Routes (login,
   register) reden bereits gegen `api.puq.me`. Ich schaue mir einmal
   `apps/api-worker/src/routes/auth.ts` an und schließe verbleibende Lücken
   (Email-Verify, Refresh-Token, optionales 2FA).
2. **Existierende Routes auf Mockup-Look umstellen** — `/login`, `/register`,
   `/profile/create`, `/visibility`, `/encounter`, `/encounter/[id]`, `/chat`,
   `/chat/[id]`, `/settings` bekommen das Aurora-Design aus den Mockup-Screens
   draufgesetzt, ohne die existierende API-Logik zu zerstören.
3. **Live-Test auf Gerät** — iPhone via Safari, Add-to-Homescreen, durchklicken.
   Alle Findings als Issues in PuqMe/puq-me anlegen, dann fixen.

---

## Notfall-Rollback

Falls der neue Build kaputt ist, im Pages-Dashboard:

```
puq-me → Bereitstellungen → vorheriger Build (3fb665f) → "Roll back to this deployment"
```

Das bringt die alte Version in <30 s zurück. Dein lokaler Tag
`pre-puqme-app-impl-20260426-2355` markiert auch den Code-Stand davor.
