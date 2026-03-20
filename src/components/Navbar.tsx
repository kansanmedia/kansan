import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { fetchJson } from '../lib/api';
import type { NavigationItem } from '../types/admin';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);

  const getSettingValue = (key: string, fallback: string) => {
    if (!settings || !Object.prototype.hasOwnProperty.call(settings, key)) {
      return fallback;
    }

    return settings[key];
  };

  useEffect(() => {
    // Fetch dynamic navigation
    fetchJson<NavigationItem[]>('/api/navigation', {}, 'Failed to fetch navigation')
      .then(data => {
        if (data && data.length > 0) {
          setNavItems(data);
        } else {
          // Fallback to defaults
          setNavItems([
            { label: 'Home', url: '/', is_enabled: true, display_order: 1 },
            { label: 'About', url: '/about', is_enabled: true, display_order: 2 },
            { label: 'Services', url: '/services', is_enabled: true, display_order: 3 },
            { label: 'Portfolio', url: '/portfolio', is_enabled: true, display_order: 4 },
            { label: 'Clients', url: '/clients', is_enabled: true, display_order: 5 },
            { label: 'Subsidiaries', url: '/subsidiaries', is_enabled: true, display_order: 6 },
            { label: 'Blog', url: '/blog', is_enabled: true, display_order: 7 },
            { label: 'Career', url: '/career', is_enabled: true, display_order: 8 },
            { label: 'Contact', url: '/contact', is_enabled: true, display_order: 9 }
          ]);
        }
      })
      .catch(() => {
        // Fallback on error
        setNavItems([
          { label: 'Home', url: '/', is_enabled: true, display_order: 1 },
          { label: 'About', url: '/about', is_enabled: true, display_order: 2 },
          { label: 'Services', url: '/services', is_enabled: true, display_order: 3 },
          { label: 'Portfolio', url: '/portfolio', is_enabled: true, display_order: 4 },
          { label: 'Contact', url: '/contact', is_enabled: true, display_order: 5 }
        ]);
      });
  }, []);

  return (
    <nav className="premium-panel sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {settings?.site_logo ? (
                <img src={settings.site_logo} alt={getSettingValue('site_title', 'Kansan Group')} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <span className="text-shine text-xl font-bold tracking-tight">
                    {getSettingValue('site_title', 'Kansan Group')}
                  </span>
                </>
              )}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.url}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-all hover:text-blue-300 hover:bg-white/5",
                  location.pathname === item.url ? "bg-white/8 text-blue-300 ring-1 ring-white/10" : "text-gray-300"
                )}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/admin"
                className="rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-300 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_24px_rgba(96,165,250,0.35)] transition-transform hover:scale-[1.02]"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/90 py-4 px-6 space-y-3 backdrop-blur-xl">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.url}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block rounded-xl px-3 py-2 text-base font-medium",
                location.pathname === item.url
                  ? "bg-white/8 text-blue-300"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-blue-600 font-bold text-sm pt-2"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
