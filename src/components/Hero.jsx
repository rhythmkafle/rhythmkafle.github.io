import { motion } from 'framer-motion';
import hero from '../assets/hero-buddha-enso.webp';
import staff from '../assets/wukong-staff.svg';

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center px-5 pb-14 pt-28 sm:px-8">
      <img
        src={staff}
        alt=""
        className="absolute left-1/2 top-28 w-52 -translate-x-1/2 opacity-24 sm:top-32 sm:w-72"
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="mx-auto max-w-4xl text-center"
      >
        <img
          src={hero}
          alt="Buddha silhouette inside an Ensō circle"
          className="mx-auto aspect-square w-60 rounded-full object-cover object-center opacity-95 drop-shadow-glow sm:w-80"
        />
        <h1 className="mt-4 font-serif text-6xl font-semibold leading-none text-parchment sm:text-8xl">
          404Buddha
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
          Security Researcher. Seeker. Breaker of Limits.
        </p>
      </motion.div>
    </section>
  );
}
