import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { OGCard } from '../components/OGCard';
import { AutoScrollContainer } from '../components/AutoScrollContainer';
import { useSettings } from '../hooks/useSettings';
import { fetchJson } from '../lib/api';
import type { HomepageCollectionPayload } from '../types/admin';

const defaultSections = [
  { id: 1, title: 'Hero', type: 'hero', is_enabled: true, display_order: 1 },
  { id: 2, title: 'Snapshot', type: 'stats', is_enabled: true, display_order: 2 },
  { id: 3, title: 'Our Core Services', type: 'services', is_enabled: true, display_order: 3 },
  { id: 4, title: 'Featured Portfolio', type: 'portfolios', is_enabled: true, display_order: 4 },
  { id: 5, title: 'Our Subsidiaries', type: 'subsidiaries', is_enabled: true, display_order: 5 },
  { id: 6, title: 'Our Clients', type: 'clients', is_enabled: true, display_order: 6 },
];

export function Home() {
  const [sections, setSections] = useState<any[]>(defaultSections);
  const [services, setServices] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [clients, setClients] = useState([]);
  const [collections, setCollections] = useState<HomepageCollectionPayload[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [subsidiariesLoading, setSubsidiariesLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    fetchJson<any[]>('/api/homepage-sections', {}, 'Failed to fetch homepage sections')
      .then((data) => {
        if (data.length > 0) {
          setSections(data);
        }
      })
      .catch((err) => {
        setDbError(err instanceof Error ? err.message : 'Database connection failed');
      });
  }, []);

  useEffect(() => {
    fetchJson<any[]>('/api/services', {}, 'Failed to fetch services')
      .then((data) => setServices(data.slice(0, 25)))
      .catch((err) => setDbError((current) => current || (err instanceof Error ? err.message : 'Database connection failed')))
      .finally(() => setServicesLoading(false));

    fetchJson<any[]>('/api/portfolios', {}, 'Failed to fetch portfolios')
      .then((data) => setPortfolios(data.slice(0, 25)))
      .catch((err) => setDbError((current) => current || (err instanceof Error ? err.message : 'Database connection failed')))
      .finally(() => setPortfoliosLoading(false));

    fetchJson<any[]>('/api/subsidiaries', {}, 'Failed to fetch subsidiaries')
      .then((data) => setSubsidiaries(data.slice(0, 25)))
      .catch((err) => setDbError((current) => current || (err instanceof Error ? err.message : 'Database connection failed')))
      .finally(() => setSubsidiariesLoading(false));

    fetchJson<any[]>('/api/clients', {}, 'Failed to fetch clients')
      .then((data) => setClients(data.slice(0, 25)))
      .catch((err) => setDbError((current) => current || (err instanceof Error ? err.message : 'Database connection failed')))
      .finally(() => setClientsLoading(false));

    fetchJson<HomepageCollectionPayload[]>('/api/collections/homepage', {}, 'Failed to fetch collections')
      .then((data) => setCollections(data))
      .catch((err) => setDbError((current) => current || (err instanceof Error ? err.message : 'Database connection failed')))
      .finally(() => setCollectionsLoading(false));
  }, []);

  const heroTitle = settings?.hero_title || 'Building the Future of Global Enterprise';
  const heroDescription =
    settings?.hero_description ||
    'Kansan Group is a diversified holding company driving innovation and sustainable growth across technology, real estate, and logistics sectors.';
  const heroImage =
    settings?.hero_image ||
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';
  const heroPrimaryLabel = settings?.hero_primary_label || 'Explore Services';
  const heroPrimaryLink = settings?.hero_primary_link || '/services';
  const heroSecondaryLabel = settings?.hero_secondary_label || 'Contact Us';
  const heroSecondaryLink = settings?.hero_secondary_link || '/contact';

  const renderSectionHeading = (title: string, description: string) => (
    <div className="mb-10 text-center md:mb-12">
      <h2 className="text-shine mb-2 text-2xl font-bold sm:text-[1.75rem] md:mb-3 md:text-3xl">{title}</h2>
      <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">
        {description}
      </p>
    </div>
  );

  const renderSection = (section: any) => {
    if (String(section.type).startsWith('collection:')) {
      const collectionSlug = String(section.type).slice('collection:'.length);
      const matchedCollection = collections.find((item) => item.collection.slug === collectionSlug);

      return (
        <section key={section.id} className="premium-divider py-24 bg-white">
          <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
            {renderSectionHeading(
              matchedCollection?.collection.section_title || section.title,
              matchedCollection?.collection.section_description || 'Custom collection content managed from the admin panel.'
            )}

            {!dbError && (
              collectionsLoading ? (
                <div className="py-12 text-center text-gray-500">Loading section...</div>
              ) : matchedCollection && matchedCollection.items.length > 0 ? (
                matchedCollection.items.length > 3 ? (
                  <AutoScrollContainer speed={55}>
                    {matchedCollection.items.map((item) => (
                      <div key={item.id} className="premium-card w-[220px] flex-shrink-0 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md sm:w-[240px] md:w-72 md:p-6">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="mb-4 aspect-[16/10] w-full rounded-xl object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{item.title}</h3>
                        {item.subtitle && <p className="mb-2 text-sm font-medium text-blue-600">{item.subtitle}</p>}
                        {item.description && <p className="mb-4 line-clamp-3 whitespace-normal text-sm text-gray-600 md:mb-6">{item.description}</p>}
                        {item.link_url && (
                          <a href={item.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-base">
                            Learn more <ArrowRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </AutoScrollContainer>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-8 text-left">
                    {matchedCollection.items.map((item) => (
                      <div key={item.id} className="premium-card w-[220px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:w-[240px] md:w-72 md:p-6">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="mb-4 aspect-[16/10] w-full rounded-xl object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{item.title}</h3>
                        {item.subtitle && <p className="mb-2 text-sm font-medium text-blue-600">{item.subtitle}</p>}
                        {item.description && <p className="mb-4 line-clamp-3 text-sm text-gray-600 md:mb-6">{item.description}</p>}
                        {item.link_url && (
                          <a href={item.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-base">
                            Learn more <ArrowRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-gray-500">No items found for this section yet.</div>
              )
            )}
          </div>
        </section>
      );
    }

    switch (section.type) {
      case 'hero':
        return (
          <section key={section.id} className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden bg-gray-900 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            />
            <div className="absolute inset-0 bg-slate-950/65" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.55),transparent_40%)]" />
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4 py-14 sm:py-16 lg:py-20 relative z-10 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
              >
                <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium uppercase tracking-[0.3em] text-blue-100 backdrop-blur-md">
                  {section.title}
                </div>
                <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mb-10 max-w-3xl text-xl text-slate-200">
                  {heroDescription}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={heroPrimaryLink} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-950/30">
                    {heroPrimaryLabel} <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to={heroSecondaryLink} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-md font-medium transition-colors backdrop-blur-sm border border-white/10">
                    {heroSecondaryLabel}
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        );

      case 'stats':
        const stats = [
          {
            icon: Building2,
            label: settings?.stats_subsidiaries_label || 'Subsidiaries',
            value: String(subsidiaries.length),
          },
          {
            icon: Globe,
            label: settings?.stats_clients_label || 'Clients',
            value: String(clients.length),
          },
          {
            icon: Users,
            label: settings?.stats_employees_label || 'Employees',
            value: settings?.stats_employees_value || '0',
          },
          {
            icon: TrendingUp,
            label: settings?.stats_experience_label || 'Years Experience',
            value: settings?.stats_experience_value || '0',
          },
        ];

        return (
          <section key={section.id} className="premium-divider py-18 bg-white border-b border-gray-100">
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
              <div className="grid grid-cols-2 gap-5 text-center sm:gap-6 md:grid-cols-4 md:gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -8, scale: 1.015 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,0.96))] px-4 py-6 shadow-[0_20px_50px_rgba(2,6,23,0.32)] ring-1 ring-white/8 before:absolute before:inset-x-[18%] before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-sky-300/80 before:to-transparent before:content-[''] after:absolute after:right-[-30px] after:top-[-34px] after:h-28 after:w-28 after:rounded-full after:bg-sky-400/10 after:blur-2xl after:content-[''] sm:px-5"
                  >
                    <div className="mx-auto mb-3 flex w-fit rounded-full border border-sky-400/25 bg-slate-800/95 p-3 shadow-[0_0_32px_rgba(96,165,250,0.16)] sm:mb-4 sm:p-4">
                      <stat.icon className="h-6 w-6 text-sky-300 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                    <CountUpStat value={stat.value} />
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-xs md:text-sm md:tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'services':
        return (
          <section key={section.id} className="premium-divider py-24 bg-gray-50">
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
              {renderSectionHeading(section.title, 'Delivering excellence across multiple industries through our specialized divisions.')}

              {dbError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg text-center max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-2">Database Connection Failed</h3>
                  <p className="font-mono text-sm bg-red-100 p-3 rounded text-left overflow-x-auto mb-4">{dbError}</p>
                </div>
              ) : servicesLoading ? (
                <div className="py-12 text-center text-gray-500">Loading services...</div>
              ) : (
                services.length > 3 ? (
                  <AutoScrollContainer speed={60}>
                    {services.map((service: any) => (
                      <div key={service.id} className="premium-card w-[220px] sm:w-[240px] md:w-72 bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-shrink-0 text-left">
                        <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{service.title}</h3>
                        <p className="mb-4 line-clamp-3 whitespace-normal text-sm text-gray-600 sm:mb-5 md:mb-6">{service.description}</p>
                        <Link to={`/services#${service.slug}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-base">
                          Learn more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </AutoScrollContainer>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-8 text-left">
                    {services.length > 0 ? services.map((service: any) => (
                      <div key={service.id} className="premium-card w-[220px] sm:w-[240px] md:w-72 bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="mb-2 text-base font-bold text-gray-900 sm:text-lg">{service.title}</h3>
                        <p className="mb-4 line-clamp-3 text-sm text-gray-600 sm:mb-5 md:mb-6">{service.description}</p>
                        <Link to={`/services#${service.slug}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-base">
                          Learn more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )) : (
                      <div className="w-full text-center text-gray-500 py-12">
                        No services found. Add some from the admin panel.
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        );

      case 'portfolios':
        return (
          <section key={section.id} className="premium-divider py-24 bg-white">
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
              {renderSectionHeading(section.title, 'A glimpse into our successful projects and partnerships.')}

              {!dbError && (
                portfoliosLoading ? (
                  <div className="py-12 text-center text-gray-500">Loading portfolio...</div>
                ) : portfolios.length > 3 ? (
                  <AutoScrollContainer speed={80}>
                    {portfolios.map((portfolio: any) => (
                      <div key={portfolio.id} className="w-72 flex-shrink-0 text-left">
                        {portfolio.website_url ? (
                          <OGCard 
                            url={portfolio.website_url}
                            label={portfolio.title}
                            fallbackDescription={portfolio.description}
                            fallbackImage={portfolio.image}
                          />
                        ) : (
                          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full">
                            {portfolio.image && (
                              <img src={portfolio.image} alt={portfolio.title} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{portfolio.title}</h3>
                              <p className="text-gray-600 mb-4 line-clamp-2">{portfolio.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </AutoScrollContainer>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-8 text-left">
                    {portfolios.length > 0 ? portfolios.map((portfolio: any) => (
                      <div key={portfolio.id} className="w-72 flex-shrink-0">
                        {portfolio.website_url ? (
                          <OGCard 
                            url={portfolio.website_url}
                            label={portfolio.title}
                            fallbackDescription={portfolio.description}
                            fallbackImage={portfolio.image}
                          />
                        ) : (
                          <div className="premium-card overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm transition-shadow hover:shadow-md">
                            {portfolio.image && (
                              <img src={portfolio.image} alt={portfolio.title} className="h-28 w-full object-cover sm:h-32 md:h-36" />
                            )}
                            <div className="p-4 sm:p-5 md:p-6">
                              <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{portfolio.title}</h3>
                              {portfolio.client_name && <p className="mb-2 text-xs font-medium text-blue-600 sm:mb-3 sm:text-sm">{portfolio.client_name}</p>}
                              <p className="mb-3 line-clamp-3 text-sm text-gray-600 sm:mb-4">{portfolio.description}</p>
                              <Link to={`/portfolio#${portfolio.slug}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-base">
                                View Project <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="w-full text-center text-gray-500 py-12">
                        No portfolio items found. Add some from the admin panel.
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        );

      case 'subsidiaries':
        return (
          <section key={section.id} className="premium-divider py-24 bg-gray-50 border-b border-gray-100">
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
              {renderSectionHeading(section.title, 'The diverse companies that make up the Kansan Group.')}

              {!dbError && (
                subsidiariesLoading ? (
                  <div className="py-12 text-center text-gray-500">Loading subsidiaries...</div>
                ) : subsidiaries.length > 3 ? (
                  <AutoScrollContainer speed={70}>
                    {subsidiaries.map((sub: any) => (
                      <div key={sub.id} className="w-72 flex-shrink-0 text-left">
                        {sub.website_url ? (
                          <OGCard 
                            url={sub.website_url}
                            label={sub.name}
                            fallbackDescription={sub.description}
                            fallbackImage={sub.logo}
                          />
                        ) : (
                          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full">
                            {sub.logo && (
                              <img src={sub.logo} alt={sub.name} className="h-16 object-contain mb-6" />
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{sub.name}</h3>
                            <p className="text-gray-600 mb-6 line-clamp-3">{sub.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </AutoScrollContainer>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-8 text-left">
                    {subsidiaries.length > 0 ? subsidiaries.map((sub: any) => (
                      <div key={sub.id} className="w-72 flex-shrink-0">
                        {sub.website_url ? (
                          <OGCard 
                            url={sub.website_url}
                            label={sub.name}
                            fallbackDescription={sub.description}
                            fallbackImage={sub.logo}
                          />
                        ) : (
                          <div className="premium-card flex h-full flex-col items-center rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md sm:p-6 md:p-8">
                            {sub.logo && (
                              <img src={sub.logo} alt={sub.name} className="mb-4 h-12 object-contain sm:mb-5 sm:h-14 md:mb-6 md:h-16" />
                            )}
                            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{sub.name}</h3>
                            <p className="mb-4 line-clamp-3 text-sm text-gray-600 sm:mb-5 md:mb-6">{sub.description}</p>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="w-full text-center text-gray-500 py-12">
                        No subsidiaries found. Add some from the admin panel.
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        );

      case 'clients':
        return (
          <section key={section.id} className="premium-divider py-24 bg-white">
            <div className="max-w-[92%] sm:max-w-[88%] lg:max-w-[80%] mx-auto px-4">
              {renderSectionHeading(section.title, 'Trusted by industry leaders worldwide.')}

              {!dbError && (
                clientsLoading ? (
                  <div className="py-12 text-center text-gray-500">Loading clients...</div>
                ) : clients.length > 3 ? (
                  <AutoScrollContainer speed={50}>
                    {clients.map((client: any) => (
                      <div key={client.id} className="w-72 flex-shrink-0 text-left">
                        {client.website_url ? (
                          <OGCard 
                            url={client.website_url}
                            label={client.name}
                            fallbackDescription={client.testimonial}
                            fallbackImage={client.logo}
                          />
                        ) : (
                          <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full">
                            {client.logo ? (
                              <img src={client.logo} alt={client.name} className="h-16 object-contain mb-6" />
                            ) : (
                              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-6">
                                {client.name.charAt(0)}
                              </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{client.name}</h3>
                            {client.testimonial && (
                              <p className="text-gray-600 italic mb-4 line-clamp-2">"{client.testimonial}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </AutoScrollContainer>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-8 text-left">
                    {clients.length > 0 ? clients.map((client: any) => (
                      <div key={client.id} className="w-72 flex-shrink-0">
                        {client.website_url ? (
                          <OGCard 
                            url={client.website_url}
                            label={client.name}
                            fallbackDescription={client.testimonial}
                            fallbackImage={client.logo}
                          />
                        ) : (
                          <div className="premium-card flex h-full flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-5 text-center shadow-sm transition-shadow hover:shadow-md sm:p-6 md:p-8">
                            {client.logo ? (
                              <img src={client.logo} alt={client.name} className="mb-4 h-12 object-contain sm:mb-5 sm:h-14 md:mb-6 md:h-16" />
                            ) : (
                              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 sm:mb-5 sm:h-14 sm:w-14 sm:text-xl md:mb-6 md:h-16 md:w-16">
                                {client.name.charAt(0)}
                              </div>
                            )}
                            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{client.name}</h3>
                            {client.testimonial && (
                              <p className="mb-4 line-clamp-3 text-sm italic text-gray-600">"{client.testimonial}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="w-full text-center text-gray-500 py-12">
                        No clients featured yet.
                      </div>
                    )}
                  </div>
                )
              )}
              
              <div className="mt-12 text-center sm:mt-14 md:mt-16">
                <Link
                  to="/clients"
                  className="group inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-5 py-3 text-sm font-semibold text-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.08)] transition-all hover:border-sky-300/45 hover:bg-sky-400/15 hover:text-sky-200 hover:shadow-[0_0_30px_rgba(56,189,248,0.16)] sm:text-base"
                >
                  <span>View All Clients</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {sections.length > 0 ? (
        sections.map(section => renderSection(section))
      ) : (
        <div className="py-32 text-center text-gray-500">
          Homepage content is being configured. Please check back soon.
        </div>
      )}
    </div>
  );
}

function CountUpStat({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const match = value.match(/\d+/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const target = Number(match[0]);
    const suffix = value.slice(match.index! + match[0].length);
    const durationMs = 900;
    const frameMs = 16;
    const steps = Math.max(1, Math.round(durationMs / frameMs));
    let currentStep = 0;

    const timer = window.setInterval(() => {
      currentStep += 1;
      const nextValue = Math.round((target * currentStep) / steps);
      setDisplayValue(`${nextValue}${suffix}`);

      if (currentStep >= steps) {
        window.clearInterval(timer);
        setDisplayValue(value);
      }
    }, frameMs);

    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <div className="mb-1 text-2xl font-black text-slate-50 drop-shadow-[0_0_12px_rgba(96,165,250,0.35)] sm:text-[1.7rem] md:text-3xl">
      {displayValue}
    </div>
  );
}
