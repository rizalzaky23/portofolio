import { motion } from "framer-motion";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Star,
} from "lucide-react";

interface EducationEvent {
  year: string;
  title: string;
  organization: string;
  degree?: string;
  skills: string[];
  logo: string;
}

const educationEvents: EducationEvent[] = [
  {
    year: "2025 – Sekarang",
    title: "Universitas Pembangunan Nasional Veteran Yogyakarta",
    degree: "Bachelor of Computer Science, Information Systems",
    organization: "UPN Veteran Yogyakarta",
    skills: ["Analytical Skills", "Information Systems", "Web Development", "Database Management"],
    logo: "/images/schools/upn-veteran.png",
  },
  {
    year: "2021 – 2025",
    title: "SMK Negeri 2 Klaten",
    degree: "Sistem Informatika Jaringan & Aplikasi",
    organization: "SMK Negeri 2 Klaten",
    skills: ["Networking", "MySQL", "Cloud (AWS / Azure)", "Programming"],
    logo: "/images/schools/smkn2-klaten.jpg",
  },
  {
    year: "2018 – 2021",
    title: "SMP Negeri 2 Klaten",
    organization: "SMP Negeri 2 Klaten",
    skills: ["Social Skills", "Problem Solving", "Mathematics"],
    logo: "/images/schools/smpn2-klaten.png",
  },
];

export const EducationSection = () => {
  return (
    <section id="experience" className="max-w-5xl mx-auto px-6 py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <GraduationCap className="w-3.5 h-3.5" />
          Education
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Experience & <span className="text-gradient-primary">Education</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The educational journey that has shaped me.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line — Desktop (center) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-transparent hidden md:block" />
        {/* Vertical Line — Mobile (left) */}
        <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-transparent md:hidden" />

        {/* Traveling Dot Animation — Desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] hidden md:block overflow-hidden pointer-events-none">
          <div className="traveling-dot" />
        </div>
        {/* Traveling Dot Animation — Mobile */}
        <div className="absolute left-[18px] top-0 bottom-0 w-[2px] md:hidden overflow-hidden pointer-events-none">
          <div className="traveling-dot" />
        </div>

        <div className="space-y-0">
          {educationEvents.map((event, i) => {
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
                className="relative pb-12 last:pb-0"
              >
                {/* Timeline Node — Desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 top-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.4, type: "spring", stiffness: 300 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/20 animate-ping-slow" />
                    <div className="w-14 h-14 rounded-full bg-background border-[3px] border-primary/60 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] relative z-10 overflow-hidden p-1.5">
                      <img src={event.logo} alt={event.organization} className="w-full h-full object-contain" />
                    </div>
                  </motion.div>
                </div>

                {/* Timeline Node — Mobile */}
                <div className="md:hidden absolute left-[18px] -translate-x-1/2 z-10 top-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.4, type: "spring", stiffness: 300 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="absolute inset-0 w-10 h-10 rounded-full bg-primary/20 animate-ping-slow" />
                    <div className="w-10 h-10 rounded-full bg-background border-[3px] border-primary/60 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] relative z-10 overflow-hidden p-1">
                      <img src={event.logo} alt={event.organization} className="w-full h-full object-contain" />
                    </div>
                  </motion.div>
                </div>

                {/* Card Container */}
                <div
                  className={`flex md:items-start ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div className={`${isLeft ? "md:pr-12" : "md:pl-12"}`}>
                      <motion.div
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="glass-panel p-6 md:p-7 rounded-[1.75rem] border border-foreground/10 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
                      >
                        {/* Ambient glow on hover */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-primary/15" />

                        {/* Year Badge */}
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-bold">
                            <Calendar className="w-3 h-3" />
                            {event.year}
                          </span>
                        </div>

                        {/* Institution Logo + Name */}
                        <div className="flex items-start gap-3 mb-3 relative z-10">
                          <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/10 border border-border/30 flex items-center justify-center shrink-0 mt-0.5 p-1.5 shadow-sm">
                            <img src={event.logo} alt={event.organization} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-tight">
                              {event.title}
                            </h3>
                            {event.degree && (
                              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-primary/60" />
                                {event.degree}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
                          <Star className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                          {event.skills.map((skill, j) => (
                            <span
                              key={j}
                              className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-foreground/5 text-muted-foreground border border-foreground/10 hover:border-primary/30 hover:text-primary transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes traveling {
          0% {
            top: -20px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        .traveling-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 12px 4px rgba(139, 92, 246, 0.6), 0 0 24px 8px rgba(139, 92, 246, 0.3);
          animation: traveling 3.5s ease-in-out infinite;
        }

        .traveling-dot::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(139, 92, 246, 0.5), transparent);
          border-radius: 1px;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />
    </section>
  );
};
