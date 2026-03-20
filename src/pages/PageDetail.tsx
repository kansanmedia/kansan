import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchJson } from '../lib/api';
import type { Page } from '../types/admin';

export function PageDetail() {
  const { slug } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('Page not found');
      setLoading(false);
      return;
    }

    fetchJson<Page>(`/api/pages/${slug}`, {}, 'Failed to fetch page')
      .then((data) => {
        setPage(data);
        document.title = data.meta_title || `${data.title} | Kansan Group`;
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch page'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-slate-400">Loading page...</div>;
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] bg-slate-950 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-10 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <h1 className="text-3xl font-bold text-slate-50">Page not available</h1>
          <p className="mt-4 text-slate-400">{error || 'This page could not be loaded.'}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.8),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#111827_100%)] py-10 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-[32px] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(15,23,42,0.98))] shadow-[0_28px_90px_rgba(2,6,23,0.5)]">
          {page.image && (
            <img
              src={page.image}
              alt={page.title}
              className="h-[260px] w-full object-cover md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}

          <div className="px-6 py-10 md:px-12 md:py-14">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black tracking-tight text-slate-50 md:text-6xl">{page.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-400 md:text-xl">
                {page.meta_description || page.excerpt || 'Explore more from Kansan Group.'}
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-400/70 to-amber-300/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Page Content</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-400/70 to-amber-300/50" />
            </div>

            <article
              className="blog-prose mt-10 text-[17px] leading-8 text-slate-200"
              dangerouslySetInnerHTML={{ __html: page.content || '<p>No content available.</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
