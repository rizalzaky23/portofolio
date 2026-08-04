import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdRestore, MdSearch, MdStar, MdStarBorder } from 'react-icons/md';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { projectService } from '@/services';
import type { Project } from '@/types';
import { CMSLayout } from '../Layout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, slugify } from '@/lib/utils';

const statusVariant = {
  PUBLISHED: 'success',
  DRAFT:     'warning',
  ARCHIVED:  'default',
} as const;

export default function CMSProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: 12 };
    if (search) params.search = search;
    if (status) params.status = status;
    const r = await projectService.list(params);
    setProjects(r.data.data);
    setTotal(r.data.meta?.total ?? 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm('Move this project to trash?')) return;
    setDeleting(id);
    await projectService.delete(id);
    await loadProjects();
    setDeleting(null);
  };

  const handleRestore = async (id: string) => {
    setRestoring(id);
    await projectService.restore(id);
    await loadProjects();
    setRestoring(null);
  };

  const handleToggleFeatured = async (project: Project) => {
    await projectService.update(project.id, { featured: !project.featured });
    await loadProjects();
  };

  const handleToggleStatus = async (project: Project) => {
    const next = project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await projectService.update(project.id, { status: next });
    await loadProjects();
  };

  return (
    <CMSLayout title="Projects">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
          <input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] placeholder-[--color-muted] focus:outline-none focus:border-[--color-accent]"
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm text-[--color-foreground] focus:outline-none focus:border-[--color-accent] cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <Link to="/admin/projects/new">
          <Button variant="primary" icon={<MdAdd size={16} />}>New Project</Button>
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-[--color-muted]">
          <p className="text-lg mb-4">No projects found.</p>
          <Link to="/admin/projects/new">
            <Button variant="outline" icon={<MdAdd size={14} />}>Create first project</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-[--radius-xl] border border-[--color-border] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[--color-surface] border-b border-[--color-border]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase tracking-wide hidden lg:table-cell">Year</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[--color-muted] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {projects.map((project) => (
                <motion.tr
                  key={project.id}
                  className="bg-[--color-background] hover:bg-[--color-surface] transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[--color-surface] shrink-0">
                        {project.coverImage ? (
                          <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[--color-muted]">{'</>'}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[--color-foreground] truncate max-w-[180px]">{project.title}</p>
                        <p className="text-xs text-[--color-muted]">{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline">{project.category}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => handleToggleStatus(project)}
                      className="cursor-pointer"
                      title={`Click to ${project.status === 'PUBLISHED' ? 'unpublish' : 'publish'}`}
                    >
                      <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[--color-muted]">{project.year}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${project.featured ? 'text-[--color-accent]' : 'text-[--color-muted] hover:text-[--color-accent]'}`}
                        title={project.featured ? 'Unfeature' : 'Feature'}
                      >
                        {project.featured ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                      </button>
                      <Link to={`/admin/projects/${project.id}/edit`} className="p-1.5 rounded-lg text-[--color-muted] hover:text-[--color-foreground] transition-colors">
                        <MdEdit size={16} />
                      </Link>
                      {project.deletedAt ? (
                        <button
                          onClick={() => handleRestore(project.id)}
                          disabled={restoring === project.id}
                          className="p-1.5 rounded-lg text-green-400 hover:text-green-300 transition-colors cursor-pointer disabled:opacity-50"
                          title="Restore"
                        >
                          <MdRestore size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                          className="p-1.5 rounded-lg text-[--color-muted] hover:text-[--color-destructive] transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          <MdDelete size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[--color-muted]">
            Showing {Math.min((page - 1) * 12 + 1, total)}–{Math.min(page * 12, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total}>
              Next
            </Button>
          </div>
        </div>
      )}
    </CMSLayout>
  );
}
