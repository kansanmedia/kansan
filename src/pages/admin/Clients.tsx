import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { adminJson } from '../../lib/api';
import type { Client } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', logo: '', website_url: '' });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', logo: '', website_url: '' });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await adminJson<Client[]>('/api/admin/clients', {}, 'Failed to fetch clients');
      setClients(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch clients';
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
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/clients/${editingId}` : '/api/admin/clients', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      }, editingId ? 'Failed to update client' : 'Failed to create client');
      resetForm();
      await fetchClients();
      showSuccess(editingId ? 'Client updated successfully' : 'Client created successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to save client';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setIsAdding(true);
    setFormData({
      name: client.name,
      logo: client.logo || '',
      website_url: client.website_url || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete client');
      await fetchClients();
      showSuccess('Client deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete client';
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Clients</h2>
        <button
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Client'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
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
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              {editingId ? 'Update Client' : 'Save Client'}
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
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{client.name}</td>
                <td className="p-4 text-blue-600 hover:underline">
                  {client.website_url && <a href={client.website_url} target="_blank" rel="noreferrer">{client.website_url}</a>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(client)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
