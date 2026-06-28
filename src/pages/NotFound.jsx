import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import mark from '../assets/404-mark.svg';
import clouds from '../assets/zen-clouds.svg';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 pb-20 pt-32 text-center sm:px-8">
      <img src={clouds} alt="" className="absolute left-1/2 top-28 w-80 -translate-x-1/2 opacity-20" />
      <section className="mx-auto max-w-2xl">
        <img src={mark} alt="404 mark with cloud motif" className="mx-auto w-72" />
        <h1 className="mt-6 font-serif text-5xl font-semibold sm:text-7xl">The path you seek does not exist.</h1>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-2 rounded border border-gold/25 px-5 py-3 text-sm text-gold transition hover:border-gold/60"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
      </section>
    </main>
  );
}
