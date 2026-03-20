export interface AdminUser {
  id?: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  created_at?: string;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  description: string;
  client_name?: string;
  image?: string;
  website_url?: string;
  created_at?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  nav_label?: string;
  footer_label?: string;
  show_in_nav: boolean;
  show_in_footer: boolean;
  is_published: boolean;
  display_order: number;
  created_at?: string;
}

export interface Client {
  id: number;
  name: string;
  logo?: string;
  website_url?: string;
  testimonial?: string;
  created_at?: string;
}

export interface Subsidiary {
  id: number;
  name: string;
  description: string;
  website_url?: string;
  logo?: string;
  created_at?: string;
}

export interface Career {
  id: number;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ContactLead {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message?: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  career_id?: number | null;
  applicant_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  created_at: string;
}

export interface DashboardStats {
  services: number;
  portfolios: number;
  blogs: number;
  unreadContacts: number;
}

export interface OgData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  category?: string;
}

export interface HomepageSection {
  id?: number;
  title: string;
  type: string;
  is_enabled: boolean;
  display_order: number;
}

export interface NavigationItem {
  id?: number;
  label: string;
  url: string;
  is_enabled: boolean;
  display_order: number;
}

export interface LinkOption {
  label: string;
  url: string;
}

export interface ContentCollection {
  id: number;
  name: string;
  slug: string;
  section_title?: string;
  section_description?: string;
  item_label_singular?: string;
  item_label_plural?: string;
  is_enabled: boolean;
  created_at?: string;
}

export interface ContentCollectionItem {
  id: number;
  collection_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link_url?: string;
  is_enabled: boolean;
  display_order: number;
  created_at?: string;
}

export interface HomepageCollectionPayload {
  collection: ContentCollection;
  items: ContentCollectionItem[];
}
