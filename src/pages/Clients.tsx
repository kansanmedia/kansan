import { useState, useEffect } from 'react';

export function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Clients</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted by industry leaders worldwide.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading clients...</div>
        ) : clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client: any) => (
              <div key={client.id} className="bg-gray-50 p-8 rounded-xl border border-gray-100 text-center">
                {client.logo ? (
                  <img src={client.logo} alt={client.name} className="h-16 mx-auto mb-6 object-contain" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <div className="h-16 w-16 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-gray-500">
                    {client.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-4">{client.name}</h3>
                {client.testimonial && (
                  <p className="text-gray-600 italic">"{client.testimonial}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            Client list is currently empty.
          </div>
        )}
      </div>
    </div>
  );
}
