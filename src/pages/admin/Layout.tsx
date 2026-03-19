import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  FileText, 
  Users, 
  Building, 
  GraduationCap, 
  Mail,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function AdminLayout() {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Portfolio', path: '/admin/portfolio', icon: ImageIcon },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Subsidiaries', path: '/admin/subsidiaries', icon: Building },
    { name: 'Careers', path: '/admin/careers', icon: GraduationCap },
    { name: 'Contacts', path: '/admin/contacts', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">Kansan Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.username}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
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
              {navItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
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
