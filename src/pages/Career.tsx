import { useState, useEffect } from 'react';
import { MapPin, Briefcase } from 'lucide-react';

export function Career() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    fetch('/api/careers')
      .then(res => res.json())
      .then(data => {
        setCareers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build your career with a global leader. We are always looking for talented individuals.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading open positions...</div>
        ) : careers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {careers.map((job: any) => (
                <div 
                  key={job.id} 
                  className={`bg-white p-6 rounded-xl border cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                      </div>
                    </div>
                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-100">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              {selectedJob ? (
                <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                    <span className="bg-gray-100 px-2 py-1 rounded">{selectedJob.department}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{selectedJob.location}</span>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{selectedJob.requirements}</p>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500 sticky top-24">
                  Select a position to view details and apply.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            No open positions currently available.
          </div>
        )}
      </div>
    </div>
  );
}
