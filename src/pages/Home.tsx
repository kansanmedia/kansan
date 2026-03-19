import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { OGCard } from '../components/OGCard';

export function Home() {
  const [services, setServices] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, portfoliosRes, subsidiariesRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/portfolios'),
          fetch('/api/subsidiaries')
        ]);

        if (!servicesRes.ok) {
          const errData = await servicesRes.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || 'Database connection failed');
        }

        const servicesData = await servicesRes.json();
        const portfoliosData = await portfoliosRes.json();
        const subsidiariesData = await subsidiariesRes.json();

        setServices(servicesData.slice(0, 3));
        setPortfolios(portfoliosData.slice(0, 3));
        setSubsidiaries(subsidiariesData.slice(0, 3));
      } catch (err: any) {
        setDbError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Building the Future of Global Enterprise
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Kansan Group is a diversified holding company driving innovation and sustainable growth across technology, real estate, and logistics sectors.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center gap-2">
                Explore Services <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/contact" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-md font-medium transition-colors backdrop-blur-sm">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Building2, label: 'Subsidiaries', value: '12+' },
              { icon: Globe, label: 'Countries', value: '25+' },
              { icon: Users, label: 'Employees', value: '5,000+' },
              { icon: TrendingUp, label: 'Years Experience', value: '30+' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Delivering excellence across multiple industries through our specialized divisions.
            </p>
          </div>

          {dbError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg text-center max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-2">Database Connection Failed</h3>
              <p className="font-mono text-sm bg-red-100 p-3 rounded text-left overflow-x-auto mb-4">
                {dbError}
              </p>
              
              {dbError.includes("doesn't exist") ? (
                <div className="mt-6 mb-2">
                  <p className="mb-4 font-medium">Great news! The connection is working, but the database is empty.</p>
                  <button 
                    onClick={() => {
                      fetch('/api/db/init')
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            alert('Database initialized successfully! Refreshing page...');
                            window.location.reload();
                          } else {
                            alert('Failed to initialize: ' + data.details);
                          }
                        });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Click Here to Create Tables Automatically
                  </button>
                </div>
              ) : (
                <>
                  <p>Please double-check your DB_HOST, DB_USER, and DB_PASSWORD in the AI Studio Secrets panel.</p>
                  <p className="text-sm mt-2 opacity-80">Make sure you have clicked "Apply changes" after updating secrets.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.length > 0 ? services.map((service: any) => (
                <div key={service.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                  <Link to={`/services#${service.slug}`} className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )) : (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  No services found. Add some from the admin panel.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Portfolio</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A glimpse into our successful projects and partnerships.
            </p>
          </div>

          {!dbError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {portfolios.length > 0 ? portfolios.map((portfolio: any) => (
                portfolio.website_url ? (
                  <OGCard 
                    key={portfolio.id}
                    url={portfolio.website_url}
                    label={portfolio.title}
                    fallbackDescription={portfolio.description}
                    fallbackImage={portfolio.image}
                  />
                ) : (
                  <div key={portfolio.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    {portfolio.image && (
                      <img src={portfolio.image} alt={portfolio.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{portfolio.title}</h3>
                      {portfolio.client_name && <p className="text-sm text-blue-600 mb-3 font-medium">{portfolio.client_name}</p>}
                      <p className="text-gray-600 mb-4 line-clamp-3">{portfolio.description}</p>
                      <Link to={`/portfolio#${portfolio.slug}`} className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                        View Project <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )
              )) : (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  No portfolio items found. Add some from the admin panel.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Subsidiaries Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Subsidiaries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The diverse companies that make up the Kansan Group.
            </p>
          </div>

          {!dbError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {subsidiaries.length > 0 ? subsidiaries.map((sub: any) => (
                sub.website_url ? (
                  <OGCard 
                    key={sub.id}
                    url={sub.website_url}
                    label={sub.name}
                    fallbackDescription={sub.description}
                    fallbackImage={sub.logo}
                  />
                ) : (
                  <div key={sub.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                    {sub.logo && (
                      <img src={sub.logo} alt={sub.name} className="h-16 object-contain mb-6" />
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{sub.name}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">{sub.description}</p>
                    {sub.website_url && (
                      <a href={sub.website_url} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 mt-auto">
                        Visit Website <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )
              )) : (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  No subsidiaries found. Add some from the admin panel.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
