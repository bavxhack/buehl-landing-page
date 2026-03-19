# Bühl Landingpage

Eine kleine Symfony-Anwendung, die nach erfolgreicher Keycloak-Anmeldung eine helle, moderne Landingpage mit konfigurierbaren Link-Karten anzeigt.

## Funktionsumfang

- **Pflegbare Landingpage-Links** über `config/packages/app_links.yaml`
- **Konfigurierbarer Header** für Organisationslogo, Logo-Link, Badge, Titel und Beschreibung
- **Kleine Website-Logos pro Kachel** über eine Bild-URL in der Konfiguration
- **Keycloak/OpenID-Connect Login** vor der Startseite
- **Keycloak-Logout** inklusive Abmeldung aus der Keycloak-Session
- **Twig + TailwindCSS** für ein modernes, freundliches UI
- **Docker Compose** startet App, Socket.IO-Chat und Keycloak gemeinsam
- **Live-Chat mit Präsenzanzeige** über einen zweiten Node.js-Container und Socket.IO

## Schnellstart

```bash
docker compose up --build
```

Der PHP-Container installiert beim ersten Start automatisch die Composer-Abhängigkeiten und leert anschließend den Symfony-Cache.

Danach sind die Dienste erreichbar unter:

- Landingpage: <http://localhost:8080>
- Keycloak: <http://localhost:8081>
- Chat-Server (Socket.IO): <http://localhost:8082>

### Demo-Login

- Benutzername: `demo`
- Passwort: `demo`
- Keycloak Admin: `admin` / `admin`


## Live-Chat

Rechts auf der Landingpage gibt es einen kleinen Live-Chat. Die angezeigten Namen stammen direkt aus dem Keycloak-Login. Andere angemeldete Nutzer erscheinen mit grünem Statuspunkt in der Online-Liste.

Eigenschaften:

- **Direktnachrichten an gerade online befindliche Nutzer**
- **Keine Persistenz**: Nachrichten werden nicht in Datenbank oder Dateien gespeichert
- **Ephemeres Verhalten**: Nach einem Reload bzw. Schließen der Sitzung ist der lokale Verlauf weg
- **Separater Node.js-Container** mit Socket.IO für Präsenz und Nachrichtenaustausch

Die Frontend-Anwendung verbindet sich dabei mit `CHAT_SERVER_URL` (Standard: `http://localhost:8082`).

## Landingpage konfigurieren

Die Texte im oberen Bereich, das Organisationslogo und die Link-Karten werden in `config/packages/app_links.yaml` gepflegt:

```yaml
parameters:
    app.landing_header:
        logo: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://example.org'
        logo_alt: 'Organisationslogo'
        logo_href: 'https://example.org'
        badge: 'Geschützt via Keycloak SSO'
        title: 'Willkommen auf deinem persönlichen Link-Hub.'
        description: 'Alle Karten werden zentral aus einer Symfony-Konfigurationsdatei geladen.'

    app.landing_links:
        - text: 'Symfony Dokumentation'
          url: 'https://symfony.com/doc'
          color: 'from-sky-500 to-cyan-500'
          image: 'https://www.google.com/s2/favicons?sz=64&domain_url=https://symfony.com'
```

### Organisationslogo im Header

Für das Logo deiner Organisation im oberen Bereich setzt du einfach in `app.landing_header.logo` eine Bild-URL oder einen lokalen Asset-Pfad. Über `logo_href` machst du das Logo klickbar, zum Beispiel auf die Hauptseite oder das Organisationsportal.

Beispiele:

- Externe Bild-URL: `https://example.com/logo.png`
- Lokale Datei: `/images/organisation-logo.svg`
- Klick-Ziel: `https://example.org`
- Favicon-artiges Logo: `https://www.google.com/s2/favicons?sz=128&domain_url=https://example.org`

Über `logo_alt` kannst du den sichtbaren Alternativtext im Header anpassen.

### Bild-Logos pro Kachel

Jede Kachel kann mit einem kleinen Website-Logo versehen werden. Dafür gibst du einfach eine Bild-URL in `image:` an.

Beispiele:

- Favicon über Google S2: `https://www.google.com/s2/favicons?sz=64&domain_url=https://example.com`
- Eigenes Logo: `https://example.com/logo.png`
- Lokale Datei im Projekt: `/images/logo.svg`

Falls du aus Kompatibilitätsgründen noch `icon:` statt `image:` verwendest, wird der bisherige Icon-Fallback weiterhin unterstützt.

## Wichtige Umgebungsvariablen

Die Keycloak-Verbindung ist in `.env` vorbelegt und passt zu `docker-compose.yml`:

- `APP_URL`
- `KEYCLOAK_SERVER_URL`
- `KEYCLOAK_PUBLIC_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`
- `KEYCLOAK_REDIRECT_URI`
- `CHAT_SERVER_URL`

## Lokale Entwicklung ohne Docker

Sobald Composer-Abhängigkeiten installiert sind, kann die App auch lokal gestartet werden:

```bash
composer install
php bin/console cache:clear
php -S 127.0.0.1:8000 -t public
```
