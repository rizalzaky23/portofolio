import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';

// ─── Public Pages ─────────────────────────────────────────────────────────────
const HomePage          = lazy(() => import('@/pages/Home'));
const ProjectDetailPage  = lazy(() => import('@/pages/ProjectDetail'));

// ─── CMS Pages (lazy loaded) ──────────────────────────────────────────────────
const CMSLoginPage       = lazy(() => import('@/cms/Login'));
const CMSDashboardPage   = lazy(() => import('@/cms/Dashboard'));
const CMSProjectsList    = lazy(() => import('@/cms/projects/ProjectsList'));
const CMSProjectForm     = lazy(() => import('@/cms/projects/ProjectForm'));
const CMSAchievements    = lazy(() => import('@/cms/achievements/AchievementsList'));
const CMSCertificates    = lazy(() => import('@/cms/certificates/CertificatesList'));
const CMSExperience      = lazy(() => import('@/cms/experience/ExperienceList'));
const CMSSkills           = lazy(() => import('@/cms/skills/SkillsList'));
const CMSAbout           = lazy(() => import('@/cms/about/AboutForm'));
const CMSMessages        = lazy(() => import('@/cms/messages/MessagesList'));
const CMSMedia           = lazy(() => import('@/cms/media/MediaList'));
const CMSSettings        = lazy(() => import('@/cms/settings/Settings'));
const CMSUsers           = lazy(() => import('@/cms/users/UsersList'));

// ─── Loading Fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-[--color-background] flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ─── Public Routes ─────────────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />

          {/* ─── CMS Auth ──────────────────────────────────────────────────── */}
          <Route
            path="/admin/login"
            element={
              <RedirectIfAuth>
                <CMSLoginPage />
              </RedirectIfAuth>
            }
          />

          {/* ─── CMS Protected Routes ─────────────────────────────────────── */}
          <Route path="/admin" element={<RequireAuth><CMSDashboardPage /></RequireAuth>} />
          <Route path="/admin/projects" element={<RequireAuth><CMSProjectsList /></RequireAuth>} />
          <Route path="/admin/projects/new" element={<RequireAuth><CMSProjectForm /></RequireAuth>} />
          <Route path="/admin/projects/:id/edit" element={<RequireAuth><CMSProjectForm /></RequireAuth>} />
          <Route path="/admin/achievements" element={<RequireAuth><CMSAchievements /></RequireAuth>} />
          <Route path="/admin/certificates" element={<RequireAuth><CMSCertificates /></RequireAuth>} />
          <Route path="/admin/experience" element={<RequireAuth><CMSExperience /></RequireAuth>} />
          <Route path="/admin/skills" element={<RequireAuth><CMSSkills /></RequireAuth>} />
          <Route path="/admin/about" element={<RequireAuth><CMSAbout /></RequireAuth>} />
          <Route path="/admin/messages" element={<RequireAuth><CMSMessages /></RequireAuth>} />
          <Route path="/admin/media" element={<RequireAuth><CMSMedia /></RequireAuth>} />
          <Route path="/admin/settings" element={<RequireAuth><CMSSettings /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><CMSUsers /></RequireAuth>} />

          {/* ─── Fallback 404 ──────────────────────────────────────────────── */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[--color-background] flex flex-col items-center justify-center gap-4 text-[--color-muted]">
                <p className="text-6xl font-[--font-heading] font-black text-[--color-surface]">404</p>
                <p className="text-xl">Page not found</p>
                <a href="/" className="text-[--color-accent] hover:underline">← Go home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
