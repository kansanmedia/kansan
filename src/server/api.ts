import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import * as cheerio from 'cheerio';
import { withDb } from './db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// --- DATABASE INITIALIZATION ---
router.get('/db/init', async (req, res) => {
  await withDb(req, res, async (db) => {
    try {
      const sqlPath = path.join(process.cwd(), 'database.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Execute the entire SQL file
      await db.query(sql);
      
      res.json({ success: true, message: 'Database initialized successfully!' });
    } catch (error: any) {
      console.error('DB Init Error:', error);
      res.status(500).json({ error: 'Failed to initialize database', details: error.message });
    }
  });
});

// Middleware to protect admin routes
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ---
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Hardcoded fallback for demo purposes if DB is not set up
  if (username === 'admin' && password === 'admin123' && !process.env.DB_HOST) {
    const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { username: 'admin', role: 'admin' } });
  }

  await withDb(req, res, async (db) => {
    console.log(`Login attempt for username: ${username}`);
    const [rows]: any = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log(`User found. DB Hash: ${user.password}`);
    
    let validPassword = false;
    
    // Check if it's the default placeholder hash from database.sql
    if (user.password === '$2a$10$X.x/A.4m9w1z9q1w1q1w1.q1w1q1w1q1w1q1w1q1w1q1w1q1w1q1w' && password === 'admin123') {
      console.log('Matched placeholder hash');
      validPassword = true;
    } else {
      try {
        validPassword = await bcrypt.compare(password, user.password);
        console.log(`Bcrypt compare result: ${validPassword}`);
      } catch (e) {
        console.error('Bcrypt error:', e);
        validPassword = false;
      }
    }
    
    if (!validPassword) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful, generating token');
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

router.get('/auth/verify', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// --- PUBLIC ROUTES ---

// Fetch Open Graph Data
router.get('/og-data', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaTag = (name: string) =>
      $(`meta[property="og:${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content') ||
      $(`meta[name="twitter:${name}"]`).attr('content');

    const ogData = {
      title: getMetaTag('title') || $('title').text(),
      description: getMetaTag('description'),
      image: getMetaTag('image'),
      url: getMetaTag('url') || targetUrl,
    };

    res.json(ogData);
  } catch (error) {
    console.error('OG Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch OG data' });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Get all portfolios
router.get('/portfolios', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM portfolios ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Get all blogs
router.get('/blogs', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT id, title, slug, image, meta_title, meta_description, created_at FROM blogs ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Get single blog
router.get('/blogs/:slug', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows]: any = await db.execute('SELECT * FROM blogs WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  });
});

// Get all clients
router.get('/clients', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Get all subsidiaries
router.get('/subsidiaries', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM subsidiaries ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Get all active careers
router.get('/careers', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM careers WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json(rows);
  });
});

// Submit contact form
router.post('/contacts', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || '', message]
    );
    res.status(201).json({ success: true });
  });
});

// Submit job application
router.post('/applications', async (req, res) => {
  const { career_id, applicant_name, email, phone, resume_url, cover_letter } = req.body;
  if (!applicant_name || !email) return res.status(400).json({ error: 'Missing required fields' });
  
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO job_applications (career_id, applicant_name, email, phone, resume_url, cover_letter) VALUES (?, ?, ?, ?, ?, ?)',
      [career_id || null, applicant_name, email, phone || '', resume_url || '', cover_letter || '']
    );
    res.status(201).json({ success: true });
  });
});

// --- ADMIN PROTECTED ROUTES ---

// Image Upload
router.post('/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Dashboard Stats
router.get('/admin/stats', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    const [[services]]: any = await db.execute('SELECT COUNT(*) as count FROM services');
    const [[portfolios]]: any = await db.execute('SELECT COUNT(*) as count FROM portfolios');
    const [[blogs]]: any = await db.execute('SELECT COUNT(*) as count FROM blogs');
    const [[contacts]]: any = await db.execute('SELECT COUNT(*) as count FROM contacts');
    
    res.json({
      services: services.count,
      portfolios: portfolios.count,
      blogs: blogs.count,
      unreadContacts: contacts.count
    });
  });
});

// Generic CRUD helper for admin
const createCrudRoutes = (tableName: string) => {
  router.get(`/admin/${tableName}`, authenticateToken, async (req, res) => {
    await withDb(req, res, async (db) => {
      const [rows] = await db.execute(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
      res.json(rows);
    });
  });

  router.delete(`/admin/${tableName}/:id`, authenticateToken, async (req, res) => {
    await withDb(req, res, async (db) => {
      await db.execute(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
      res.json({ success: true });
    });
  });
};

createCrudRoutes('services');
createCrudRoutes('portfolios');
createCrudRoutes('blogs');
createCrudRoutes('clients');
createCrudRoutes('subsidiaries');
createCrudRoutes('careers');
createCrudRoutes('contacts');
createCrudRoutes('job_applications');

// Create Service
router.post('/admin/services', authenticateToken, async (req, res) => {
  const { title, slug, description, icon, image } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO services (title, slug, description, icon, image) VALUES (?, ?, ?, ?, ?)',
      [title, slug, description, icon || '', image || '']
    );
    res.status(201).json({ success: true });
  });
});

// Create Portfolio
router.post('/admin/portfolios', authenticateToken, async (req, res) => {
  const { title, slug, description, client_name, website_url, image } = req.body;
  await withDb(req, res, async (db) => {
    // Add website_url column if it doesn't exist yet (for backward compatibility)
    try {
      await db.execute('ALTER TABLE portfolios ADD COLUMN website_url VARCHAR(255)');
    } catch (e) {
      // Column might already exist, ignore error
    }
    
    await db.execute(
      'INSERT INTO portfolios (title, slug, description, client_name, website_url, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, description, client_name || '', website_url || '', image || '']
    );
    res.status(201).json({ success: true });
  });
});

// Create Subsidiary
router.post('/admin/subsidiaries', authenticateToken, async (req, res) => {
  const { name, description, website_url, logo } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO subsidiaries (name, description, website_url, logo) VALUES (?, ?, ?, ?)',
      [name, description, website_url || '', logo || '']
    );
    res.status(201).json({ success: true });
  });
});

// Create Blog
router.post('/admin/blogs', authenticateToken, async (req, res) => {
  const { title, slug, content, image, meta_title, meta_description } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO blogs (title, slug, content, image, meta_title, meta_description) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, content, image || '', meta_title || '', meta_description || '']
    );
    res.status(201).json({ success: true });
  });
});

// Create Client
router.post('/admin/clients', authenticateToken, async (req, res) => {
  const { name, logo, website_url } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO clients (name, logo, website_url) VALUES (?, ?, ?)',
      [name, logo || '', website_url || '']
    );
    res.status(201).json({ success: true });
  });
});

// Create Career
router.post('/admin/careers', authenticateToken, async (req, res) => {
  const { title, department, location, type, description, requirements, is_active } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'INSERT INTO careers (title, department, location, type, description, requirements, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, department || '', location || '', type || '', description || '', requirements || '', is_active === undefined ? true : is_active]
    );
    res.status(201).json({ success: true });
  });
});

export default router;
