import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { AdminActionToast } from '../../components/AdminActionToast';
import { ImageUpload } from '../../components/ImageUpload';
import { adminJson } from '../../lib/api';
import type { ContentCollection, ContentCollectionItem } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

const defaultFormData = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  link_url: '',
  is_enabled: true,
  display_order: 0,
};

export function AdminCollectionItems() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<ContentCollection | null>(null);
  const [items, setItems] = useState<ContentCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (slug) {
      fetchItems();
    }
  }, [slug]);

  const fetchItems = async () => {
    try {
      const data = await adminJson<{ collection: ContentCollection; items: ContentCollectionItem[] }>(
        `/api/admin/collections/${slug}/items`,
        {},
        'Failed to fetch collection items'
      );
      setCollection(data.collection);
      setItems(data.items);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to fetch items';
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
      await adminJson<{ success: boolean }>(
        editingId ? `/api/admin/collections/${slug}/items/${editingId}` : `/api/admin/collections/${slug}/items`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
        editingId ? 'Failed to update item' : 'Failed to create item'
      );
      resetForm();
      await fetchItems();
      showSuccess(editingId ? 'Item updated successfully' : 'Item created successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to save item';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (item: ContentCollectionItem) => {
    setEditingId(item.id);
    setIsAdding(true);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      image: item.image || '',
      link_url: item.link_url || '',
      is_enabled: item.is_enabled,
      display_order: item.display_order || 0,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await adminJson<{ success: boolean }>(`/api/admin/collections/${slug}/items/${id}`, { method: 'DELETE' }, 'Failed to delete item');
      await fetchItems();
      showSuccess('Item deleted successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to delete item';
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
          <h2 className="text-xl font-semibold text-gray-800">{collection?.name || 'Collection'} Items</h2>
          <p className="mt-1 text-sm text-gray-500">Add and manage {collection?.item_label_plural || collection?.name || 'collection'} entries.</p>
        </div>
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : `Add ${collection?.item_label_singular || 'Item'}`}
        </button>
      </div>

      {isAdding && (
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name / Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle / Role</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Profile / Link URL</label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.display_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_enabled: e.target.checked }))}
                />
                Enabled
              </label>
            </div>

            <aside className="self-start">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  label="Item Image"
                  uploadName={formData.title || collection?.name || 'collection-item-image'}
                />
              </div>
              <button type="submit" className="mt-6 w-full rounded-md bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700">
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </aside>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase tracking-wider text-gray-500">
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Subtitle</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{item.title}</td>
                <td className="p-4 text-gray-500">{item.subtitle || '-'}</td>
                <td className="p-4 text-sm text-gray-500">{item.is_enabled ? 'Enabled' : 'Disabled'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:text-blue-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No items added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
