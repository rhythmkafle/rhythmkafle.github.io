import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo-404buddha.svg';

const links = [
  { label: 'Blog', to: '/blog' },
  { label: 'Experience', to: '/experience' },
  { label: 'About', to: '/about' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) =>
    `text-sm transition ${isActive ? 'text-gold' : 'text-muted hover:text-parchment'}`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gold/10 bg-ink/84 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="404Buddha logo" className="h-10 w-10" />
          <span className="font-serif text-xl font-semibold tracking-normal">404Buddha</span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-gold/20 text-gold md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-gold/10 bg-panel px-5 py-5 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
