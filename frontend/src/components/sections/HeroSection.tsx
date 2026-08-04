import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { LanyardScene } from '@/components/three/LanyardScene';
import { FaArrowRight, FaDownload, FaChevronDown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

// ─── Magnetic Button ──────────────────────────────────────────────────────────
interface MagneticProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  download?: boolean;
}

function MagneticLink({ href, className = '', style, children, download }: MagneticProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 380, damping: 24 });
  const sy = useSpring(y, { stiffness: 380, damping: 24 });

  const onMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width  / 2) * 0.25);
    y.set((e.clientY - r.top  - r.height / 2) * 0.25);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      href={href}
      download={download}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ─── Decorative: Left Vase + Branches ─────────────────────────────────────────
function LeftDecor() {
  return (
    <div
      className="absolute left-0 bottom-0 w-[200px] pointer-events-none select-none"
      style={{ zIndex: 2 }}
      aria-hidden
    >
      <svg viewBox="0 0 200 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dried branches */}
        <path d="M100 260 Q80 200 50 140 Q30 100 10 60" stroke="#1E2535" strokeWidth="2" strokeLinecap="round" />
        <path d="M100 260 Q120 190 145 130 Q160 90 175 50" stroke="#1A2030" strokeWidth="2" strokeLinecap="round" />
        <path d="M100 260 Q90 210 70 170 Q50 130 35 80" stroke="#1C2335" strokeWidth="1.5" strokeLinecap="round" />
        {/* Small twigs */}
        <path d="M60 160 Q40 150 25 130" stroke="#1A2030" strokeWidth="1" strokeLinecap="round" />
        <path d="M140 150 Q158 138 168 115" stroke="#1A2030" strokeWidth="1" strokeLinecap="round" />
        <path d="M75 200 Q55 195 42 180" stroke="#181E2C" strokeWidth="1" strokeLinecap="round" />
        <path d="M120 210 Q138 200 148 185" stroke="#181E2C" strokeWidth="1" strokeLinecap="round" />
        {/* Tiny offshoots */}
        <path d="M45 140 Q35 128 28 115" stroke="#161C28" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M155 120 Q165 107 170 93" stroke="#161C28" strokeWidth="0.8" strokeLinecap="round" />

        {/* Vase body */}
        <path
          d="M62 400 Q48 380 45 340 Q40 300 55 275 Q70 250 100 248 Q130 250 145 275 Q160 300 155 340 Q152 380 138 400 Z"
          fill="url(#vaseGradL)"
        />
        {/* Vase neck */}
        <path d="M78 248 Q100 236 122 248" stroke="url(#vaseBorderL)" strokeWidth="2" fill="none" />
        {/* Vase highlight */}
        <path
          d="M70 320 Q65 295 72 270"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Vase bottom ellipse */}
        <ellipse cx="100" cy="400" rx="38" ry="7" fill="rgba(0,0,0,0.35)" />

        {/* Shadows under vase */}
        <ellipse cx="100" cy="407" rx="55" ry="8" fill="rgba(0,0,0,0.2)" />

        <defs>
          <linearGradient id="vaseGradL" x1="45" y1="248" x2="165" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A2235" />
            <stop offset="50%" stopColor="#242D42" />
            <stop offset="100%" stopColor="#131826" />
          </linearGradient>
          <linearGradient id="vaseBorderL" x1="78" y1="248" x2="122" y2="248" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Decorative: Right Books + Lamp ──────────────────────────────────────────
function RightDecor() {
  return (
    <div
      className="absolute right-0 bottom-0 w-[260px] pointer-events-none select-none"
      style={{ zIndex: 2 }}
      aria-hidden
    >
      {/* Warm lamp glow on wall */}
      <div
        className="absolute"
        style={{
          right: 60,
          bottom: 200,
          width: 260,
          height: 260,
          background: 'radial-gradient(ellipse at 60% 70%, rgba(232,160,48,0.16) 0%, rgba(232,160,48,0.06) 40%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      <svg viewBox="0 0 260 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lamp glow halo */}
        <ellipse cx="190" cy="148" rx="55" ry="35" fill="rgba(232,160,48,0.18)" />
        <ellipse cx="190" cy="148" rx="32" ry="20" fill="rgba(255,200,80,0.22)" />

        {/* Lamp shade */}
        <path d="M155 160 L170 110 L210 110 L225 160 Z" fill="url(#shadeGrad)" />
        <path d="M155 160 L225 160" stroke="rgba(255,200,100,0.2)" strokeWidth="1" />
        {/* Shade top rim */}
        <path d="M168 110 L212 110" stroke="rgba(255,200,80,0.35)" strokeWidth="2" />
        {/* Lamp bulb glow */}
        <ellipse cx="190" cy="148" rx="8" ry="6" fill="rgba(255,220,100,0.9)" />

        {/* Lamp pole */}
        <rect x="187" y="160" width="6" height="220" fill="url(#poleGrad)" rx="2" />
        {/* Lamp base */}
        <path d="M165 380 Q190 374 215 380 L220 390 Q190 398 160 390 Z" fill="url(#baseGrad)" />
        <ellipse cx="190" cy="390" rx="30" ry="6" fill="rgba(0,0,0,0.3)" />

        {/* Books stack */}
        {/* Book 3 (bottom) */}
        <rect x="20" y="354" width="120" height="22" rx="2" fill="#1B2740" />
        <rect x="20" y="354" width="8" height="22" rx="1" fill="#243254" />
        <rect x="132" y="355" width="1" height="20" fill="rgba(255,255,255,0.04)" />
        {/* Book 2 */}
        <rect x="24" y="332" width="112" height="22" rx="2" fill="#15232E" />
        <rect x="24" y="332" width="8" height="22" rx="1" fill="#1B2E3C" />
        {/* Book 1 (top) */}
        <rect x="28" y="312" width="100" height="20" rx="2" fill="#1E1A2E" />
        <rect x="28" y="312" width="8" height="20" rx="1" fill="#282440" />
        {/* Book spine highlights */}
        <line x1="23" y1="333" x2="23" y2="355" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <line x1="27" y1="313" x2="27" y2="332" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        {/* Shadow under books */}
        <ellipse cx="84" cy="378" rx="70" ry="7" fill="rgba(0,0,0,0.22)" />

        {/* Small vase */}
        <path
          d="M30 312 Q18 295 20 275 Q22 250 40 242 Q58 250 60 275 Q62 295 50 312 Z"
          fill="url(#smallVaseGrad)"
        />
        <ellipse cx="40" cy="313" rx="20" ry="4" fill="rgba(0,0,0,0.3)" />

        <defs>
          <linearGradient id="shadeGrad" x1="155" y1="110" x2="225" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8A830" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#92510A" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="poleGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#1A1F2C" />
            <stop offset="50%" stopColor="#2A3040" />
            <stop offset="100%" stopColor="#111520" />
          </linearGradient>
          <linearGradient id="baseGrad" x1="160" y1="380" x2="220" y2="395" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A1F2C" />
            <stop offset="100%" stopColor="#0D1018" />
          </linearGradient>
          <linearGradient id="smallVaseGrad" x1="18" y1="242" x2="62" y2="314" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1C2840" />
            <stop offset="100%" stopColor="#0E1421" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const lanyardY       = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const lanyardOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY       = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6],  [1, 0]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen overflow-hidden flex flex-col justify-center"
    >
      {/* ── Layer 1: Deep navy base ─────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: '#07080F' }} />

      {/* ── Layer 2: Subtle dot-grid texture ───────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.028) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Layer 3: Vignette ───────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* ── Layer 4: Left cool ambient fill ────────────────────────────────── */}
      <div
        className="absolute left-0 top-0 w-2/5 h-3/4 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 0% 10%, rgba(90,110,180,0.055) 0%, transparent 65%)',
        }}
      />

      {/* ── Layer 5: Right warm lamp key light ─────────────────────────────── */}
      <div
        className="absolute right-0 bottom-0 w-1/2 h-4/5 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 90% 85%, rgba(232,160,48,0.13) 0%, rgba(200,120,30,0.05) 35%, transparent 60%)',
        }}
      />

      {/* ── Layer 6: Very subtle film grain (CSS SVG filter) ─────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.028]" aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Layer 7: Decorative objects ─────────────────────────────────────── */}
      <LeftDecor />
      <RightDecor />

      {/* ── Wooden tabletop edge ────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[52px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #0E1018 40%, #0A0C12 100%)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[24px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.012) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.012) 70%, rgba(255,255,255,0.025) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.055)',
        }}
      />

      {/* ── Main Content Grid ────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-16 pt-24 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center min-h-[calc(100vh-140px)]">

          {/* ── Left: Interactive Lanyard (40%) ─────────────────────────────── */}
          <motion.div
            className="lg:col-span-5 order-2 lg:order-1 flex items-center justify-center"
            style={{ y: lanyardY, opacity: lanyardOpacity }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            <LanyardScene />
          </motion.div>

          {/* ── Right: Portfolio Content (60%) ─────────────────────────────── */}
          <motion.div
            className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-start gap-7"
            style={{ y: contentY, opacity: contentOpacity }}
          >

            {/* Availability Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border"
              style={{
                background: 'rgba(10,15,26,0.85)',
                borderColor: 'rgba(245,158,11,0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Available for Freelance & Full-time
              </span>
            </motion.div>

            {/* Heading Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="block text-[11px] font-mono tracking-[0.32em] uppercase mb-3"
                style={{ color: '#C97E3A' }}
              >
                Portfolio
              </span>

              <h1
                className="font-heading font-black leading-none tracking-tight"
                style={{ fontSize: 'clamp(3.4rem, 7vw, 6.2rem)', letterSpacing: '-0.03em' }}
              >
                <span
                  className="block"
                  style={{ color: '#ECE8E0' }}
                >
                  Rizal
                </span>
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(125deg, #D97706 0%, #F59E0B 38%, #FCD34D 60%, #E8A830 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Zaky
                </span>
              </h1>

              <p
                className="mt-4 flex items-center gap-2.5 font-semibold"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#8B9CB0' }}
              >
                Software Engineer
                <HiSparkles style={{ color: '#F59E0B' }} />
              </p>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="leading-relaxed max-w-[480px]"
              style={{ color: '#6B7A90', fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)' }}
            >
              Crafting high-performance web systems, immersive 3D interfaces, and scalable
              backend architectures — with precision and elegance.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              {/* Primary CTA */}
              <MagneticLink
                href="#projects"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                  color: '#0A0C12',
                  boxShadow: '0 4px 24px rgba(245,158,11,0.22), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <span>View Projects</span>
                <FaArrowRight
                  className="text-xs transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </MagneticLink>

              {/* Secondary CTA */}
              <MagneticLink
                href="/resume.pdf"
                download
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm border transition-all duration-300"
                style={{
                  background: 'rgba(10,14,22,0.85)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                }}
              >
                <FaDownload className="text-xs" style={{ color: '#F59E0B' }} />
                <span>Download Resume</span>
              </MagneticLink>
            </motion.div>

            {/* Tech Stack Pills */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-2"
            >
              {['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'R3F'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-medium border"
                  style={{
                    background: 'rgba(15,22,38,0.7)',
                    borderColor: 'rgba(255,255,255,0.07)',
                    color: '#556070',
                  }}
                >
                  {tech}
                </span>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span
          className="text-[10px] tracking-[0.28em] uppercase font-mono"
          style={{ color: '#3A4455' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: '#C97E3A' }}
        >
          <FaChevronDown className="text-xs" />
        </motion.div>
      </motion.div>
    </section>
  );
}
