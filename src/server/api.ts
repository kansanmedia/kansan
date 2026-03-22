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
const UPLOAD_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');

const normalizeText = (value: unknown) => String(value ?? '').trim();

const slugifyUploadName = (value: unknown) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const ALLOWED_UPLOAD_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']);
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
  'application/octet-stream',
]);

const dedupeBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const sanitizeHomepageSections = (items: any[]) =>
  dedupeBy(
    items
      .map((item, index) => ({
        id: item.id ? Number(item.id) : undefined,
        title: normalizeText(item.title),
        type: normalizeText(item.type).toLowerCase(),
        is_enabled: Boolean(item.is_enabled),
        display_order: index + 1,
      }))
      .filter((item) => item.title && item.type),
    (item) => item.type
  );

const sanitizeNavigationItems = (items: any[]) =>
  dedupeBy(
    items
      .map((item, index) => ({
        id: item.id ? Number(item.id) : undefined,
        label: normalizeText(item.label),
        url: normalizeText(item.url),
        is_enabled: Boolean(item.is_enabled),
        display_order: index + 1,
      }))
      .filter((item) => item.label && item.url),
    (item) => item.url.toLowerCase()
  );

const deleteMissingRows = async (db: any, tableName: string, ids: number[]) => {
  if (ids.length === 0) {
    await db.execute(`DELETE FROM ${tableName}`);
    return;
  }

  const placeholders = ids.map(() => '?').join(', ');
  await db.execute(`DELETE FROM ${tableName} WHERE id NOT IN (${placeholders})`, ids);
};

const PAGES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT,
    excerpt TEXT,
    image VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    nav_label VARCHAR(255),
    footer_label VARCHAR(255),
    show_in_nav BOOLEAN DEFAULT FALSE,
    show_in_footer BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const COLLECTIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS content_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    section_title VARCHAR(255),
    section_description TEXT,
    item_label_singular VARCHAR(255),
    item_label_plural VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const COLLECTION_ITEMS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS content_collection_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    image VARCHAR(255),
    link_url VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES content_collections(id) ON DELETE CASCADE
  )
`;

const ensurePagesTable = async (db: any) => {
  await db.execute(PAGES_TABLE_SQL);
};

const ensureCollectionsTables = async (db: any) => {
  await db.execute(COLLECTIONS_TABLE_SQL);
  await db.execute(COLLECTION_ITEMS_TABLE_SQL);
};

const getNavigationRows = async (db: any) => {
  await ensurePagesTable(db);

  const [navRows]: any = await db.execute(
    'SELECT label, url, is_enabled, display_order FROM navigation_items WHERE is_enabled = TRUE ORDER BY display_order ASC, id ASC'
  );
  const [pageRows]: any = await db.execute(
    `SELECT
      COALESCE(NULLIF(TRIM(nav_label), ''), title) AS label,
      CONCAT('/', slug) AS url,
      TRUE AS is_enabled,
      1000 + display_order AS display_order
    FROM pages
    WHERE is_published = TRUE AND show_in_nav = TRUE
    ORDER BY display_order ASC, id ASC`
  );

  return sanitizeNavigationItems([...navRows, ...pageRows]);
};

const getFooterLinkRows = async (db: any) => {
  await ensurePagesTable(db);

  const [navRows]: any = await db.execute(
    'SELECT label, url, is_enabled, display_order FROM navigation_items WHERE is_enabled = TRUE ORDER BY display_order ASC, id ASC'
  );
  const [pageRows]: any = await db.execute(
    `SELECT
      COALESCE(NULLIF(TRIM(footer_label), ''), NULLIF(TRIM(nav_label), ''), title) AS label,
      CONCAT('/', slug) AS url,
      TRUE AS is_enabled,
      1000 + display_order AS display_order
    FROM pages
    WHERE is_published = TRUE AND (show_in_footer = TRUE OR show_in_nav = TRUE)
    ORDER BY display_order ASC, id ASC`
  );

  return sanitizeNavigationItems([...navRows, ...pageRows]);
};

const removeUrlFromFooterQuickLinks = async (db: any, url: string) => {
  const [rows]: any = await db.execute('SELECT `value` FROM site_settings WHERE `key` = ?', ['footer_quick_links']);
  if (rows.length === 0) {
    return;
  }

  try {
    const parsed = JSON.parse(rows[0].value || '[]');
    if (!Array.isArray(parsed)) {
      return;
    }
    const nextItems = parsed.filter((item: unknown) => item !== url);
    await db.execute('UPDATE site_settings SET `value` = ? WHERE `key` = ?', [JSON.stringify(nextItems), 'footer_quick_links']);
  } catch {
    // ignore malformed footer quick links
  }
};

const getAdminLinkOptions = async (db: any) => {
  await ensurePagesTable(db);

  const [navRows]: any = await db.execute(
    'SELECT label, url, is_enabled, display_order FROM navigation_items ORDER BY display_order ASC, id ASC'
  );
  const [pageRows]: any = await db.execute(
    `SELECT
      COALESCE(NULLIF(TRIM(nav_label), ''), title) AS label,
      CONCAT('/', slug) AS url,
      TRUE AS is_enabled,
      1000 + display_order AS display_order
    FROM pages
    ORDER BY display_order ASC, id ASC`
  );

  return sanitizeNavigationItems([...navRows, ...pageRows]);
};

router.get('/debug', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const requestedBaseName = slugifyUploadName(req.body?.uploadName);
    const originalBaseName = slugifyUploadName(path.parse(file.originalname).name);
    const baseName = requestedBaseName || originalBaseName || 'image';
    const uniqueSuffix = Date.now();
    cb(null, `${baseName}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    const extensionAllowed = ALLOWED_UPLOAD_EXTENSIONS.has(extension);
    const mimeTypeAllowed = mimeType.startsWith('image/') || ALLOWED_UPLOAD_MIME_TYPES.has(mimeType);

    if (extensionAllowed && mimeTypeAllowed) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, GIF, WEBP, SVG, and ICO files are allowed!'));
  }
});

