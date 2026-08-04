import { motion } from 'framer-motion';
import { HeroSection } from '@/components/sections/HeroSection';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AboutSection } from '@/components/sections/About';
import { ProjectsSection } from '@/components/sections/Projects';
import { AchievementsSection } from '@/components/sections/Achievements';
import { ContactSection } from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <Navbar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <AchievementsSection />
        <ContactSection />
      </motion.main>

      <Footer />
    </div>
  );
}
