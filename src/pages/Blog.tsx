import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            News, articles, and updates from across the Kansan Group.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading blogs...</div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <article key={blog.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{blog.meta_description}</p>
                  <Link to={`/blog/${blog.slug}`} className="text-blue-600 font-medium hover:text-blue-800 mt-auto">
                    Read more &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No blog posts published yet.
          </div>
        )}
      </div>
    </div>
  );
}
