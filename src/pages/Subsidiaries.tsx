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
      <div className="max-w-[80%] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Subsidiaries</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The diverse companies that make up the Kansan Group ecosystem.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading subsidiaries...</div>
        ) : subsidiaries.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {subsidiaries.map((sub: any) => (
              <div key={sub.id} className="w-80 flex-shrink-0">
                {sub.website_url ? (
                  <OGCard 
                    url={sub.website_url}
                    label={sub.name}
                    fallbackDescription={sub.description}
                    fallbackImage={sub.logo}
                  />
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center h-full">
                    {sub.logo ? (
                      <img src={sub.logo} alt={sub.name} className="h-16 object-contain mb-4" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{sub.name}</h3>
                    <p className="text-gray-600 line-clamp-3">{sub.description}</p>
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
