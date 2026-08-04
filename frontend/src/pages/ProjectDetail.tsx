import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import { projectService } from '@/services';
import type { Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatDate } from '@/lib/utils';

const MotionDiv = motion.div;

const SECTIONS = [
  { key: 'description',  label: 'Overview' },
  { key: 'problem',      label: 'Problem' },
  { key: 'solution',     label: 'Solution' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'challenges',   label: 'Challenges' },
  { key: 'lessons',      label: 'Lessons Learned' },
] as const;

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('description');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    projectService.get(slug).then((r) => {
      setProject(r.data.data);
      setActiveImage(r.data.data.coverImage);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--color-background] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[--color-background] flex flex-col items-center justify-center gap-4 text-[--color-muted]">
        <p className="text-xl">Project not found.</p>
        <Link to="/" className="text-[--color-accent] hover:underline">← Back to portfolio</Link>
      </div>
    );
  }

  const techStack = Array.isArray(project.techStack)
    ? project.techStack
    : JSON.parse(project.techStack as unknown as string ?? '[]');

  const gallery = [
    ...(project.coverImage ? [{ url: project.coverImage, alt: project.title }] : []),
    ...(project.images ?? []),
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[--color-background] pt-24">
        {/* Hero */}
        <div className="container-portfolio py-12">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/#projects"
              className="inline-flex items-center gap-2 text-sm text-[--color-muted] hover:text-[--color-foreground] transition-colors mb-8"
            >
              <FaArrowLeft size={12} />
              Back to Projects
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="default">{project.year}</Badge>
                  {project.featured && <Badge variant="accent">Featured</Badge>}
                </div>
                <h1 className="text-4xl md:text-6xl font-[--font-heading] font-black">{project.title}</h1>
              </div>

              <div className="flex gap-3">
                {project.githubUrl && (
                  <Button
                    variant="secondary"
                    icon={<FaGithub size={16} />}
                    onClick={() => window.open(project.githubUrl!, '_blank')}
                  >
                    GitHub
                  </Button>
                )}
                {project.demoUrl && (
                  <Button
                    variant="primary"
                    icon={<FaExternalLinkAlt size={14} />}
                    onClick={() => window.open(project.demoUrl!, '_blank')}
                  >
                    Live Demo
                  </Button>
                )}
              </div>
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech: string) => (
                <Badge key={tech} variant="accent">{tech}</Badge>
              ))}
            </div>
          </MotionDiv>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="container-portfolio pb-12">
            <MotionDiv
              className="aspect-[16/9] rounded-[--radius-2xl] overflow-hidden bg-[--color-surface] border border-[--color-border] mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              {activeImage && (
                <img
                  src={activeImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              )}
            </MotionDiv>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`shrink-0 w-20 h-14 rounded-[--radius-lg] overflow-hidden border-2 transition-all cursor-pointer
                      ${activeImage === img.url ? 'border-[--color-accent]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content tabs */}
        <div className="container-portfolio pb-24">
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[--color-border] pb-4">
            {SECTIONS.filter((s) => project[s.key]).map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${activeSection === s.key
                    ? 'bg-[--color-accent] text-[--color-background]'
                    : 'text-[--color-muted] hover:text-[--color-foreground]'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <MotionDiv
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl prose prose-invert prose-p:text-[--color-muted] prose-p:leading-[1.8] prose-headings:font-[--font-heading]"
          >
            <p className="text-lg text-[--color-muted] leading-[1.8] whitespace-pre-line">
              {project[activeSection as keyof Project] as string}
            </p>
          </MotionDiv>
        </div>
      </main>
      <Footer />
    </>
  );
}