// --- DATABASE INITIALIZATION ---
router.get('/db/init', async (req, res) => {
  if (process.env.ENABLE_DB_INIT !== 'true') {
    return res.status(403).json({
      error: 'Database init route is disabled',
      message: 'Set ENABLE_DB_INIT=true only when you intentionally want to run database initialization.'
    });
  }

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

// --- CMS PUBLIC ROUTES ---

// Get all site settings
router.get('/settings', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows]: any = await db.execute('SELECT `key`, `value`, `category` FROM site_settings');
    const settings: any = {};
    rows.forEach((row: any) => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Get enabled homepage sections
router.get('/homepage-sections', async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows]: any = await db.execute('SELECT * FROM homepage_sections WHERE is_enabled = TRUE ORDER BY display_order ASC, id ASC');
    res.json(sanitizeHomepageSections(rows));
  });
});

// Get published pages
router.get('/pages', async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensurePagesTable(db);
    const [rows] = await db.execute(
      'SELECT id, title, slug, excerpt, image, meta_title, meta_description, nav_label, footer_label, show_in_nav, show_in_footer, is_published, display_order, created_at FROM pages WHERE is_published = TRUE ORDER BY display_order ASC, created_at DESC'
    );
    res.json(rows);
  });
});

// Get single published page
router.get('/pages/:slug', async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensurePagesTable(db);
    const [rows]: any = await db.execute('SELECT * FROM pages WHERE slug = ? AND is_published = TRUE', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  });
});

// Get public content collections
router.get('/collections', async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [rows]: any = await db.execute(
      'SELECT * FROM content_collections WHERE is_enabled = TRUE ORDER BY created_at ASC, id ASC'
    );
    res.json(rows);
  });
});

router.get('/collections/homepage', async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [collections]: any = await db.execute(
      'SELECT * FROM content_collections WHERE is_enabled = TRUE ORDER BY created_at ASC, id ASC'
    );

    const payload = await Promise.all(
      collections.map(async (collection: any) => {
        const [items]: any = await db.execute(
          'SELECT * FROM content_collection_items WHERE collection_id = ? AND is_enabled = TRUE ORDER BY display_order ASC, id ASC',
          [collection.id]
        );
        return { collection, items };
      })
    );

    res.json(payload);
  });
});

// Get enabled navigation items
router.get('/navigation', async (req, res) => {
  await withDb(req, res, async (db) => {
    res.json(await getNavigationRows(db));
  });
});

