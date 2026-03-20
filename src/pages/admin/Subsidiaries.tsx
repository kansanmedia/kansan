import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { adminJson } from '../../lib/api';
import type { Subsidiary } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

export function AdminSubsidiaries() {
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', website_url: '', logo: '' });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', website_url: '', logo: '' });
  };

  useEffect(() => {
    fetchSubsidiaries();
  }, []);

  const fetchSubsidiaries = async () => {
    try {
      const data = await adminJson<Subsidiary[]>('/api/admin/subsidiaries', {}, 'Failed to fetch subsidiaries');
      setSubsidiaries(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch subsidiaries';
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
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/subsidiaries/${editingId}` : '/api/admin/subsidiaries', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      }, editingId ? 'Failed to update subsidiary' : 'Failed to create subsidiary');
      resetForm();
      await fetchSubsidiaries();
      showSuccess(editingId ? 'Subsidiary updated successfully' : 'Subsidiary created successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to save subsidiary';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setEditingId(subsidiary.id);
    setIsAdding(true);
    setFormData({
      name: subsidiary.name,
      description: subsidiary.description,
      website_url: subsidiary.website_url || '',
      logo: subsidiary.logo || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subsidiary?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/subsidiaries/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete subsidiary');
      await fetchSubsidiaries();
      showSuccess('Subsidiary deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete subsidiary';
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Subsidiaries</h2>
        <button
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Subsidiary'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              {editingId ? 'Update Subsidiary' : 'Save Subsidiary'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Website</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subsidiaries.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{sub.name}</td>
                <td className="p-4 text-blue-600 hover:underline">
                  {sub.website_url && <a href={sub.website_url} target="_blank" rel="noreferrer">{sub.website_url}</a>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(sub)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {subsidiaries.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No subsidiaries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
