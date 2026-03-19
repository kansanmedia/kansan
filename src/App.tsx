import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/clients" element={<PublicLayout><Clients /></PublicLayout>} />
          <Route path="/subsidiaries" element={<PublicLayout><Subsidiaries /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/career" element={<PublicLayout><Career /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="portfolio" element={<AdminPortfolios />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="subsidiaries" element={<AdminSubsidiaries />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="applications" element={<AdminJobApplications />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
