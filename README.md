# Tømrer Tools

Praktiske beregningsværktøjer til den selvstændige tømrer. Mobilvenlig webapp med 12 værktøjer.

## Værktøjer

1. **Materialeberegner** – Terrasse, væg/reglar, isolering
2. **Taghældning** – Grader, procent, 1:X
3. **Spærlængde** – Pythagoras: spænd + højde → længde
4. **Skruer/Beslag** – Estimér skruer til terrasse/gips
5. **Mål-konverter** – Tommer, mm, cm, m, m²↔plader
6. **Tilbudsberegner** – Materialer + timer → tilbud med moms
7. **Materialeliste** – Opbyg og eksportér materialeliste
8. **Standardmål** – Husketabel med træ, plader, skruer m.m.
9. **Bygge-noter** – Noter pr. projekt, gemt lokalt
10. **Hvad vejer det?** – Vægt af træ, plader, beton m.m.
11. **Skæreplan** – Optimér skæring, minimér spild
12. **Bygge-regler** – Ofte brugte regler/krav (reference)

## Funktioner

- Gem/åbn/slet/duplikér beregninger (localStorage)
- Eksport: PDF, CSV, JSON, kopiér som tekst
- Delelink (komprimeret URL)
- E-mail med PDF-vedhæftning (kræver server)
- Samlet materialeliste på tværs af værktøjer

## Kør lokalt (udvikling)

### Forudsætninger

- [Node.js](https://nodejs.org/) v18+ installeret

### 1. Installér dependencies

```bash
cd DW-Tømrertools
npm install
```

### 2. Start frontend (dev-server)

```bash
npm run dev
```

Åbn http://localhost:3000 i browseren.

### 3. Start e-mail server (valgfrit)

Kun nødvendigt hvis du vil sende e-mails.

```bash
# Kopiér og redigér .env
cp .env.example .env
# Redigér .env med dine SMTP-oplysninger

# Installér server-dependencies
cd server
npm install

# Start serveren
npm start
```

Serveren kører på http://localhost:3001.

I appen (forsiden → Indstillinger):
- Sæt API URL til: `http://localhost:3001/api`
- Sæt Admin token til den værdi du valgte i `.env`

## E-mail konfiguration

Redigér `.env` filen:

```
SMTP_HOST=smtpout.secureserver.net    # GoDaddy SMTP
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=din@email.dk
SMTP_PASS=dit-password
MAIL_FROM=din@email.dk
ADMIN_TOKEN=vælg-et-sikkert-token
```

For GoDaddy Workspace Email: brug `smtpout.secureserver.net` port 465.

## Byg til produktion

```bash
npm run build
```

Output gemmes i `dist/` mappen. Denne mappe indeholder alle statiske filer klar til upload.

## Tech Stack

- **Frontend**: React 18 + Vite (SPA med HashRouter)
- **Styling**: Ren CSS, mobil-first
- **PDF**: jsPDF + jspdf-autotable
- **Komprimering**: pako (delelinks)
- **Backend**: Express + Nodemailer (kun til e-mail)
- **Data**: localStorage (ingen database)
