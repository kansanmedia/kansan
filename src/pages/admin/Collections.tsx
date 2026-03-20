import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { adminJson } from '../../lib/api';
import type { ContentCollection } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

const defaultFormData = {
  name: '',
  slug: '',
  section_title: '',
  section_description: '',
  item_label_singular: '',
  item_label_plural: '',
  is_enabled: true,
};

export function AdminCollections() {
  const [collections, setCollections] = useState<ContentCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await adminJson<ContentCollection[]>('/api/admin/collections', {}, 'Failed to fetch collections');
      setCollections(data);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to fetch collections';
      setError(text);
      showError(text);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/collections/${editingId}` : '/api/admin/collections', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }, editingId ? 'Failed to update collection' : 'Failed to create collection');
      resetForm();
      await fetchCollections();
      showSuccess(editingId ? 'Collection updated successfully' : 'Collection created successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to save collection';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (collection: ContentCollection) => {
    setEditingId(collection.id);
    setIsAdding(true);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      section_title: collection.section_title || '',
      section_description: collection.section_description || '',
      item_label_singular: collection.item_label_singular || '',
      item_label_plural: collection.item_label_plural || '',
      is_enabled: collection.is_enabled,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collection and its items?')) {
      return;
    }
    try {
      await adminJson<{ success: boolean }>(`/api/admin/collections/${id}`, { method: 'DELETE' }, 'Failed to delete collection');
      await fetchCollections();
      showSuccess('Collection deleted successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to delete collection';
      setError(text);
      showError(text);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <AdminActionToast type={message.type} text={message.text} />
      {error && <div className="mx-6 mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Manage Collections</h2>
          <p className="mt-1 text-sm text-gray-500">Create reusable feature sections like founders, leadership, testimonials, advisors.</p>
        </div>
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Collection'}
        </button>
      </div>

      {isAdding && (
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Collection Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: prev.slug || e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                }))}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-') }))}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Homepage Section Title</label>
              <input
                type="text"
                value={formData.section_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, section_title: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Single Item Label</label>
              <input
                type="text"
                value={formData.item_label_singular}
                onChange={(e) => setFormData((prev) => ({ ...prev, item_label_singular: e.target.value }))}
                placeholder="Founder"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Plural Item Label</label>
              <input
                type="text"
                value={formData.item_label_plural}
                onChange={(e) => setFormData((prev) => ({ ...prev, item_label_plural: e.target.value }))}
                placeholder="Founders"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Homepage Section Description</label>
              <textarea
                rows={3}
                value={formData.section_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, section_description: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.is_enabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_enabled: e.target.checked }))}
              />
              Enabled
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-md bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700">
                {editingId ? 'Update Collection' : 'Save Collection'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase tracking-wider text-gray-500">
              <th className="p-4 font-medium">Collection</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {collections.map((collection) => (
              <tr key={collection.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{collection.name}</div>
                  <div className="text-sm text-gray-500">{collection.item_label_plural || collection.name}</div>
                </td>
                <td className="p-4 text-gray-500">{collection.slug}</td>
                <td className="p-4 text-sm text-gray-500">{collection.is_enabled ? 'Enabled' : 'Disabled'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(collection)} className="p-2 text-blue-500 hover:text-blue-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(collection.id)} className="p-2 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No collections created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
