import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { posts } from '../data/posts.js';
import NotFound from './NotFound.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return <NotFound />;
  }

  const headings = Array.from(post.content.matchAll(/^##\s+(.+)$/gm)).map((match) => ({
    title: match[1],
    id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }));

  return (
    <main className="px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_220px]">
        <article className="max-w-[760px]">
          <Link to="/blog" className="mb-10 inline-flex items-center gap-2 text-sm text-gold">
            <ArrowLeft size={15} /> Back to blog
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">{post.category}</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-none sm:text-7xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs text-muted">
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
          <div className="prose-article mt-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} rehypeRaw>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {headings.length > 0 && (
          <aside className="sticky top-28 hidden h-fit border-l border-gold/15 pl-5 lg:block">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-gold-muted">Contents</p>
            <nav className="flex flex-col gap-3">
              {headings.map((heading) => (
                <a key={heading.id} href={`#${heading.id}`} className="text-sm leading-6 text-muted hover:text-gold">
                  {heading.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </main>
  );
}
