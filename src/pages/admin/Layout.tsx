import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  FileText, 
  File,
  Layers3,
  Users, 
  Building, 
  GraduationCap, 
  Mail,
  FileUser,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { adminJson } from '../../lib/api';
import type { ContentCollection, HomepageSection } from '../../types/admin';

export function AdminLayout() {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [collections, setCollections] = useState<ContentCollection[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    Promise.all([
      adminJson<HomepageSection[]>('/api/admin/homepage-sections', {}, 'Failed to fetch homepage sections'),
      adminJson<ContentCollection[]>('/api/admin/collections', {}, 'Failed to fetch collections'),
    ])
      .then(([sectionData, collectionData]) => {
        setSections(sectionData);
        setCollections(collectionData.filter((item) => item.is_enabled));
      })
      .catch(() => {
        setSections([]);
        setCollections([]);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sectionTypes = new Set(sections.map((section) => section.type));

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Services', path: '/admin/services', icon: Briefcase, visible: sectionTypes.has('services') },
    { name: 'Portfolio', path: '/admin/portfolio', icon: ImageIcon, visible: sectionTypes.has('portfolios') },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Pages', path: '/admin/pages', icon: File },
    { name: 'Collections', path: '/admin/collections', icon: Layers3 },
    { name: 'Clients', path: '/admin/clients', icon: Users, visible: sectionTypes.has('clients') },
    { name: 'Subsidiaries', path: '/admin/subsidiaries', icon: Building, visible: sectionTypes.has('subsidiaries') },
    { name: 'Careers', path: '/admin/careers', icon: GraduationCap },
    { name: 'Applications', path: '/admin/applications', icon: FileUser },
    { name: 'Contacts', path: '/admin/contacts', icon: Mail },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ].filter((item) => item.visible !== false);

  const dynamicCollectionItems = collections.map((collection) => ({
    name: collection.name,
    path: `/admin/collections/${collection.slug}`,
    icon: Layers3,
  }));

  const allNavItems = [...navItems, ...dynamicCollectionItems];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">Kansan Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.username}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {allNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {allNavItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
            </h1>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
