import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdEmail, MdArrowUpward } from 'react-icons/md';

const SOCIAL_LINKS = [
  { icon: FaGithub,    href: 'https://github.com/rizalzaky',          label: 'GitHub' },
  { icon: FaLinkedin,  href: 'https://linkedin.com/in/rizalzaky',    label: 'LinkedIn' },
  { icon: FaInstagram, href: 'https://instagram.com/rizalzaky',       label: 'Instagram' },
  { icon: MdEmail,     href: 'mailto:hello@rizalzaky.dev',            label: 'Email' },
];

const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#projects',     label: 'Projects' },
  { href: '#achievements', label: 'Achievements' },
  { href: '#contact',      label: 'Contact' },
];

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="border-t border-[--color-border] bg-[--color-background]">
      <div className="container-portfolio py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <p className="font-[--font-heading] font-bold text-xl">
              RZ<span className="text-[--color-accent]">.</span>
            </p>
            <p className="text-sm text-[--color-muted] mt-1">
              Building elegant digital experiences.
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6 justify-center">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors duration-[--duration-base]"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials + Back to top */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 text-[--color-muted] hover:text-[--color-accent] transition-colors duration-[--duration-base] cursor-pointer"
              >
                <Icon size={18} />
              </a>
            ))}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="ml-2 p-2 rounded-lg border border-[--color-border] text-[--color-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-all duration-[--duration-base] cursor-pointer"
            >
              <MdArrowUpward size={18} />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[--color-muted]/60 mt-10">
          © {new Date().getFullYear()} Rizal Zaky. Crafted with ♥ using React, Three.js & lots of coffee.
        </p>
      </div>
    </footer>
  );
}
