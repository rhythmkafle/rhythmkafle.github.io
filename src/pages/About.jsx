import { Mail, ShieldCheck, Terminal, Waypoints } from 'lucide-react';
import { socials } from '../data/socials.js';

const interests = [
  'Active Directory',
  'Web exploitation',
  'Malware development',
  'Detection engineering',
];

export default function About() {
  return (
    <main className="px-5 pb-24 pt-32 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">About</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-none sm:text-7xl">
          Hello hackers, 
        </h1>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="soft-panel rounded-lg p-7">
            <p className="text-lg leading-8 text-parchment">
              My name is Rhythm Babu Kafle. I like to portray myself as a security researcher focused on both offensive and defensive. believe it is necessary to understand how both sides of the coin works.
            </p>
            <p className="mt-6 leading-8 text-muted">
              I have experience as a Security Analyst and a penetration tester. Contact me here:
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded border border-gold/15 px-4 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-gold"
                >
                  <Icon size={16} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <section className="border-l border-gold/20 pl-6">
              <Waypoints className="mb-4 text-gold" size={22} />
              <h2 className="font-serif text-3xl font-semibold">Philosophy</h2>
              <p className="mt-3 leading-8 text-muted">
              Be curious, not judgemental
              </p>
            </section>
            <section className="border-l border-gold/20 pl-6">
              <ShieldCheck className="mb-4 text-gold" size={22} />
              <h2 className="font-serif text-3xl font-semibold">Research Interests</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((item) => (
                  <span key={item} className="rounded border border-gold/15 px-3 py-1.5 text-sm text-muted">
                    {item}
                  </span>
                ))}
              </div>
            </section>
            <section className="border-l border-gold/20 pl-6">
              <Terminal className="mb-4 text-gold" size={22} />
              <h2 className="font-serif text-3xl font-semibold">Contact</h2>
              <a href="mailto:kafle.babu.rhythm@gmail.com" className="mt-3 inline-flex items-center gap-2 text-gold">
                <Mail size={16} /> kafle.babu.rhythm@gmail.com
              </a>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
