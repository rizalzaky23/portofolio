import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#projects',     label: 'Projects' },
  { href: '#achievements', label: 'Achievements' },
  { href: '#contact',      label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { navOpen, setNavOpen } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setNavOpen(false), [location, setNavOpen]);

  const handleNavClick = (href: string) => {
    setNavOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-500',
          scrolled ? 'glass border-b border-[--color-border]/50 py-3' : 'py-5',
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="container-portfolio flex items-center justify-between" aria-label="Main navigation">
          {/* Logo */}
          <Link
            to="/"
            className="font-[--font-heading] font-bold text-xl tracking-tight hover:text-[--color-accent] transition-colors duration-[--duration-base]"
          >
            RZ<span className="text-[--color-accent]">.</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[--duration-base] cursor-pointer"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/admin"
                className="text-sm px-4 py-2 rounded-lg border border-[--color-border] text-[--color-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-all duration-[--duration-base]"
              >
                CMS
              </Link>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[--color-muted] hover:text-[--color-foreground] transition-colors cursor-pointer"
            onClick={() => setNavOpen(!navOpen)}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
          >
            {navOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="fixed inset-0 z-30 glass pt-24 px-6"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <ul className="flex flex-col gap-6" role="list">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-3xl font-[--font-heading] font-bold text-[--color-foreground] hover:text-[--color-accent] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
