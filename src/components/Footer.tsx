import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">Kansan Group</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering businesses through innovative solutions and strategic investments across multiple sectors.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link to="/career" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Subsidiaries</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/subsidiaries" className="hover:text-white transition-colors">Kansan Tech</Link></li>
              <li><Link to="/subsidiaries" className="hover:text-white transition-colors">Kansan Real Estate</Link></li>
              <li><Link to="/subsidiaries" className="hover:text-white transition-colors">Kansan Logistics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0" />
                <span>123 Corporate Blvd, Suite 500<br/>Business District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400 shrink-0" />
                <span>info@kansangroup.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Kansan Group. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
