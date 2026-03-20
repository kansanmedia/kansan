import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { fetchJson } from '../lib/api';
import type { OgData } from '../types/admin';

interface OGCardProps {
  key?: string | number;
  url: string;
  label: string;
  fallbackDescription?: string;
  fallbackImage?: string;
}

export function OGCard({ url, label, fallbackDescription, fallbackImage }: OGCardProps) {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOGData = async () => {
      try {
        const data = await fetchJson<OgData>(`/api/og-data?url=${encodeURIComponent(url)}`, {}, 'Failed to fetch OG data');
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
  const displayImage = ogData?.image || fallbackImage;
  const isFallbackImage = !ogData?.image && !!fallbackImage;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block w-[220px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[240px] md:w-[260px]"
    >
      {/* Label at the top */}
      <div className="flex items-center justify-between bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white sm:px-4 sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/12 text-blue-100">
            <Globe className="h-3 w-3" />
          </span>
          <span>{label}</span>
        </div>
        <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100 sm:h-4 sm:w-4" />
      </div>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-50">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayTitle} 
            className={`w-full h-full transition-all duration-500 ${
              isFallbackImage ? 'object-contain p-6' : 'object-cover group-hover:scale-105'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Floating Visit Website Button */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[8px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 sm:px-2.5 sm:text-[9px]">
          Visit Website <ArrowRight className="h-2.5 w-2.5" />
        </div>

        <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${displayImage ? 'hidden' : ''}`}>
          <Globe className="h-10 w-10 opacity-20 sm:h-12 sm:w-12" />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-[36px] items-center justify-center bg-blue-600 px-3 py-2 text-center">
        <h3 className="line-clamp-2 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors group-hover:text-blue-100 sm:text-xs">
          {displayTitle}
        </h3>
      </div>
    </a>
  );
}
