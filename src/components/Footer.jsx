import logo from '../assets/logo-404buddha.svg';
import { socials } from '../data/socials.js';

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9" />
          <div>
            <p className="font-serif text-lg">404Buddha</p>
            <p className="text-sm text-muted">© 2026 Quiet research archive.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-gold/15 text-muted transition hover:border-gold/45 hover:text-gold"
            >
              <Icon size={17} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
