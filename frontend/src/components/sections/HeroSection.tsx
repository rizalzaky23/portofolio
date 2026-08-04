import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { LanyardScene } from '@/components/three/LanyardScene';
import { FaArrowDown, FaDownload, FaMusic } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const lanyardY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const lanyardOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto flex flex-col justify-center overflow-hidden"
    >
      {/* Subtle Background Lighting Mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Grid: 50/50 Desktop Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Column: Interactive 3D Lanyard */}
        <motion.div
          className="lg:col-span-6 order-2 lg:order-1"
          style={{ y: lanyardY, opacity: lanyardOpacity }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <LanyardScene />
        </motion.div>

        {/* Right Column: Hero Content & Typography */}
        <motion.div
          className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Available for Freelance & Full-time Roles
            </span>
          </div>

          {/* Heading */}
          <div>
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-amber-500 font-bold block mb-2">
              PORTFOLIO
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none font-heading">
              Rizal <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Zaky
              </span>
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-semibold text-slate-300 flex items-center gap-2">
              Software Engineer <HiSparkles className="text-amber-400 inline-block" />
            </p>
          </div>

          {/* Bio Introduction */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
            Passionate about crafting high-performance web systems, creative 3D interfaces, and scalable backend architectures. Handcrafting modern digital experiences with elegance and precision.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-2 group"
            >
              <span>View Projects</span>
              <FaArrowDown className="group-hover:translate-y-0.5 transition-transform" />
            </motion.a>

            <motion.a
              href="/resume.pdf"
              download
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <FaDownload className="text-amber-400" />
              <span>Download Resume</span>
            </motion.a>
          </div>

          {/* Music Status Widget */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 animate-pulse">
              <FaMusic />
            </div>
            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">Currently Listening To</span>
              <span className="font-medium text-slate-300">Lo-Fi Beats • Code & Chill</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.25em] uppercase font-mono">Scroll Down</span>
        <motion.div
          className="w-0.5 h-8 bg-gradient-to-b from-amber-500 to-transparent rounded-full"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
