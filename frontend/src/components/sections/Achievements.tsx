import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdOpenInNew } from 'react-icons/md';
import { FaTrophy, FaMedal, FaAward, FaCertificate } from 'react-icons/fa';
import { achievementService } from '@/services';
import type { Achievement } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const MotionDiv = motion.div;

const CATEGORY_CONFIG = {
  competition:  { icon: FaTrophy,      label: 'Competition', color: 'text-yellow-400' },
  award:        { icon: FaAward,       label: 'Award',       color: 'text-[--color-accent]' },
  scholarship:  { icon: FaMedal,       label: 'Scholarship', color: 'text-blue-400' },
  recognition:  { icon: FaAward,       label: 'Recognition', color: 'text-purple-400' },
  certificate:  { icon: FaCertificate, label: 'Certificate', color: 'text-green-400' },
};

function AchievementCard({ ach, index, onView }: {
  ach: Achievement;
  index: number;
  onView: (a: Achievement) => void;
}) {
  const config = CATEGORY_CONFIG[ach.category];
  const Icon = config?.icon ?? FaAward;

  return (
    <MotionDiv
      className="group relative p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] hover:border-[--color-accent]/40 transition-all duration-[--duration-base] overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[--color-accent-muted] to-transparent pointer-events-none" />

      {/* Certificate thumbnail */}
      {ach.certificateImage && (
        <div className="aspect-[16/9] rounded-[--radius-lg] overflow-hidden mb-4 bg-[--color-background]">
          <img
            src={ach.certificateImage}
            alt={`${ach.title} certificate`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-[--color-background] shrink-0 ${config?.color ?? 'text-[--color-accent]'}`}>
          <Icon size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-[--color-foreground] leading-tight">{ach.title}</h3>
            {ach.featured && <Badge variant="accent" className="shrink-0">Featured</Badge>}
          </div>
          <p className="text-sm text-[--color-accent] font-medium mb-1">{ach.organizer}</p>
          <p className="text-xs text-[--color-muted] mb-3">{formatDate(ach.date, { year: 'numeric', month: 'short' })}</p>
          <p className="text-sm text-[--color-muted] leading-relaxed line-clamp-2 mb-4">{ach.description}</p>

          {(ach.certificateImage || ach.certificatePdf) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<MdOpenInNew size={14} />}
              onClick={() => onView(ach)}
              className="text-xs !px-0 !py-0 gap-1 text-[--color-accent]"
            >
              View Certificate
            </Button>
          )}
        </div>
      </div>
    </MotionDiv>
  );
}

function CertificateModal({ ach, onClose }: { ach: Achievement; onClose: () => void }) {
  return (
    <Modal open title={ach.title} onClose={onClose} size="lg">
      {ach.certificateImage && (
        <img
          src={ach.certificateImage}
          alt={ach.title}
          className="w-full rounded-[--radius-lg] mb-4 border border-[--color-border]"
        />
      )}
      {ach.certificatePdf && (
        <Button
          variant="outline"
          icon={<MdOpenInNew size={14} />}
          onClick={() => window.open(ach.certificatePdf!, '_blank')}
          className="w-full justify-center"
        >
          Open PDF
        </Button>
      )}
    </Modal>
  );
}

export function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selected, setSelected] = useState<Achievement | null>(null);

  useEffect(() => {
    achievementService.list({ limit: 12 }).then((r) => setAchievements(r.data.data));
  }, []);

  return (
    <section id="achievements" className="py-24 md:py-32">
      <div className="container-portfolio">
        <MotionDiv
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-3">Recognition</p>
          <h2 className="text-4xl md:text-6xl font-[--font-heading] font-black">
            Achievements &<br />
            <span className="gradient-text">Awards</span>
          </h2>
        </MotionDiv>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach, i) => (
            <AchievementCard
              key={ach.id}
              ach={ach}
              index={i}
              onView={setSelected}
            />
          ))}
        </div>
      </div>

      {selected && (
        <CertificateModal ach={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
