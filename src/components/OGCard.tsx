import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Globe } from 'lucide-react';

interface OGCardProps {
  key?: string | number;
  url: string;
  label: string;
  fallbackDescription?: string;
  fallbackImage?: string;
}

export function OGCard({ url, label, fallbackDescription, fallbackImage }: OGCardProps) {
  const [ogData, setOgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOGData = async () => {
      try {
        const res = await fetch(`/api/og-data?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('Failed to fetch OG data');
        const data = await res.json();
        setOgData(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchOGData();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [url]);

  const displayTitle = ogData?.title || label;
  const displayDescription = ogData?.description || fallbackDescription;
  const displayImage = ogData?.image || fallbackImage;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
    >
      {/* Label at the top */}
      <div className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold flex items-center justify-between">
        <span>{label}</span>
        <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${displayImage ? 'hidden' : ''}`}>
          <Globe className="h-12 w-12 opacity-20" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {displayTitle}
        </h3>
        {displayDescription && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-grow">
            {displayDescription}
          </p>
        )}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <span className="text-blue-600 font-medium flex items-center gap-1 text-sm">
            Visit Website <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}