// Get footer link options
router.get('/footer-links', async (req, res) => {
  await withDb(req, res, async (db) => {
    res.json(await getFooterLinkRows(db));
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

router.get('/admin/upload-library', authenticateToken, async (req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return res.json([]);
    }

    const files = fs
      .readdirSync(UPLOAD_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const fullPath = path.join(UPLOAD_DIR, entry.name);
        return {
          name: entry.name,
          url: `/uploads/${entry.name}`,
          modified: fs.statSync(fullPath).mtimeMs,
        };
      })
      .sort((a, b) => b.modified - a.modified);

    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load upload library', details: error.message });
  }
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
      if (tableName === 'pages') {
        await ensurePagesTable(db);
      }
      const [rows] = await db.execute(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
      res.json(rows);
    });
  });

  router.delete(`/admin/${tableName}/:id`, authenticateToken, async (req, res) => {
    await withDb(req, res, async (db) => {
      if (tableName === 'pages') {
        await ensurePagesTable(db);
        const [rows]: any = await db.execute('SELECT slug FROM pages WHERE id = ?', [req.params.id]);
        const slug = rows[0]?.slug;
        if (slug) {
          const url = `/${slug}`;
          await db.execute('DELETE FROM navigation_items WHERE url = ?', [url]);
          await removeUrlFromFooterQuickLinks(db, url);
        }
      }
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
createCrudRoutes('pages');

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

router.put('/admin/services/:id', authenticateToken, async (req, res) => {
  const { title, slug, description, icon, image } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE services SET title = ?, slug = ?, description = ?, icon = ?, image = ? WHERE id = ?',
      [title, slug, description, icon || '', image || '', req.params.id]
    );
    res.json({ success: true });
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

router.put('/admin/portfolios/:id', authenticateToken, async (req, res) => {
  const { title, slug, description, client_name, website_url, image } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE portfolios SET title = ?, slug = ?, description = ?, client_name = ?, website_url = ?, image = ? WHERE id = ?',
      [title, slug, description, client_name || '', website_url || '', image || '', req.params.id]
    );
    res.json({ success: true });
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

router.put('/admin/subsidiaries/:id', authenticateToken, async (req, res) => {
  const { name, description, website_url, logo } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE subsidiaries SET name = ?, description = ?, website_url = ?, logo = ? WHERE id = ?',
      [name, description, website_url || '', logo || '', req.params.id]
    );
    res.json({ success: true });
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

router.put('/admin/blogs/:id', authenticateToken, async (req, res) => {
  const { title, slug, content, image, meta_title, meta_description } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE blogs SET title = ?, slug = ?, content = ?, image = ?, meta_title = ?, meta_description = ? WHERE id = ?',
      [title, slug, content, image || '', meta_title || '', meta_description || '', req.params.id]
    );
    res.json({ success: true });
  });
});

// Create Page
router.post('/admin/pages', authenticateToken, async (req, res) => {
  const {
    title,
    slug,
    content,
    excerpt,
    image,
    meta_title,
    meta_description,
    nav_label,
    footer_label,
    show_in_nav,
    show_in_footer,
    is_published,
    display_order,
  } = req.body;

  await withDb(req, res, async (db) => {
    await ensurePagesTable(db);
    await db.execute(
      `INSERT INTO pages (
        title, slug, content, excerpt, image, meta_title, meta_description,
        nav_label, footer_label, show_in_nav, show_in_footer, is_published, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content || '',
        excerpt || '',
        image || '',
        meta_title || '',
        meta_description || '',
        nav_label || '',
        footer_label || '',
        Boolean(show_in_nav),
        Boolean(show_in_footer),
        is_published === undefined ? true : Boolean(is_published),
        Number(display_order) || 0,
      ]
    );
    res.status(201).json({ success: true });
  });
});

router.put('/admin/pages/:id', authenticateToken, async (req, res) => {
  const {
    title,
    slug,
    content,
    excerpt,
    image,
    meta_title,
    meta_description,
    nav_label,
    footer_label,
    show_in_nav,
    show_in_footer,
    is_published,
    display_order,
  } = req.body;

  await withDb(req, res, async (db) => {
    await ensurePagesTable(db);
    await db.execute(
      `UPDATE pages SET
        title = ?,
        slug = ?,
        content = ?,
        excerpt = ?,
        image = ?,
        meta_title = ?,
        meta_description = ?,
        nav_label = ?,
        footer_label = ?,
        show_in_nav = ?,
        show_in_footer = ?,
        is_published = ?,
        display_order = ?
      WHERE id = ?`,
      [
        title,
        slug,
        content || '',
        excerpt || '',
        image || '',
        meta_title || '',
        meta_description || '',
        nav_label || '',
        footer_label || '',
        Boolean(show_in_nav),
        Boolean(show_in_footer),
        is_published === undefined ? true : Boolean(is_published),
        Number(display_order) || 0,
        req.params.id,
      ]
    );
    res.json({ success: true });
  });
});

// Create Client
router.post('/admin/clients', authenticateToken, async (req, res) => {
  const { name, logo, website_url } = req.body;
  await withDb(req, res, async (db) => {
    // Add website_url column if it doesn't exist yet
    try {
      await db.execute('ALTER TABLE clients ADD COLUMN website_url VARCHAR(255)');
    } catch (e) {
      // Column might already exist, ignore error
    }
    
    await db.execute(
      'INSERT INTO clients (name, logo, website_url) VALUES (?, ?, ?)',
      [name, logo || '', website_url || '']
    );
    res.status(201).json({ success: true });
  });
});

router.put('/admin/clients/:id', authenticateToken, async (req, res) => {
  const { name, logo, website_url } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE clients SET name = ?, logo = ?, website_url = ? WHERE id = ?',
      [name, logo || '', website_url || '', req.params.id]
    );
    res.json({ success: true });
  });
});

// Create Career
router.post('/admin/careers', authenticateToken, async (req, res) => {
  const { title, department, location, type, description, requirements, is_active } = req.body;
  await withDb(req, res, async (db) => {
    // Add type column if it doesn't exist yet
    try {
      await db.execute('ALTER TABLE careers ADD COLUMN type VARCHAR(50)');
    } catch (e) {
      // Column might already exist, ignore error
    }
    
    await db.execute(
      'INSERT INTO careers (title, department, location, type, description, requirements, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, department || '', location || '', type || '', description || '', requirements || '', is_active === undefined ? true : is_active]
    );
    res.status(201).json({ success: true });
  });
});

router.put('/admin/careers/:id', authenticateToken, async (req, res) => {
  const { title, department, location, type, description, requirements, is_active } = req.body;
  await withDb(req, res, async (db) => {
    await db.execute(
      'UPDATE careers SET title = ?, department = ?, location = ?, type = ?, description = ?, requirements = ?, is_active = ? WHERE id = ?',
      [title, department || '', location || '', type || '', description || '', requirements || '', is_active === undefined ? true : is_active, req.params.id]
    );
    res.json({ success: true });
  });
});

router.get('/admin/collections', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [rows]: any = await db.execute(
      'SELECT * FROM content_collections ORDER BY created_at ASC, id ASC'
    );
    res.json(rows);
  });
});

router.post('/admin/collections', authenticateToken, async (req, res) => {
  const {
    name,
    slug,
    section_title,
    section_description,
    item_label_singular,
    item_label_plural,
    is_enabled,
  } = req.body;

  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    await db.execute(
      `INSERT INTO content_collections
      (name, slug, section_title, section_description, item_label_singular, item_label_plural, is_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        section_title || '',
        section_description || '',
        item_label_singular || '',
        item_label_plural || '',
        is_enabled === undefined ? true : Boolean(is_enabled),
      ]
    );
    res.status(201).json({ success: true });
  });
});

router.put('/admin/collections/:id', authenticateToken, async (req, res) => {
  const {
    name,
    slug,
    section_title,
    section_description,
    item_label_singular,
    item_label_plural,
    is_enabled,
  } = req.body;

  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    await db.execute(
      `UPDATE content_collections
      SET name = ?, slug = ?, section_title = ?, section_description = ?, item_label_singular = ?, item_label_plural = ?, is_enabled = ?
      WHERE id = ?`,
      [
        name,
        slug,
        section_title || '',
        section_description || '',
        item_label_singular || '',
        item_label_plural || '',
        is_enabled === undefined ? true : Boolean(is_enabled),
        req.params.id,
      ]
    );
    res.json({ success: true });
  });
});

router.delete('/admin/collections/:id', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [rows]: any = await db.execute('SELECT slug FROM content_collections WHERE id = ?', [req.params.id]);
    const slug = rows[0]?.slug;
    if (slug) {
      await db.execute('DELETE FROM homepage_sections WHERE `type` = ?', [`collection:${slug}`]);
    }
    await db.execute('DELETE FROM content_collections WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });
});

router.get('/admin/collections/:slug/items', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [collections]: any = await db.execute('SELECT * FROM content_collections WHERE slug = ?', [req.params.slug]);
    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const [items]: any = await db.execute(
      'SELECT * FROM content_collection_items WHERE collection_id = ? ORDER BY display_order ASC, id ASC',
      [collections[0].id]
    );
    res.json({ collection: collections[0], items });
  });
});

