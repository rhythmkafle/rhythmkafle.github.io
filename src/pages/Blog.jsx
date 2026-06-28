import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import BlogCard from '../components/BlogCard.jsx';
import { categories, posts } from '../data/posts.js';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === 'All' || post.category === category;
      const matchesQuery =
        !normalized ||
        [post.title, post.excerpt, post.category].some((value) => value.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <main className="px-5 pb-24 pt-32 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">Blog</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-none sm:text-7xl">
          Field notes from quiet offensive research.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-muted">
          Writeups, experiments, and perspectives across identity, web security, malware, detection, and exploit research.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="soft-panel flex h-12 items-center gap-3 rounded-lg px-4">
            <Search size={17} className="text-gold-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
              className="w-full bg-transparent text-sm text-parchment outline-none placeholder:text-muted"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.length > 1 &&
              categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`h-12 rounded border px-4 font-mono text-xs transition ${
                    category === item
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-gold/15 text-muted hover:border-gold/35 hover:text-parchment'
                  }`}
                >
                  {item}
                </button>
              ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="mt-12 border-l border-gold/30 pl-5 text-muted">
            No entries found. Add a markdown file inside <code>src/blogs/post-slug/</code> to publish one.
          </p>
        )}
      </section>
    </main>
  );
}
