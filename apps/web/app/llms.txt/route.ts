import { NextResponse } from "next/server";

const LLMS_CONTENT = `# PuQ.me

> PuQ.me ist ein soziales Netzwerk für stadtbasierte Begegnungen. Die App verbindet Menschen in Echtzeit über ein standortbasiertes Radar, intelligentes Matching und interaktive Features.

## Über PuQ.me

PuQ.me ist eine kostenlose, DSGVO-konforme Social-Networking-Plattform mit Fokus auf echte Begegnungen in der Stadt. Die App wurde in Berlin entwickelt und richtet sich an den deutschsprachigen Raum (Deutschland, Österreich, Schweiz).

### Kernfunktionen

- **Radar**: Echtzeit-Entdeckung von Menschen in der Nähe auf einer interaktiven Karte
- **Smart Match**: KI-basierter Matching-Algorithmus für kompatible Begegnungen
- **Circle**: Dein sozialer Kreis — Kontakte und Verbindungen verwalten
- **Chat**: Direktnachrichten mit Matches und Kontakten
- **Buzz-Radar**: Entdecke Trends und Aktivitäten in deiner Umgebung
- **Interessenbasiertes Matching**: Profile werden nach gemeinsamen Interessen verbunden
- **Gruppenaktivitäten**: Spontane Treffen und Events in deiner Stadt

### Datenschutz & Sicherheit

- **Auto-Vanish**: Profil verschwindet automatisch nach festgelegter Zeit
- **Ruhemodus (Calm Mode)**: Bewusstes Limit für tägliche Interaktionen
- **Sichtbarkeitskontrollen**: Volle Kontrolle über die eigene Sichtbarkeit
- **DSGVO-konform**: Vollständige Einhaltung europäischer Datenschutzrichtlinien
- **Keine Werbung, kein Tracking**: Privatsphäre steht an erster Stelle

### Technische Details

- Plattform: Progressive Web App (PWA)
- Hosting: Cloudflare Pages (Edge-CDN, weltweit)
- Framework: Next.js 15
- Sprache: Deutsch (Hauptsprache)
- Kosten: Kostenlos
- Website: https://puq.me

## Seiten

- [Startseite](https://puq.me): Hauptseite mit App-Übersicht
- [In der Nähe](https://puq.me/nearby): Personen in der Umgebung entdecken
- [Radar](https://puq.me/radar): Echtzeit-Standortradar
- [Smart Match](https://puq.me/smart-match): Intelligentes Matching
- [Circle](https://puq.me/circle): Sozialer Kreis
- [Matches](https://puq.me/matches): Aktuelle Matches
- [Chat](https://puq.me/chat): Nachrichten
- [Profil](https://puq.me/profile): Eigenes Profil
- [Features](https://puq.me/features): Alle Funktionen
- [FAQ](https://puq.me/faq): Häufig gestellte Fragen
- [Über uns](https://puq.me/about): Über PuQ.me
- [Kontakt](https://puq.me/contact): Kontaktseite
- [Datenschutz](https://puq.me/privacy): Datenschutzerklärung
- [AGB](https://puq.me/terms): Nutzungsbedingungen
- [Impressum](https://puq.me/imprint): Impressum
- [Badges](https://puq.me/badges): Abzeichen und Erfolge
- [Buzz-Radar](https://puq.me/buzz): Trends und Aktivitäten
- [Follower](https://puq.me/followers): Follower verwalten
- [Karten](https://puq.me/cards): Aktivitäts-Karten
- [Interessen](https://puq.me/interests): Interessen einstellen
- [Vorhaben](https://puq.me/intent): Was suchst du?
- [Sichtbarkeit](https://puq.me/visibility): Sichtbarkeitseinstellungen
- [Auto-Verschwinden](https://puq.me/auto-vanish): Auto-Vanish-Modus
- [Ruhemodus](https://puq.me/calm): Calm Mode
- [Einstellungen](https://puq.me/settings): App-Einstellungen

## Kontakt

- Website: https://puq.me
- E-Mail: info@puq.me
- Standort: Berlin, Deutschland`;

export function GET() {
  return new NextResponse(LLMS_CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
