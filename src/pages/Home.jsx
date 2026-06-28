import { BookOpen, BriefcaseBusiness, CircleUserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import clouds from '../assets/zen-clouds.svg';
import BlogCard from '../components/BlogCard.jsx';
import Hero from '../components/Hero.jsx';
import SectionDivider from '../components/SectionDivider.jsx';
import { posts } from '../data/posts.js';

const pathways = [
  {
    title: 'Blog',
    body: 'Thoughts, writeups and perspectives.',
    href: '/blog',
    Icon: BookOpen
  },
  {
    title: 'Experience',
    body: 'Roles, recurring work, and technical focus.',
    href: '/experience',
    Icon: BriefcaseBusiness
  },
  {
    title: 'About',
    body: 'Who am I, beyond the alias.',
    href: '/about',
    Icon: CircleUserRound
  }
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionDivider />
          <motion.figure
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55 }}
            className="relative py-12 text-center"
          >
            <img src={clouds} alt="" className="absolute left-1/2 top-0 w-72 -translate-x-1/2 opacity-30" />
            <blockquote className="mx-auto max-w-2xl font-serif text-3xl leading-tight text-parchment sm:text-4xl">
              “Empty your mind. Be formless, shapeless like water.”
            </blockquote>
            <figcaption className="mt-5 font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">
              Sun Wukong
            </figcaption>
          </motion.figure>

          <div className="grid gap-4 md:grid-cols-3">
            {pathways.map(({ title, body, href, Icon }) => (
              <Link
                key={title}
                to={href}
                className="soft-panel group rounded-lg p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40"
              >
                <Icon className="text-gold" size={22} />
                <h2 className="mt-8 font-serif text-2xl font-semibold">{title}</h2>
                <p className="mt-3 leading-7 text-muted">{body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">Latest Posts</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold">Recent archive entries</h2>
            </div>
            <Link to="/blog" className="text-sm font-medium text-gold">
              View all posts
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="mt-8 border-l border-gold/30 pl-5 text-muted">
              Add markdown posts under <code>src/blogs/post-slug/</code> to populate this archive.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
