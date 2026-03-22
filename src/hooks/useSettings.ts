import { useState, useEffect } from 'react';
import { fetchJson } from '../lib/api';

export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_logo: string;
  site_favicon: string;
  footer_copyright: string;
  hero_title: string;
  hero_description: string;
  hero_image: string;
  hero_primary_label: string;
  hero_primary_link: string;
  hero_secondary_label: string;
  hero_secondary_link: string;
  footer_description: string;
  footer_quick_links: string;
  footer_quick_links_title: string;
  footer_subsidiaries_title: string;
  footer_contact_title: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
  footer_admin_label: string;
  stats_subsidiaries_label: string;
  stats_clients_label: string;
  stats_employees_label: string;
  stats_employees_value: string;
  stats_experience_label: string;
  stats_experience_value: string;
  [key: string]: string;
}

let settingsCache: SiteSettings | null = null;
let settingsPromise: Promise<SiteSettings> | null = null;

const setMetaContent = (name: string, content?: string) => {
  let metaTag = document.querySelector(`meta[name="${name}"]`);

  if (!content) {
    metaTag?.remove();
    return;
  }

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', name);
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', content);
};

const setFavicon = (href?: string) => {
  const rels = ['icon', 'shortcut icon'];

  if (!href) {
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((node) => node.remove());
    return;
  }

  rels.forEach((rel) => {
    let favicon = document.querySelector(`link[rel="${rel}"]`);
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', rel);
      document.head.appendChild(favicon);
    }

    favicon.setAttribute('href', href);
    if (href.endsWith('.ico')) {
      favicon.setAttribute('type', 'image/x-icon');
    } else {
      favicon.removeAttribute('type');
    }
  });
};

const applyDocumentSettings = (data: SiteSettings) => {
  document.title = data.site_title || 'Kansan Group';
  setMetaContent('description', data.site_description);
  setMetaContent('keywords', data.site_keywords);
  setFavicon(data.site_favicon);
};

const loadSettings = () => {
  if (settingsCache) {
    return Promise.resolve(settingsCache);
  }

  if (!settingsPromise) {
    settingsPromise = fetchJson<SiteSettings>('/api/settings', {}, 'Failed to fetch settings').then((data) => {
      settingsCache = data;
      return data;
    });
  }

  return settingsPromise;
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(settingsCache);
  const [loading, setLoading] = useState(!settingsCache);

  useEffect(() => {
    loadSettings()
      .then(data => {
        setSettings(data);
        applyDocumentSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
