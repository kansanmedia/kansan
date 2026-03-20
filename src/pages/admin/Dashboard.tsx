import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Briefcase, FileText, ImageIcon, Mail } from 'lucide-react';
import { adminJson } from '../../lib/api';
import type { DashboardStats } from '../../types/admin';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    portfolios: 0,
    blogs: 0,
    unreadContacts: 0
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    adminJson<DashboardStats>('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }, 'Failed to fetch stats')
      .then(setStats)
      .catch(error => setError(error instanceof Error ? error.message : 'Failed to fetch stats'));
  }, [token]);

  const statCards = [
    { name: 'Total Services', value: stats.services, icon: Briefcase, color: 'bg-blue-500' },
    { name: 'Portfolio Items', value: stats.portfolios, icon: ImageIcon, color: 'bg-purple-500' },
    { name: 'Published Blogs', value: stats.blogs, icon: FileText, color: 'bg-green-500' },
    { name: 'Total Contacts', value: stats.unreadContacts, icon: Mail, color: 'bg-red-500' },
  ];

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error === 'Database not configured' 
            ? 'Database is not configured. Please set valid MySQL credentials in your environment settings.'
            : error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Add New Blog Post
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Add Portfolio Item
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            View Job Applications
          </button>
        </div>
      </div>
    </div>
  );
}
