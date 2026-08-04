import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdFolder, MdEmojiEvents, MdCardMembership,
  MdWork, MdPsychology, MdPerson, MdPermMedia, MdMessage,
  MdSettings, MdPeople, MdMenu, MdClose, MdLogout, MdOpenInNew,
} from 'react-icons/md';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services';

const NAV_ITEMS = [
  { icon: MdDashboard,       label: 'Dashboard',    href: '/admin' },
  { icon: MdFolder,          label: 'Projects',     href: '/admin/projects' },
  { icon: MdEmojiEvents,     label: 'Achievements', href: '/admin/achievements' },
  { icon: MdCardMembership,  label: 'Certificates', href: '/admin/certificates' },
  { icon: MdWork,            label: 'Experience',   href: '/admin/experience' },
  { icon: MdPsychology,      label: 'Skills',       href: '/admin/skills' },
  { icon: MdPerson,          label: 'About',        href: '/admin/about' },
  { icon: MdPermMedia,       label: 'Media',        href: '/admin/media' },
  { icon: MdMessage,         label: 'Messages',     href: '/admin/messages' },
  { icon: MdSettings,        label: 'Settings',     href: '/admin/settings' },
  { icon: MdPeople,          label: 'Users',        href: '/admin/users' },
];

function SidebarLink({ item, active }: { item: typeof NAV_ITEMS[0]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-[--color-accent] text-[--color-background]'
          : 'text-[--color-muted] hover:text-[--color-foreground] hover:bg-[--color-surface-raised]'
        }`}
    >
      <Icon size={18} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

interface CMSLayoutProps {
  children: ReactNode;
  title?: string;
}

export function CMSLayout({ children, title }: CMSLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    clearAuth();
    navigate('/admin/login');
  };

  const Sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-[--color-border]">
        <Link to="/" className="font-[--font-heading] font-bold text-xl flex items-center gap-2">
          RZ<span className="text-[--color-accent]">.</span>
          <span className="text-sm font-normal text-[--color-muted] ml-1">CMS</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="CMS navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={location.pathname === item.href}
          />
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[--color-border]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[--color-accent] flex items-center justify-center text-[--color-background] text-sm font-bold shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[--color-foreground] truncate">{user?.name}</p>
            <p className="text-xs text-[--color-muted] truncate">{user?.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[--color-muted] hover:text-[--color-foreground] border border-[--color-border] hover:border-[--color-accent]/40 transition-all"
          >
            <MdOpenInNew size={12} /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[--color-muted] hover:text-[--color-destructive] border border-[--color-border] hover:border-[--color-destructive]/40 transition-all cursor-pointer"
          >
            <MdLogout size={12} /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[--color-background] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[--color-surface] border-r border-[--color-border]">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[--color-surface] border-r border-[--color-border] lg:hidden"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[--color-background]/80 backdrop-blur-sm border-b border-[--color-border] px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[--color-muted] hover:text-[--color-foreground] transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
          {title && (
            <h1 className="font-[--font-heading] font-bold text-lg">{title}</h1>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