router.post('/admin/collections/:slug/items', authenticateToken, async (req, res) => {
  const { title, subtitle, description, image, link_url, is_enabled, display_order } = req.body;
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    const [collections]: any = await db.execute('SELECT id FROM content_collections WHERE slug = ?', [req.params.slug]);
    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    await db.execute(
      `INSERT INTO content_collection_items
      (collection_id, title, subtitle, description, image, link_url, is_enabled, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collections[0].id,
        title,
        subtitle || '',
        description || '',
        image || '',
        link_url || '',
        is_enabled === undefined ? true : Boolean(is_enabled),
        Number(display_order) || 0,
      ]
    );
    res.status(201).json({ success: true });
  });
});

router.put('/admin/collections/:slug/items/:id', authenticateToken, async (req, res) => {
  const { title, subtitle, description, image, link_url, is_enabled, display_order } = req.body;
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    await db.execute(
      `UPDATE content_collection_items
      SET title = ?, subtitle = ?, description = ?, image = ?, link_url = ?, is_enabled = ?, display_order = ?
      WHERE id = ?`,
      [
        title,
        subtitle || '',
        description || '',
        image || '',
        link_url || '',
        is_enabled === undefined ? true : Boolean(is_enabled),
        Number(display_order) || 0,
        req.params.id,
      ]
    );
    res.json({ success: true });
  });
});

router.delete('/admin/collections/:slug/items/:id', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    await ensureCollectionsTables(db);
    await db.execute('DELETE FROM content_collection_items WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });
});

// --- CMS ADMIN ROUTES ---

// Get all settings (admin)
router.get('/admin/settings', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows] = await db.execute('SELECT * FROM site_settings');
    res.json(rows);
  });
});

// Update settings
router.post('/admin/settings', authenticateToken, async (req, res) => {
  const settings = req.body; // Array of { key, value }
  await withDb(req, res, async (db) => {
    for (const item of settings) {
      await db.execute(
        'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [item.key, item.value, item.value]
      );
    }
    res.json({ success: true });
  });
});

// Get all homepage sections (admin)
router.get('/admin/homepage-sections', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows]: any = await db.execute('SELECT * FROM homepage_sections ORDER BY display_order ASC, id ASC');
    res.json(sanitizeHomepageSections(rows));
  });
});

// Update homepage sections
router.post('/admin/homepage-sections', authenticateToken, async (req, res) => {
  const sections = sanitizeHomepageSections(Array.isArray(req.body) ? req.body : []);
  await withDb(req, res, async (db) => {
    const keptIds: number[] = [];

    for (const section of sections) {
      if (section.id) {
        await db.execute(
          'UPDATE homepage_sections SET title = ?, `type` = ?, is_enabled = ?, display_order = ? WHERE id = ?',
          [section.title, section.type, section.is_enabled, section.display_order, section.id]
        );
        keptIds.push(section.id);
      } else {
        const [result]: any = await db.execute(
          'INSERT INTO homepage_sections (title, `type`, is_enabled, display_order) VALUES (?, ?, ?, ?)',
          [section.title, section.type, section.is_enabled, section.display_order]
        );
        keptIds.push(result.insertId);
      }
    }

    await deleteMissingRows(db, 'homepage_sections', keptIds);
    res.json({ success: true });
  });
});

// Get all navigation items (admin)
router.get('/admin/navigation', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    const [rows]: any = await db.execute('SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC');
    res.json(sanitizeNavigationItems(rows));
  });
});

router.get('/admin/link-options', authenticateToken, async (req, res) => {
  await withDb(req, res, async (db) => {
    res.json(await getAdminLinkOptions(db));
  });
});

// Update navigation items
router.post('/admin/navigation', authenticateToken, async (req, res) => {
  const items = sanitizeNavigationItems(Array.isArray(req.body) ? req.body : []);
  await withDb(req, res, async (db) => {
    const keptIds: number[] = [];

    for (const item of items) {
      if (item.id) {
        await db.execute(
          'UPDATE navigation_items SET label = ?, url = ?, is_enabled = ?, display_order = ? WHERE id = ?',
          [item.label, item.url, item.is_enabled, item.display_order, item.id]
        );
        keptIds.push(item.id);
      } else {
        const [result]: any = await db.execute(
          'INSERT INTO navigation_items (label, url, is_enabled, display_order) VALUES (?, ?, ?, ?)',
          [item.label, item.url, item.is_enabled, item.display_order]
        );
        keptIds.push(result.insertId);
      }
    }

    await deleteMissingRows(db, 'navigation_items', keptIds);
    res.json({ success: true });
  });
});

export default router;
