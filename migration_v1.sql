CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT,
  `category` VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  target VARCHAR(20) DEFAULT '_self',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

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
);

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
);

-- Seed initial data
INSERT IGNORE INTO site_settings (`key`, `value`, `category`) VALUES 
('site_title', 'Kansan Group', 'seo'),
('site_description', 'Building the future of infrastructure and technology.', 'seo'),
('site_keywords', 'Kansan, Infrastructure, Technology, Group', 'seo'),
('site_logo', '/logo.png', 'branding'),
('site_favicon', '/favicon.ico', 'branding'),
('footer_copyright', '© 2024 Kansan Group. All rights reserved.', 'general'),
('footer_description', 'Empowering businesses through innovative solutions and strategic investments across multiple sectors.', 'general'),
('footer_quick_links', '["/about","/services","/portfolio","/contact"]', 'general'),
('footer_quick_links_title', 'Quick Links', 'general'),
('footer_subsidiaries_title', 'Subsidiaries', 'general'),
('footer_contact_title', 'Contact Us', 'general'),
('footer_address', '123 Corporate Blvd, Suite 500\nBusiness District, NY 10001', 'general'),
('footer_phone', '+1 (555) 123-4567', 'general'),
('footer_email', 'info@kansangroup.com', 'general'),
('footer_admin_label', 'Admin Portal', 'general'),
('hero_title', 'Building the Future of Global Enterprise', 'homepage'),
('hero_description', 'Kansan Group is a diversified holding company driving innovation and sustainable growth across technology, real estate, and logistics sectors.', 'homepage'),
('hero_image', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', 'homepage'),
('hero_primary_label', 'Explore Services', 'homepage'),
('hero_primary_link', '/services', 'homepage'),
('hero_secondary_label', 'Contact Us', 'homepage'),
('hero_secondary_link', '/contact', 'homepage'),
('stats_subsidiaries_label', 'Subsidiaries', 'homepage'),
('stats_clients_label', 'Clients', 'homepage'),
('stats_employees_label', 'Employees', 'homepage'),
('stats_employees_value', '5000+', 'homepage'),
('stats_experience_label', 'Years Experience', 'homepage'),
('stats_experience_value', '30+', 'homepage');

INSERT IGNORE INTO homepage_sections (title, `type`, is_enabled, display_order) VALUES 
('Hero', 'hero', 1, 1),
('Stats', 'stats', 1, 2),
('Our Core Services', 'services', 1, 3),
('Featured Portfolio', 'portfolios', 1, 4),
('Our Subsidiaries', 'subsidiaries', 1, 5),
('Our Clients', 'clients', 1, 6);

INSERT IGNORE INTO navigation_items (label, url, is_enabled, display_order) VALUES 
('Home', '/', 1, 1),
('About', '/about', 1, 2),
('Services', '/services', 1, 3),
('Portfolio', '/portfolio', 1, 4),
('Clients', '/clients', 1, 5),
('Subsidiaries', '/subsidiaries', 1, 6),
('Blog', '/blog', 1, 7),
('Career', '/career', 1, 8),
('Contact', '/contact', 1, 9);
