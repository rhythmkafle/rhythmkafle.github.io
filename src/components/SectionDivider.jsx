import lotus from '../assets/lotus-icon.svg';

export default function SectionDivider({ label }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8 text-gold-muted">
      <span className="h-px w-16 bg-gold/20" />
      {label ? (
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted">{label}</span>
      ) : (
        <img src={lotus} alt="" className="h-8 w-12 opacity-80" />
      )}
      <span className="h-px w-16 bg-gold/20" />
    </div>
  );
}
