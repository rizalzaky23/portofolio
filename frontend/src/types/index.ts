// ─── API Response Wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages?: number;
  unreadCount?: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'EDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  problem: string;
  solution: string;
  architecture: string;
  challenges: string;
  lessons: string;
  status: ProjectStatus;
  featured: boolean;
  coverImage: string | null;
  year: number;
  category: string;
  githubUrl: string | null;
  demoUrl: string | null;
  techStack: string[];
  displayOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
}

// ─── Achievement ──────────────────────────────────────────────────────────────
export type AchievementCategory = 'competition' | 'award' | 'scholarship' | 'recognition' | 'certificate';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  organizer: string;
  date: string;
  category: AchievementCategory;
  certificateImage: string | null;
  certificatePdf: string | null;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

// ─── Certificate ──────────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  credentialId: string | null;
  credentialUrl: string | null;
  issueDate: string;
  expirationDate: string | null;
  previewUrl: string | null;
  featured: boolean;
  displayOrder: number;
}

// ─── Experience ───────────────────────────────────────────────────────────────
export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  logo: string | null;
  website: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  displayOrder: number;
}

// ─── Skill ───────────────────────────────────────────────────────────────────
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  displayOrder: number;
}

// ─── About ───────────────────────────────────────────────────────────────────
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
}

export interface About {
  id: string;
  biography: string;
  photo: string | null;
  resume: string | null;
  socialLinks: SocialLinks;
  techStack: string[];
}

// ─── Message ──────────────────────────────────────────────────────────────────
export type MessageStatus = 'UNREAD' | 'READ' | 'REPLIED';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
}

// ─── Media ───────────────────────────────────────────────────────────────────
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface Settings {
  site_title: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  google_analytics_id: string;
  maintenance_mode: string;
  [key: string]: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  stats: {
    projects: number;
    achievements: number;
    messages: number;
    media: number;
    unreadMessages: number;
    publishedProjects: number;
    draftProjects: number;
  };
  recentMessages: Pick<Message, 'id' | 'name' | 'email' | 'subject' | 'status' | 'createdAt'>[];
  recentProjects: Pick<Project, 'id' | 'title' | 'slug' | 'status' | 'createdAt' | 'coverImage'>[];
}
