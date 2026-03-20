import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { ImageUpload } from '../../components/ImageUpload';
import { adminJson } from '../../lib/api';
import type { Portfolio } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

export function AdminPortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', client_name: '', image: '', website_url: '' });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', slug: '', description: '', client_name: '', image: '', website_url: '' });
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const data = await adminJson<Portfolio[]>('/api/admin/portfolios', {}, 'Failed to fetch portfolios');
      setPortfolios(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch portfolios';
      setError(text);
      showError(text);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/portfolios/${editingId}` : '/api/admin/portfolios', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      }, editingId ? 'Failed to update portfolio' : 'Failed to create portfolio');
      resetForm();
      await fetchPortfolios();
      showSuccess(editingId ? 'Portfolio updated successfully' : 'Portfolio created successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to save portfolio';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingId(portfolio.id);
    setIsAdding(true);
    setFormData({
      title: portfolio.title,
      slug: portfolio.slug,
      description: portfolio.description,
      client_name: portfolio.client_name || '',
      image: portfolio.image || '',
      website_url: portfolio.website_url || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/portfolios/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete portfolio');
      await fetchPortfolios();
      showSuccess('Portfolio deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete portfolio';
      setError(text);
      showError(text);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <AdminActionToast type={message.type} text={message.text} />
      {error && <div className="mx-6 mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Manage Portfolios</h2>
        <button
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Portfolio'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL (Optional)</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <ImageUpload 
              value={formData.image} 
              onChange={(url) => setFormData({ ...formData, image: url })} 
              label="Portfolio Image"
              uploadName={formData.title || 'portfolio-image'}
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              {editingId ? 'Update Portfolio' : 'Save Portfolio'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {portfolios.map((portfolio) => (
              <tr key={portfolio.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{portfolio.title}</td>
                <td className="p-4 text-gray-500">{portfolio.client_name}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(portfolio)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(portfolio.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {portfolios.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No portfolios found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
