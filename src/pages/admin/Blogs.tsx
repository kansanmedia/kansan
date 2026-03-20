import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { ImageUpload } from '../../components/ImageUpload';
import { adminJson } from '../../lib/api';
import type { Blog } from '../../types/admin';
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

function buildMetaDescription(title: string, content: string) {
  const plainText = stripHtml(content);
  const base = plainText || title;
  return base.length > 160 ? `${base.slice(0, 157).trim()}...` : base;
}

function buildMetaTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.includes('Kansan Group') ? trimmed : `${trimmed} | Kansan Group`;
}

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', image: '', meta_title: '', meta_description: '' });
  const generatedMetaTitle = buildMetaTitle(formData.title);
  const generatedMetaDescription = buildMetaDescription(formData.title, formData.content);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', slug: '', content: '', image: '', meta_title: '', meta_description: '' });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await adminJson<Blog[]>('/api/admin/blogs', {}, 'Failed to fetch blogs');
      setBlogs(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch blogs';
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
      await adminJson<{ success: boolean }>(editingId ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          meta_title: generatedMetaTitle,
          meta_description: generatedMetaDescription,
        })
      }, editingId ? 'Failed to update blog' : 'Failed to create blog');
      resetForm();
      await fetchBlogs();
      showSuccess(editingId ? 'Blog updated successfully' : 'Blog created successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to save blog';
      setError(text);
      showError(text);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setIsAdding(true);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content || '',
      image: blog.image || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete blog');
      await fetchBlogs();
      showSuccess('Blog deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete blog';
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Blogs</h2>
        <button
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> {isAdding ? 'Cancel' : 'Add Blog'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
              <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                    <Suspense
                      fallback={
                        <div className="flex min-h-[620px] items-center justify-center bg-gray-50 text-sm text-gray-500">
                          Editor loading...
                        </div>
                      }
                    >
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>

              <aside className="self-start xl:sticky xl:top-8">
                <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Cover & SEO</h3>
                  <ImageUpload 
                    value={formData.image} 
                    onChange={(url) => setFormData({ ...formData, image: url })} 
                    label="Blog Cover Image"
                    uploadName={formData.title || 'blog-cover-image'}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Auto Meta Title</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                      {generatedMetaTitle || 'Title likhne par meta title yahan banega.'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Auto Meta Description</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 min-h-28">
                      {generatedMetaDescription || 'Content likhne par meta description yahan banega.'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Meta fields automatically title aur content se generate honge.
                  </p>
                </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-sm"
                  >
                    {editingId ? 'Update Blog' : 'Save Blog'}
                  </button>
                </div>
              </aside>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{blog.title}</td>
                <td className="p-4 text-gray-500">{blog.slug}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(blog)} className="text-blue-500 hover:text-blue-700 p-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No blogs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
