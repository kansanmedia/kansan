import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { OGCard } from '../components/OGCard';

export function Subsidiaries() {
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subsidiaries')
      .then(res => res.json())
      .then(data => {
        setSubsidiaries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Subsidiaries</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The diverse companies that make up the Kansan Group ecosystem.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading subsidiaries...</div>
        ) : subsidiaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subsidiaries.map((sub: any) => (
              <div key={sub.id} className="h-full">
                {sub.website_url ? (
                  <OGCard 
                    url={sub.website_url}
                    label={sub.name}
                    fallbackDescription={sub.description}
                    fallbackImage={sub.logo}
                  />
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start h-full">
                    {sub.logo ? (
                      <img src={sub.logo} alt={sub.name} className="w-24 h-24 object-contain shrink-0" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{sub.name}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{sub.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            No subsidiaries listed yet.
          </div>
        )}
      </div>
    </div>
  );
}
