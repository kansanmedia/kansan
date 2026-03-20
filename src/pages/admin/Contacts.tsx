import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { AdminActionToast } from '../../components/AdminActionToast';
import { adminJson } from '../../lib/api';
import type { ContactLead } from '../../types/admin';
import { useActionMessage } from '../../hooks/useActionMessage';

export function AdminContacts() {
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { message, showSuccess, showError } = useActionMessage();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await adminJson<ContactLead[]>('/api/admin/contacts', {}, 'Failed to fetch contacts');
      setContacts(data);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to fetch contacts';
      setError(text);
      showError(text);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      setError('');
      await adminJson<{ success: boolean }>(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete contact');
      await fetchContacts();
      showSuccess('Contact deleted successfully');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to delete contact';
      setError(text);
      showError(text);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <AdminActionToast type={message.type} text={message.text} />
      {error && <div className="mx-6 mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Contact Leads</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{contact.name}</td>
                <td className="p-4 text-gray-500">{contact.email}</td>
                <td className="p-4 text-gray-500">{contact.subject}</td>
                <td className="p-4 text-gray-500">{new Date(contact.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(contact.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No contacts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
