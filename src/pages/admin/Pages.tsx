import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { ImageUpload } from '../../components/ImageUpload';
import { adminJson } from '../../lib/api';
import type { Page } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

const RichTextEditor = lazy(async () => {
  const mod = await import('../../components/RichTextEditor');
  return { default: mod.RichTextEditor };
});

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildMetaDescription(title: string, excerpt: string, content: string) {
  const plainText = excerpt.trim() || stripHtml(content) || title.trim();
  return plainText.length > 160 ? `${plainText.slice(0, 157).trim()}...` : plainText;
}

function buildMetaTitle(title: string) {
  const trimmed = title.trim();
  return trimmed ? `${trimmed} | Kansan Group` : '';
}

const defaultFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  meta_title: '',
  meta_description: '',
  is_published: true,
  display_order: 0,
};

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const generatedMetaTitle = buildMetaTitle(formData.title);
  const generatedMetaDescription = buildMetaDescription(formData.title, formData.excerpt, formData.content);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await adminJson<Page[]>('/api/admin/pages', {}, 'Failed to fetch pages');
      setPages(data);
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to fetch pages';
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
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/pages/${editingId}` : '/api/admin/pages', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          meta_title: generatedMetaTitle,
          meta_description: generatedMetaDescription,
          display_order: Number(formData.display_order) || 0,
        }),
      }, editingId ? 'Failed to update page' : 'Failed to create page');
      resetForm();
      await fetchPages();
      showSuccess(editingId ? 'Page updated successfully' : 'Page created successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to save page';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setIsAdding(true);
    setFormData({
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt || '',
      content: page.content || '',
      image: page.image || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
      display_order: page.display_order || 0,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/pages/${id}`, { method: 'DELETE' }, 'Failed to delete page');
      await fetchPages();
      showSuccess('Page deleted successfully');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to delete page';
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Pages</h2>
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Page'}
        </button>
      </div>

      {isAdding && (
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Page Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
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
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Short Excerpt</label>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Page Content</label>
                  <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                    <Suspense fallback={<div className="flex min-h-[520px] items-center justify-center bg-gray-50 text-sm text-gray-500">Editor loading...</div>}>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>

              <aside className="self-start xl:sticky xl:top-8">
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold text-gray-900">Page Media</h3>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                      label="Featured Image"
                      uploadName={formData.title || 'page-featured-image'}
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900">Publishing</h3>
                    <p className="text-sm text-gray-500">
                      Saved page navigation and footer quick links settings me available ho jayega.
                    </p>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.display_order}
                        onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) || 0 }))}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                      />
                      Published
                    </label>
                  </div>

                  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700">Auto Meta Title</p>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                        {generatedMetaTitle || 'Title se meta title generate hoga.'}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700">Auto Meta Description</p>
                      <div className="min-h-24 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                        {generatedMetaDescription || 'Excerpt ya content se description generate hoga.'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                  >
                    {editingId ? 'Update Page' : 'Save Page'}
                  </button>
                </div>
              </aside>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase tracking-wider text-gray-500">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Visibility</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{page.title}</td>
                <td className="p-4 text-gray-500">/{page.slug}</td>
                <td className="p-4 text-sm text-gray-500">
                  {page.is_published ? 'Published' : 'Draft'}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(page)} className="p-2 text-blue-500 hover:text-blue-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(page.id)} className="p-2 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No custom pages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
