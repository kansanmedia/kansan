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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing our successful projects and strategic investments.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading portfolio...</div>
        ) : portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolios.map((item: any, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                {item.website_url ? (
                  <OGCard 
                    url={item.website_url}
                    label={item.title}
                    fallbackDescription={item.description}
                    fallbackImage={item.image}
                  />
                ) : (
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all h-full flex flex-col">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-64 object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="p-6 flex-grow">
                      <div className="text-sm text-blue-600 font-semibold mb-2">{item.client_name}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 line-clamp-3">{item.description}</p>
                    </div>
                  </div>
                )}
              </motion.div>
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
