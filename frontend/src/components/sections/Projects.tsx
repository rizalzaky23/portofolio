import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { MdSearch, MdFilterList } from 'react-icons/md';
import { projectService } from '@/services';
import type { Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const MotionDiv = motion.div;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const techStack = Array.isArray(project.techStack)
    ? project.techStack
    : JSON.parse(project.techStack as unknown as string ?? '[]');

  return (
    <MotionDiv
      className="group relative rounded-[--radius-xl] overflow-hidden bg-[--color-surface] border border-[--color-border] cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Cover image */}
      <div className="aspect-[16/9] overflow-hidden bg-[--color-background] relative">
        {project.coverImage ? (
          <motion.img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">{'</>'}</div>
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0 bg-[--color-background]/80 backdrop-blur-sm flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-xl glass text-[--color-foreground] hover:text-[--color-accent] transition-colors"
                  aria-label="View on GitHub"
                >
                  <FaGithub size={20} />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-xl glass text-[--color-foreground] hover:text-[--color-accent] transition-colors"
                  aria-label="View live demo"
                >
                  <FaExternalLinkAlt size={18} />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {project.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="accent">Featured</Badge>
          </div>
        )}
      </div>

      {/* Card body */}
      <Link to={`/projects/${project.slug}`} className="block p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-[--font-heading] font-bold text-lg text-[--color-foreground] leading-tight group-hover:text-[--color-accent] transition-colors duration-[--duration-base]">
            {project.title}
          </h3>
          <span className="text-xs text-[--color-muted] shrink-0">{project.year}</span>
        </div>

        <p className="text-sm text-[--color-muted] leading-relaxed mb-4 line-clamp-2">
          {project.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {techStack.slice(0, 4).map((tech: string) => (
            <Badge key={tech} variant="default" className="text-xs">{tech}</Badge>
          ))}
          {techStack.length > 4 && (
            <Badge variant="default" className="text-xs">+{techStack.length - 4}</Badge>
          )}
        </div>
      </Link>
    </MotionDiv>
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { status: 'PUBLISHED', limit: 24 };
    if (activeCategory !== 'All') params.category = activeCategory;
    if (search) params.search = search;
    const r = await projectService.list(params);
    setProjects(r.data.data);
    setLoading(false);
  }, [activeCategory, search]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  // Extract categories on first load
  useEffect(() => {
    projectService.list({ status: 'PUBLISHED', limit: 100 }).then((r) => {
      const cats = [...new Set(r.data.data.map((p) => p.category))];
      setCategories(cats);
    });
  }, []);

  return (
    <section id="projects" className="py-24 md:py-32 bg-[--color-slate-950]">
      <div className="container-portfolio">
        {/* Header */}
        <MotionDiv
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-3">Selected Work</p>
          <h2 className="text-4xl md:text-6xl font-[--font-heading] font-black">
            Projects &<br />
            <span className="gradient-text">Experiments</span>
          </h2>
        </MotionDiv>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
            <input
              type="search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] placeholder-[--color-muted] focus:outline-none focus:border-[--color-accent] transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-[--duration-base] cursor-pointer
                  ${activeCategory === cat
                    ? 'bg-[--color-accent] text-[--color-background]'
                    : 'bg-[--color-surface] text-[--color-muted] border border-[--color-border] hover:text-[--color-foreground]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="spinner" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-[--color-muted]">
            <p className="text-lg">No projects found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
