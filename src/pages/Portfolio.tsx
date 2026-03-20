import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { OGCard } from '../components/OGCard';

export function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolios')
      .then(res => res.json())
      .then(data => {
        setPortfolios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing our successful projects and strategic investments.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading portfolio...</div>
        ) : portfolios.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {portfolios.map((item: any) => (
              <div key={item.id} className="w-80 flex-shrink-0">
                {item.website_url ? (
                  <OGCard 
                    url={item.website_url}
                    label={item.title}
                    fallbackDescription={item.description}
                    fallbackImage={item.image}
                  />
                ) : (
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-40 object-cover" loading="lazy" />
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            Portfolio is currently empty.
          </div>
        )}
      </div>
    </div>
  );
}
