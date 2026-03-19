import { motion } from 'motion/react';

export function About() {
  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Kansan Group</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A legacy of excellence, driving innovation and sustainable growth across multiple sectors globally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
              alt="Corporate Office" 
              className="rounded-xl shadow-lg"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision & Mission</h2>
            <p className="text-gray-600 mb-4">
              At Kansan Group, we believe in creating long-term value through strategic investments and operational excellence. Our diverse portfolio of companies works synergistically to deliver outstanding results.
            </p>
            <p className="text-gray-600 mb-6">
              With over 30 years of experience, we have built a reputation for reliability, innovation, and ethical business practices. Our team of over 5,000 professionals across 25 countries is dedicated to pushing boundaries and setting new industry standards.
            </p>
            <ul className="space-y-3">
              {['Innovation First', 'Sustainable Growth', 'Global Reach', 'Excellence in Execution'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
