import ExperienceCard from '../components/ExperienceCard.jsx';
import SectionDivider from '../components/SectionDivider.jsx';
import { experience } from '../data/experience.js';

export default function Experience() {
  return (
    <main className="px-5 pb-24 pt-32 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold-muted">Experience</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-none sm:text-7xl">
          Practical work across Cybersecurity.
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-muted">
          A compact view of roles, recurring work, and technical focus areas behind the published notes.
        </p>

        <SectionDivider label="timeline" />

        <div className="max-w-4xl">
          {experience.map((item) => (
            <ExperienceCard key={`${item.role}-${item.organization}`} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
