import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { fetchJson } from '../lib/api';
import type { NavigationItem, Subsidiary } from '../types/admin';

export function Footer() {
  const { settings } = useSettings();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);

  const hasSettingValue = (key: string) => Boolean(settings && Object.prototype.hasOwnProperty.call(settings, key));
  const getSettingValue = (key: string, fallback: string) => {
    if (!hasSettingValue(key)) {
      return fallback;
    }

    return settings![key];
  };

  useEffect(() => {
    fetchJson<NavigationItem[]>('/api/footer-links', {}, 'Failed to fetch footer links')
      .then((data) => setNavItems(data))
      .catch(() => {
        setNavItems([
          { label: 'About', url: '/about', is_enabled: true, display_order: 1 },
          { label: 'Services', url: '/services', is_enabled: true, display_order: 2 },
          { label: 'Portfolio', url: '/portfolio', is_enabled: true, display_order: 3 },
          { label: 'Contact', url: '/contact', is_enabled: true, display_order: 4 },
        ]);
      });

    fetchJson<Subsidiary[]>('/api/subsidiaries', {}, 'Failed to fetch subsidiaries')
      .then((data) => setSubsidiaries(data.slice(0, 3)))
      .catch(() => setSubsidiaries([]));
  }, []);

  const footerDescription = getSettingValue(
    'footer_description',
    'Empowering businesses through innovative solutions and strategic investments across multiple sectors.'
  );
  const defaultQuickLinkUrls = ['/about', '/services', '/portfolio', '/contact'];
  const configuredQuickLinkUrls = (() => {
    if (!hasSettingValue('footer_quick_links')) {
      return defaultQuickLinkUrls;
    }

    try {
      const parsed = JSON.parse(settings?.footer_quick_links ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  })();
  const footerQuickLinks = (() => {
    const sourceItems =
      navItems.length > 0
        ? navItems
        : [
            { label: 'About', url: '/about', is_enabled: true, display_order: 1 },
            { label: 'Services', url: '/services', is_enabled: true, display_order: 2 },
            { label: 'Portfolio', url: '/portfolio', is_enabled: true, display_order: 3 },
            { label: 'Contact', url: '/contact', is_enabled: true, display_order: 4 },
          ];
    const resolved = configuredQuickLinkUrls
      .map((url) => sourceItems.find((item) => item.url === url))
      .filter((item): item is NavigationItem => Boolean(item));

    return resolved;
  })();
  const quickLinksTitle = getSettingValue('footer_quick_links_title', 'Quick Links');
  const subsidiariesTitle = getSettingValue('footer_subsidiaries_title', 'Subsidiaries');
  const contactTitle = getSettingValue('footer_contact_title', 'Contact Us');
  const footerAddress = getSettingValue('footer_address', '123 Corporate Blvd, Suite 500\nBusiness District, NY 10001');
  const footerPhone = getSettingValue('footer_phone', '+1 (555) 123-4567');
  const footerEmail = getSettingValue('footer_email', 'info@kansangroup.com');
  const footerAdminLabel = getSettingValue('footer_admin_label', 'Admin Portal');
  const phoneHref = `tel:${footerPhone.replace(/[^\d+]/g, '')}`;
  const emailHref = `mailto:${footerEmail}`;
  
  return (
    <footer className="premium-divider relative pt-16 pb-10 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="max-w-[80%] mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-10 md:grid-cols-4 mb-8">
          <div className="md:pr-4">
            <div className="flex items-center gap-2 mb-4">
              {settings?.site_logo ? (
                <img src={settings.site_logo} alt={getSettingValue('site_title', 'Kansan Group')} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Building2 className="h-8 w-8 text-blue-400" />
                  <span className="text-shine font-bold text-xl">{getSettingValue('site_title', 'Kansan Group')}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-7">
              {footerDescription}
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 border-b border-white/10 pb-3 font-semibold text-lg text-slate-100">{quickLinksTitle}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerQuickLinks.length > 0 ? (
                footerQuickLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.url} className="inline-flex items-center gap-2 transition-colors hover:text-blue-300">
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No quick links configured.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 border-b border-white/10 pb-3 font-semibold text-lg text-slate-100">{subsidiariesTitle}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {subsidiaries.length > 0 ? subsidiaries.map((item) => (
                <li key={item.id}>
                  {item.website_url ? (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 transition-colors hover:text-blue-300"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link to="/subsidiaries" className="inline-flex items-center gap-2 transition-colors hover:text-blue-300">
                      {item.name}
                    </Link>
                  )}
                </li>
              )) : (
                <li><Link to="/subsidiaries" className="inline-flex items-center gap-2 transition-colors hover:text-blue-300">View Subsidiaries</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 border-b border-white/10 pb-3 font-semibold text-lg text-slate-100">{contactTitle}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="whitespace-pre-line">{footerAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 shrink-0" />
                <a href={phoneHref} className="transition-colors hover:text-blue-300">
                  {footerPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400 shrink-0" />
                <a href={emailHref} className="transition-colors hover:text-blue-300">
                  {footerEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-2 md:flex-row">
          <p className="text-sm text-gray-400">
            {getSettingValue('footer_copyright', `© ${new Date().getFullYear()} Kansan Group. All rights reserved.`)}
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link to="/admin/login" className="transition-colors hover:text-blue-300">{footerAdminLabel}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
