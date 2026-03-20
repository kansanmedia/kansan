import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Portfolio } from './pages/Portfolio';
import { Clients } from './pages/Clients';
import { Subsidiaries } from './pages/Subsidiaries';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { PageDetail } from './pages/PageDetail';
import { Career } from './pages/Career';
import { Contact } from './pages/Contact';

// Admin Pages
import { AdminLogin } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/Layout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminServices } from './pages/admin/Services';
import { AdminPortfolios } from './pages/admin/Portfolios';
import { AdminSubsidiaries } from './pages/admin/Subsidiaries';
import { AdminBlogs } from './pages/admin/Blogs';
import { AdminClients } from './pages/admin/Clients';
import { AdminCareers } from './pages/admin/Careers';
import { AdminJobApplications } from './pages/admin/JobApplications';
import { AdminContacts } from './pages/admin/Contacts';
import { AdminSettings } from './pages/admin/Settings';
import { AdminPages } from './pages/admin/Pages';
import { AdminCollections } from './pages/admin/Collections';
import { AdminCollectionItems } from './pages/admin/CollectionItems';

function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-grow"
      >
        {children}
      </motion.main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.classList.add('bg-slate-950', 'text-slate-100');

    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = '';
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/clients" element={<PublicLayout><Clients /></PublicLayout>} />
          <Route path="/subsidiaries" element={<PublicLayout><Subsidiaries /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/career" element={<PublicLayout><Career /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/:slug" element={<PublicLayout><PageDetail /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="portfolio" element={<AdminPortfolios />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="collections/:slug" element={<AdminCollectionItems />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="subsidiaries" element={<AdminSubsidiaries />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="applications" element={<AdminJobApplications />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
