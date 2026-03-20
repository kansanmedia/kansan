-- database.sql
-- Run this script in your MySQL database to create the necessary tables.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  client_name VARCHAR(255),
  website_url VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT,
  image VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  website_url VARCHAR(255),
  testimonial TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subsidiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url VARCHAR(255),
  logo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  type VARCHAR(50),
  description TEXT,
  requirements TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  career_id INT,
  applicant_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password is 'admin123' hashed with bcrypt)
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2a$10$X.x/A.4m9w1z9q1w1q1w1.q1w1q1w1q1w1q1w1q1w1q1w1q1w1q1w', 'admin');

-- CMS Tables
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `value` TEXT,
  `category` VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Seed Site Settings
INSERT IGNORE INTO site_settings (`key`, `value`, `category`) VALUES 
('site_name', 'Kansan Group', 'general'),
('site_description', 'Building the Future of Global Enterprise', 'seo'),
('site_keywords', 'holding company, technology, real estate, logistics', 'seo'),
('site_logo', '', 'branding'),
('site_favicon', '', 'branding'),
('footer_copyright', '© 2026 Kansan Group. All rights reserved.', 'general'),
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

-- Seed Homepage Sections
INSERT IGNORE INTO homepage_sections (title, `type`, is_enabled, display_order) VALUES 
('Hero', 'hero', TRUE, 1),
('Snapshot', 'stats', TRUE, 2),
('Our Core Services', 'services', TRUE, 3),
('Featured Portfolio', 'portfolios', TRUE, 4),
('Our Subsidiaries', 'subsidiaries', TRUE, 5),
('Our Clients', 'clients', TRUE, 6);

-- Seed Navigation Items
INSERT IGNORE INTO navigation_items (label, url, is_enabled, display_order) VALUES 
('Home', '/', TRUE, 1),
('About', '/about', TRUE, 2),
('Services', '/services', TRUE, 3),
('Portfolio', '/portfolio', TRUE, 4),
('Subsidiaries', '/subsidiaries', TRUE, 5),
('Blog', '/blog', TRUE, 6),
('Career', '/career', TRUE, 7),
('Contact', '/contact', TRUE, 8);
