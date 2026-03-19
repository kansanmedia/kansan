import React, { useState, useEffect } from 'react';
import { Trash2, Download, ExternalLink } from 'lucide-react';

export function AdminJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/job_applications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch job applications');
      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      const res = await fetch(`/api/admin/job_applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete application');
      fetchApplications();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Job Applications</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Applicant</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Cover Letter</th>
              <th className="p-4 font-medium">Resume</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app: any) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">
                  {app.applicant_name}
                  {app.career_id && <div className="text-xs text-blue-600 mt-1">Job ID: {app.career_id}</div>}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </td>
                <td className="p-4 text-gray-500 text-sm max-w-xs">
                  <div className="truncate" title={app.cover_letter}>{app.cover_letter || 'N/A'}</div>
                </td>
                <td className="p-4 text-gray-500">
                  {app.resume_url ? (
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" /> View
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="p-4 text-gray-500 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
