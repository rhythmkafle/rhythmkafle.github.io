import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogCard({ post }) {
  return (
    <article className="soft-panel rounded-lg p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40">
      <div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
        <span className="text-gold">{post.category}</span>
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <h2 className="font-serif text-2xl font-semibold leading-tight text-parchment">
        <Link to={`/blog/${post.slug}`} className="hover:text-gold">
          {post.title}
        </Link>
      </h2>
      <p className="mt-4 leading-7 text-muted">{post.excerpt}</p>
      <Link
        to={`/blog/${post.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold"
      >
        Read entry <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}
