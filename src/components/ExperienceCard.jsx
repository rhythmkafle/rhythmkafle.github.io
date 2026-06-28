import { ArrowUpRight } from 'lucide-react';

export default function ExperienceCard({ item }) {
  return (
    <article className="grid gap-4 md:grid-cols-[160px_1fr] md:gap-8">
      <div className="pt-1 font-mono text-xs uppercase tracking-[0.2em] text-gold-muted md:text-right">
        {item.period}
      </div>

      <div className="relative border-l border-gold/20 pl-6 pb-10 last:pb-0 md:pl-8">
        <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-gold bg-ink shadow-[0_0_0_6px_rgba(199,161,91,0.08)]" />
        <div className="soft-panel rounded-lg p-6 transition duration-300 hover:border-gold/40">
          <h2 className="font-serif text-2xl font-semibold leading-tight">{item.role}</h2>
          <p className="mt-2 text-sm font-medium text-gold">{item.organization}</p>
          <p className="mt-4 leading-7 text-muted">{item.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded border border-gold/15 px-3 py-1 font-mono text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
          {item.link && (
            <a href={item.link} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold">
              View details <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
