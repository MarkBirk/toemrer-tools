import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ─── Middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── MySQL Connection Pool ───────────────────────────
let db;
async function initDB() {
  if (!process.env.DB_HOST) {
    console.warn('DB_HOST ikke sat — database-funktioner deaktiveret.');
    return;
  }
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Opret tabeller hvis de ikke findes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      pro_status TINYINT(1) DEFAULT 0,
      disabled TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      type ENUM('general', 'pro') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY waitlist_email_type (email, type)
    )
  `);
  console.log('MySQL forbundet og tabeller klar.');
}

// ─── Rate Limiters ───────────────────────────────────
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'For mange forespørgsler. Prøv igen senere.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'For mange login-forsøg. Prøv igen om lidt.' }
});

// ─── SMTP ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ─── Helpers ─────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireDB(req, res, next) {
  if (!db) return res.status(503).json({ error: 'Database ikke konfigureret.' });
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ikke logget ind.' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Ugyldig eller udløbet session.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Kræver admin-rettigheder.' });
    }
    next();
  });
}

// Legacy token auth (for email endpoint)
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

// ─── Auth Endpoints ──────────────────────────────────

// POST /api/auth/signup
app.post('/api/auth/signup', requireDB, authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail og adgangskode er påkrævet.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Ugyldig e-mail-adresse.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Adgangskode skal være mindst 6 tegn.' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Denne e-mail er allerede registreret.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email.toLowerCase(), hash]
    );

    const user = { id: result.insertId, email: email.toLowerCase(), role: 'user' };
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, pro_status: false }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Kunne ikke oprette konto.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', requireDB, authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail og adgangskode er påkrævet.' });
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Forkert e-mail eller adgangskode.' });
    }

    const user = rows[0];
    if (user.disabled) {
      return res.status(403).json({ error: 'Denne konto er deaktiveret.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Forkert e-mail eller adgangskode.' });
    }

    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        pro_status: !!user.pro_status,
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login fejlede.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', requireDB, requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, role, pro_status, disabled, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bruger ikke fundet.' });
    }
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      role: u.role,
      pro_status: !!u.pro_status,
      created_at: u.created_at,
      last_login: u.last_login,
    });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Kunne ikke hente profil.' });
  }
});

// ─── Admin Endpoints ─────────────────────────────────

// GET /api/admin/stats
app.get('/api/admin/stats', requireDB, requireAdmin, async (req, res) => {
  try {
    const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [[{ pro }]] = await db.execute('SELECT COUNT(*) as pro FROM users WHERE pro_status = 1');
    const [[{ waitlist }]] = await db.execute('SELECT COUNT(*) as waitlist FROM waitlist');
    const [[{ recent }]] = await db.execute(
      'SELECT COUNT(*) as recent FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    res.json({ total, pro, waitlist, recent });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Kunne ikke hente statistik.' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', requireDB, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, role, pro_status, disabled, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(rows.map(u => ({ ...u, pro_status: !!u.pro_status, disabled: !!u.disabled })));
  } catch (err) {
    console.error('Users error:', err.message);
    res.status(500).json({ error: 'Kunne ikke hente brugere.' });
  }
});

// PATCH /api/admin/users/:id/pro
app.patch('/api/admin/users/:id/pro', requireDB, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT pro_status FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bruger ikke fundet.' });

    const newStatus = rows[0].pro_status ? 0 : 1;
    await db.execute('UPDATE users SET pro_status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ pro_status: !!newStatus });
  } catch (err) {
    console.error('Toggle pro error:', err.message);
    res.status(500).json({ error: 'Kunne ikke opdatere pro-status.' });
  }
});

// PATCH /api/admin/users/:id/disable
app.patch('/api/admin/users/:id/disable', requireDB, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT disabled FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bruger ikke fundet.' });

    const newStatus = rows[0].disabled ? 0 : 1;
    await db.execute('UPDATE users SET disabled = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ disabled: !!newStatus });
  } catch (err) {
    console.error('Toggle disable error:', err.message);
    res.status(500).json({ error: 'Kunne ikke opdatere bruger-status.' });
  }
});

// GET /api/admin/waitlist
app.get('/api/admin/waitlist', requireDB, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM waitlist ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Waitlist error:', err.message);
    res.status(500).json({ error: 'Kunne ikke hente venteliste.' });
  }
});

// ─── Email Endpoint (existing) ───────────────────────
app.post('/api/send-email', emailLimiter, requireToken, async (req, res) => {
  try {
    const { to, subject, html, text, pdfBase64, pdfFilename } = req.body;

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

// ─── Health Check ────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbOk = db ? await db.execute('SELECT 1').then(() => true).catch(() => false) : false;
  res.json({ status: 'ok', database: dbOk ? 'connected' : 'not configured' });
});

// ─── Static Files (Production) ───────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

// ─── Start ───────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`HåndværkerTools server kører på port ${PORT}`);
  });
}).catch(err => {
  console.error('DB init fejl:', err.message);
  // Start serveren alligevel (email og static files virker stadig)
  app.listen(PORT, () => {
    console.log(`HåndværkerTools server kører på port ${PORT} (uden database)`);
  });
});
