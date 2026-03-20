import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions tailored to meet the complex needs of modern enterprises.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading services...</div>
        ) : services.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 text-left">
            {services.map((service: any) => (
              <div key={service.id} id={service.slug} className="w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 line-clamp-4">{service.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No services currently available. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
