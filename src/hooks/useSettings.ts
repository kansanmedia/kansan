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

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<SiteSettings>('/api/settings', {}, 'Failed to fetch settings')
      .then(data => {
        setSettings(data);
        setLoading(false);
        
        // Update document metadata
        if (data.site_title) {
          document.title = data.site_title;
        }
        
        const description = data.site_description;
        if (description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', description);
        }

        const keywords = data.site_keywords;
        if (keywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.setAttribute('content', keywords);
        }

        if (data.site_favicon) {
          let favicon = document.querySelector('link[rel="icon"]');
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.setAttribute('rel', 'icon');
            document.head.appendChild(favicon);
          }
          favicon.setAttribute('href', data.site_favicon);
        }
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
