import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminActionToast } from '../../components/AdminActionToast';
import { adminJson } from '../../lib/api';
import type { Career } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

export function AdminCareers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', department: '', location: '', type: '', description: '', requirements: '', is_active: true });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', department: '', location: '', type: '', description: '', requirements: '', is_active: true });
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const data = await adminJson<Career[]>('/api/admin/careers', {}, 'Failed to fetch careers');
      setCareers(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch careers';
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
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/careers/${editingId}` : '/api/admin/careers', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      }, editingId ? 'Failed to update career' : 'Failed to create career');
      resetForm();
      await fetchCareers();
      showSuccess(editingId ? 'Career updated successfully' : 'Career created successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to save career';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (career: Career) => {
    setEditingId(career.id);
    setIsAdding(true);
    setFormData({
      title: career.title,
      department: career.department || '',
      location: career.location || '',
      type: career.type || '',
      description: career.description || '',
      requirements: career.requirements || '',
      is_active: career.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/careers/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete career');
      await fetchCareers();
      showSuccess('Career deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete career';
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Careers</h2>
        <div className="flex gap-3">
          <Link
            to="/admin/applications"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Users className="h-4 w-4" /> View Applications
          </Link>
          <button
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Career'}
          </button>
        </div>
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
              {editingId ? 'Update Career' : 'Save Career'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {careers.map((career) => (
              <tr key={career.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{career.title}</td>
                <td className="p-4 text-gray-500">{career.department}</td>
                <td className="p-4 text-gray-500">{career.location}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(career)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(career.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {careers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No careers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
