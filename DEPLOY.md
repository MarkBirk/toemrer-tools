# Deploy Guide – Tømrer Tools

## Anbefalet: Netlify (gratis, auto-deploy)

### 1. Push til GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DIT-BRUGERNAVN/toemrer-tools.git
git push -u origin main
```

### 2. Forbind til Netlify

1. Gå til [netlify.com](https://app.netlify.com/) → opret gratis konto
2. Klik **"Add new site"** → **"Import an existing project"**
3. Vælg **GitHub** og find dit repo
4. Netlify auto-udfylder build-settings fra `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Klik **"Deploy site"**

### 3. Siden er live!

Du får en URL som `https://random-name.netlify.app`.

Omdøb til noget pænere:
- **Site configuration** → **Change site name** → f.eks. `toemrer-tools`
- Nu live på: `https://toemrer-tools.netlify.app`

### 4. Tilføj eget domæne (senere)

1. Køb domæne (f.eks. på GoDaddy, Namecheap, Porkbun)
2. I Netlify: **Domain management** → **Add custom domain**
3. Følg DNS-instruktionerne (peg CNAME eller A-record)
4. Netlify giver automatisk gratis HTTPS via Let's Encrypt

### 5. Redigér og opdatér

```bash
# Lav ændringer i koden
git add .
git commit -m "Opdatering"
git push
# → Netlify auto-deployer inden ~60 sekunder
```

---

## Alternativ: Statisk upload (GoDaddy/anden host)

Hvis du ikke vil bruge GitHub/Netlify:

### 1. Byg projektet

```bash
npm run build
```

### 2. Upload `dist/` mappen

Upload indholdet af `dist/` til din hosts `public_html/` via FTP/cPanel.

**Vigtigt:** Appen bruger BrowserRouter, så serveren SKAL sende alle requests til `index.html`. På Apache, opret en `.htaccess` fil i `public_html/`:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## E-mail backend (valgfrit)

E-mail-funktionen kræver en server. Tre muligheder:

### A) Netlify Functions (nemmest)

Opret `netlify/functions/send-email.js` med nodemailer-logik. Sæt SMTP-variabler som Netlify environment variables.

### B) Ekstern server

Kør `server/server.js` på en VPS/Node.js host. Sæt API URL i appens indstillinger.

### C) EmailJS (ingen server)

Brug [emailjs.com](https://www.emailjs.com/) (gratis: 200 mails/md). Ingen backend nødvendig.

---

## SEO

Hver side har unikke meta-tags (title, description, Open Graph) via react-helmet-async. Disse sættes i `src/App.jsx`.

For at ændre en sides SEO-tekst, find den i `tools`-arrayet i `src/App.jsx` og ret `seoDesc`.

---

## Fejlfinding

| Problem | Løsning |
|---------|---------|
| Blank side | Tjek at `index.html` er i roden + SPA redirect er konfigureret |
| 404 på sider | SPA routing mangler – tjek `_redirects` eller `.htaccess` |
| Favicon vises ikke | Hard-refresh (Ctrl+Shift+R) eller ryd cache |
| E-mail virker ikke | Tjek SMTP-oplysninger og API URL i indstillinger |
