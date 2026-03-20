import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock3, Copy, Facebook, Linkedin, Twitter } from 'lucide-react';
import { fetchJson } from '../lib/api';
import type { Blog } from '../types/admin';
import { WhatsAppIcon } from '../components/WhatsAppButton';

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getReadingTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('Blog not found');
      setLoading(false);
      return;
    }

    fetchJson<Blog>(`/api/blogs/${slug}`, {}, 'Failed to fetch blog')
      .then((data) => {
        setBlog(data);
        if (data.meta_title) {
          document.title = data.meta_title;
        } else {
          document.title = `${data.title} | Kansan Group`;
        }

        fetchJson<Blog[]>('/api/blogs', {}, 'Failed to fetch related blogs')
          .then((blogs) => {
            setRelatedBlogs(blogs.filter((item) => item.slug !== data.slug).slice(0, 3));
          })
          .catch(() => setRelatedBlogs([]));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch blog'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-slate-400">Loading article...</div>;
  }

  if (error || !blog) {
    return (
      <div className="min-h-[60vh] bg-slate-950 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-10 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <h1 className="text-3xl font-bold text-slate-50">Article not available</h1>
          <p className="mt-4 text-slate-400">{error || 'This article could not be loaded.'}</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTime(blog.content || '');
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareItems = [
    {
      label: 'Copy link',
      icon: Copy,
      onClick: async () => {
        if (!articleUrl) {
          return;
        }
        await navigator.clipboard.writeText(articleUrl);
      },
    },
    {
      label: 'X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(blog.title)}`,
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    },
    {
      label: 'WhatsApp',
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(`${blog.title} ${articleUrl}`)}`,
    },
  ];

  return (
    <div className="bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.8),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#111827_100%)] py-10 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>

        <div className="overflow-hidden rounded-[32px] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(15,23,42,0.98))] shadow-[0_28px_90px_rgba(2,6,23,0.5)] backdrop-blur">
          <div className="px-6 py-10 md:px-12 md:py-14">
            <div>
              <div>
                <div className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Insight Article
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-50 md:text-6xl">
                  {blog.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
                  {blog.meta_description || 'Strategic thinking, execution insights, and practical business lessons from Kansan Group.'}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2">
                    <Calendar className="h-4 w-4" />
                    {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recently published'}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2">
                    <Clock3 className="h-4 w-4" />
                    {readingTime} min read
                  </div>
                </div>
              </div>
            </div>

            {blog.image && (
              <div className="mt-10 overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-900 shadow-[0_14px_35px_rgba(2,6,23,0.3)]">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-[280px] w-full object-cover md:h-[440px]"
                  referrerPolicy="no-referrer"
                />
                <div className="border-t border-slate-700/70 bg-[linear-gradient(180deg,rgba(30,41,59,0.96),rgba(15,23,42,0.96))] px-4 py-4 md:px-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Share Story</p>
                    <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
                      {shareItems.map((item) => {
                        const Icon = item.icon;

                        if (item.href) {
                          return (
                            <a
                              key={item.label}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              title={item.label}
                              aria-label={item.label}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-sky-400/40 hover:text-sky-300 sm:px-4 sm:py-2.5 sm:text-sm"
                            >
                              <Icon className="h-4 w-4" />
                              <span className="hidden sm:inline">{item.label}</span>
                            </a>
                          );
                        }

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={item.onClick}
                            title={item.label}
                            aria-label={item.label}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-sky-400/40 hover:text-sky-300 sm:px-4 sm:py-2.5 sm:text-sm"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-400/70 to-amber-300/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Article Content</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-400/70 to-amber-300/50" />
            </div>

            <article
              className="blog-prose mt-10 text-[17px] leading-8 text-slate-200"
              dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content available.</p>' }}
            />

            <div className="mt-14 border-t border-slate-700/70 pt-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Continue The Conversation</p>
                  <p className="mt-2 text-base text-slate-400">Need a similar digital publishing or content-led business experience?</p>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Discuss a similar project
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedBlogs.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">More Insights</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-50">Related Articles</h2>
              </div>
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.08)] transition-all hover:border-sky-300/45 hover:bg-sky-400/15 hover:text-sky-200 hover:shadow-[0_0_30px_rgba(56,189,248,0.16)]"
              >
                <span>View all articles</span>
                <ArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedBlogs.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[28px] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(15,23,42,0.96))] shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-48 w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-48 w-full bg-[linear-gradient(135deg,#0f172a,#1e293b)]" />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                    <h3 className="mt-3 line-clamp-2 text-2xl font-black tracking-tight text-slate-50">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-400">
                      {item.meta_description || 'Explore another perspective from Kansan Group.'}
                    </p>
                    <Link
                      to={`/blog/${item.slug}`}
                      className="mt-6 inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-sky-400/40 hover:text-sky-300"
                    >
                      Read article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
