import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaInstagram, FaDownload } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { aboutService, experienceService, skillService } from '@/services';
import type { About, Experience, Skill } from '@/types';
import { formatDateShort } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const SOCIAL_ICONS = {
  github:    FaGithub,
  linkedin:  FaLinkedin,
  instagram: FaInstagram,
  email:     MdEmail,
};

const MotionDiv = motion.div;

function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-[--color-foreground]">{skill.name}</span>
        <span className="text-xs text-[--color-muted]">{skill.level}%</span>
      </div>
      <div className="h-1 rounded-full bg-[--color-border] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[--color-accent]"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function ExperienceItem({ exp, index }: { exp: Experience; index: number }) {
  return (
    <MotionDiv
      className="relative pl-8 pb-10 last:pb-0"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Timeline line */}
      <div className="absolute left-3 top-2 bottom-0 w-px bg-[--color-border]" />
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center
        ${exp.current ? 'border-[--color-accent] bg-[--color-accent-muted]' : 'border-[--color-border] bg-[--color-surface]'}`}>
        <div className={`w-2 h-2 rounded-full ${exp.current ? 'bg-[--color-accent]' : 'bg-[--color-border]'}`} />
      </div>

      <div className="ml-4">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h4 className="font-semibold text-[--color-foreground]">{exp.position}</h4>
          {exp.current && <Badge variant="accent">Current</Badge>}
        </div>
        <p className="text-[--color-accent] text-sm font-medium mb-1">{exp.company}</p>
        <p className="text-xs text-[--color-muted] mb-3">
          {formatDateShort(exp.startDate)} — {exp.current ? 'Present' : (exp.endDate ? formatDateShort(exp.endDate) : '')}
        </p>
        <p className="text-sm text-[--color-muted] leading-relaxed">{exp.description}</p>
      </div>
    </MotionDiv>
  );
}

export function AboutSection() {
  const [about, setAbout] = useState<About | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
  const [activeSkillCat, setActiveSkillCat] = useState<string>('Frontend');

  useEffect(() => {
    aboutService.get().then((r) => setAbout(r.data.data));
    experienceService.list().then((r) => setExperiences(r.data.data));
    skillService.list().then((r) => {
      const byCat: Record<string, Skill[]> = {};
      r.data.data.forEach((s) => {
        if (!byCat[s.category]) byCat[s.category] = [];
        byCat[s.category].push(s);
      });
      setSkillsByCategory(byCat);
      if (!activeSkillCat && Object.keys(byCat).length) setActiveSkillCat(Object.keys(byCat)[0]);
    });
  }, []);

  const categories = Object.keys(skillsByCategory);

  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container-portfolio">
        {/* Header */}
        <MotionDiv
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-3">About Me</p>
          <h2 className="text-4xl md:text-6xl font-[--font-heading] font-black">
            A developer who<br />
            <span className="gradient-text">loves the craft</span>
          </h2>
        </MotionDiv>

        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Biography + Photo */}
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-[3/4] rounded-[--radius-2xl] overflow-hidden bg-[--color-surface] mb-8 max-w-xs relative">
              {about?.photo ? (
                <img src={about.photo} alt="Rizal Zaky" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[--color-muted]">
                  <span className="text-6xl">👨‍💻</span>
                </div>
              )}
              {/* Accent border */}
              <div className="absolute inset-0 rounded-[--radius-2xl] border-2 border-[--color-accent]/20" />
            </div>

            {/* Social links */}
            <div className="flex gap-4">
              {about?.socialLinks && Object.entries(about.socialLinks).map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS];
                if (!url || !Icon) return null;
                return (
                  <a
                    key={key}
                    href={key === 'email' ? `mailto:${url}` : url}
                    target={key === 'email' ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="p-3 rounded-xl bg-[--color-surface] border border-[--color-border] text-[--color-muted] hover:text-[--color-accent] hover:border-[--color-accent]/50 transition-all duration-[--duration-base]"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </MotionDiv>

          {/* Bio text + download */}
          <MotionDiv
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-lg text-[--color-muted] leading-[1.8] whitespace-pre-line">
                {about?.biography ?? 'Loading...'}
              </p>
            </div>

            {/* Tech stack */}
            {about?.techStack && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-[--color-foreground] mb-3">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {about.techStack.map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}

            {about?.resume && (
              <Button
                variant="outline"
                icon={<FaDownload size={14} />}
                onClick={() => window.open(about.resume!, '_blank')}
              >
                Download CV
              </Button>
            )}
          </MotionDiv>
        </div>

        {/* Skills */}
        <div className="mb-24">
          <p className="section-label mb-4">Skills</p>
          <h3 className="text-2xl font-[--font-heading] font-bold mb-8">Technical Proficiency</h3>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveSkillCat(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-[--duration-base] cursor-pointer
                  ${activeSkillCat === cat
                    ? 'bg-[--color-accent] text-[--color-background]'
                    : 'bg-[--color-surface] text-[--color-muted] border border-[--color-border] hover:border-[--color-accent]/50 hover:text-[--color-foreground]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(skillsByCategory[activeSkillCat] ?? []).map((skill) => (
              <SkillBar key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        {/* Experience Timeline */}
        <div>
          <p className="section-label mb-4">Experience</p>
          <h3 className="text-2xl font-[--font-heading] font-bold mb-12">Work History</h3>
          <div className="max-w-2xl">
            {experiences.map((exp, i) => (
              <ExperienceItem key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
