import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Rate limiting: max 10 emails per 15 min per IP
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'For mange forespørgsler. Prøv igen senere.' }
});

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Auth middleware
function requireToken(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Server er ikke konfigureret (mangler ADMIN_TOKEN).' });
  }
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Ugyldigt token.' });
  }
  next();
}

// POST /api/send-email
app.post('/api/send-email', emailLimiter, requireToken, async (req, res) => {
  try {
    const { to, subject, html, text, pdfBase64, pdfFilename } = req.body;

    // Validate
    if (!to || !subject) {
      return res.status(400).json({ error: 'Mangler modtager eller emne.' });
    }

    const recipients = Array.isArray(to) ? to : [to];
    for (const email of recipients) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: `Ugyldig e-mail: ${email}` });
      }
    }

    if (recipients.length > 10) {
      return res.status(400).json({ error: 'Maks 10 modtagere.' });
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: recipients.join(', '),
      subject,
      text: text || '',
      html: html || ''
    };

    // Attach PDF if provided
    if (pdfBase64 && pdfFilename) {
      mailOptions.attachments = [{
        filename: pdfFilename,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      }];
    }

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'E-mail sendt.' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Kunne ikke sende e-mail. Tjek server-konfiguration.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve static files
if (process.env.NODE_ENV === 'production') {
  const distPath = resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Tømrer Tools server kører på port ${PORT}`);
});
