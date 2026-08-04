import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdFolder, MdEmojiEvents, MdMessage, MdPermMedia, MdArrowForward, MdMarkEmailRead } from 'react-icons/md';
import { dashboardService } from '@/services';
import type { DashboardStats } from '@/types';
import { CMSLayout } from './Layout';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const MotionDiv = motion.div;

function StatCard({
  icon: Icon, label, value, sub, href, index,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: number;
  sub?: string;
  href: string;
  index: number;
}) {
  return (
    <MotionDiv
      className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border] hover:border-[--color-accent]/40 transition-all group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-[--color-accent-muted]">
          <Icon size={20} className="text-[--color-accent]" />
        </div>
        <Link
          to={href}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[--color-muted] hover:text-[--color-accent]"
        >
          <MdArrowForward size={18} />
        </Link>
      </div>
      <p className="text-3xl font-[--font-heading] font-bold text-[--color-foreground]">{value}</p>
      <p className="text-sm text-[--color-muted] mt-1">{label}</p>
      {sub && <p className="text-xs text-[--color-accent] mt-1">{sub}</p>}
    </MotionDiv>
  );
}

export default function CMSDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then((r) => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <CMSLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </CMSLayout>
    );
  }

  const s = stats?.stats;

  return (
    <CMSLayout title="Dashboard">
      {/* Welcome */}
      <MotionDiv
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-[--font-heading] font-bold">Good day 👋</h2>
        <p className="text-[--color-muted] text-sm mt-1">Here's what's happening with your portfolio.</p>
      </MotionDiv>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MdFolder}       label="Total Projects"   value={s?.projects ?? 0}    sub={`${s?.publishedProjects ?? 0} published`}  href="/admin/projects"     index={0} />
        <StatCard icon={MdEmojiEvents}  label="Achievements"     value={s?.achievements ?? 0} sub="All time"                                   href="/admin/achievements" index={1} />
        <StatCard icon={MdMessage}      label="Messages"         value={s?.messages ?? 0}    sub={`${s?.unreadMessages ?? 0} unread`}         href="/admin/messages"     index={2} />
        <StatCard icon={MdPermMedia}    label="Media Files"      value={s?.media ?? 0}       sub="In MinIO storage"                           href="/admin/media"        index={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent messages */}
        <MotionDiv
          className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Recent Messages</h3>
            <Link to="/admin/messages" className="text-xs text-[--color-accent] hover:underline flex items-center gap-1">
              View all <MdArrowForward size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentMessages ?? []).length === 0 ? (
              <p className="text-sm text-[--color-muted]">No messages yet.</p>
            ) : stats?.recentMessages.map((msg) => (
              <Link
                key={msg.id}
                to={`/admin/messages`}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[--color-surface-raised] transition-colors"
              >
                <MdMarkEmailRead
                  size={18}
                  className={msg.status === 'UNREAD' ? 'text-[--color-accent] mt-0.5' : 'text-[--color-muted] mt-0.5'}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[--color-foreground] truncate">{msg.name}</p>
                  <p className="text-xs text-[--color-muted] truncate">{msg.subject}</p>
                </div>
                <div className="shrink-0 text-right">
                  {msg.status === 'UNREAD' && <Badge variant="accent" className="text-[10px] mb-1">New</Badge>}
                  <p className="text-xs text-[--color-muted]">{formatDate(msg.createdAt, { month: 'short', day: 'numeric' })}</p>
                </div>
              </Link>
            ))}
          </div>
        </MotionDiv>

        {/* Recent projects */}
        <MotionDiv
          className="p-6 rounded-[--radius-xl] bg-[--color-surface] border border-[--color-border]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Recent Projects</h3>
            <Link to="/admin/projects" className="text-xs text-[--color-accent] hover:underline flex items-center gap-1">
              View all <MdArrowForward size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentProjects ?? []).length === 0 ? (
              <p className="text-sm text-[--color-muted]">No projects yet.</p>
            ) : stats?.recentProjects.map((proj) => (
              <div key={proj.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[--color-surface-raised] transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[--color-background] shrink-0">
                  {proj.coverImage ? (
                    <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[--color-muted]">{'</>'}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[--color-foreground] truncate">{proj.title}</p>
                  <p className="text-xs text-[--color-muted]">{formatDate(proj.createdAt, { month: 'short', day: 'numeric' })}</p>
                </div>
                <Badge variant={proj.status === 'PUBLISHED' ? 'success' : proj.status === 'DRAFT' ? 'warning' : 'default'} className="text-[10px] shrink-0">
                  {proj.status}
                </Badge>
              </div>
            ))}
          </div>
        </MotionDiv>
      </div>
    </CMSLayout>
  );
}
