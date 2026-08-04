import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { LanyardScene } from '@/components/three/LanyardScene';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AboutSection } from '@/components/sections/About';
import { ProjectsSection } from '@/components/sections/Projects';
import { AchievementsSection } from '@/components/sections/Achievements';
import { ContactSection } from '@/components/sections/Contact';
import { useUIStore } from '@/store/uiStore';

const MotionMain = motion.main;

export default function HomePage() {
  const lanyardDone = useUIStore((s) => s.lanyardDone);

  return (
    <>
      {/* Immersive lanyard intro */}
      <LanyardScene />

      {/* Portfolio content (sits under lanyard, revealed on scroll) */}
      <div
        style={{
          paddingTop: lanyardDone ? 0 : '100vh',
          transition: 'padding-top 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Navbar />

        <MotionMain
          initial={{ opacity: 0 }}
          animate={{ opacity: lanyardDone ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <AboutSection />
          <ProjectsSection />
          <AchievementsSection />
          <ContactSection />
        </MotionMain>

        {lanyardDone && <Footer />}
      </div>
    </>
  );
}
