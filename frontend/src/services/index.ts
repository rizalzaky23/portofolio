import api from './api';
import type { ApiResponse, Project, Achievement, Certificate, Experience, Skill, About, Message, Media, Settings, DashboardStats, User } from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  refresh: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectService = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Project[]>>('/projects', { params }),
  get: (slug: string) => api.get<ApiResponse<Project>>(`/projects/${slug}`),
  create: (data: Partial<Project>) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  restore: (id: string) => api.post(`/projects/${id}/restore`),
  uploadCover: (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<ApiResponse<{ url: string }>>(`/projects/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadGallery: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return api.post<ApiResponse<{ url: string }[]>>(`/projects/${id}/gallery`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Achievements ─────────────────────────────────────────────────────────────
export const achievementService = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Achievement[]>>('/achievements', { params }),
  get: (id: string) => api.get<ApiResponse<Achievement>>(`/achievements/${id}`),
  create: (data: Partial<Achievement>) => api.post<ApiResponse<Achievement>>('/achievements', data),
  update: (id: string, data: Partial<Achievement>) =>
    api.put<ApiResponse<Achievement>>(`/achievements/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
  uploadCertificate: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/achievements/${id}/certificate`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Certificates ─────────────────────────────────────────────────────────────
export const certificateService = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Certificate[]>>('/certificates', { params }),
  create: (data: Partial<Certificate>) => api.post<ApiResponse<Certificate>>('/certificates', data),
  update: (id: string, data: Partial<Certificate>) =>
    api.put<ApiResponse<Certificate>>(`/certificates/${id}`, data),
  delete: (id: string) => api.delete(`/certificates/${id}`),
};

// ─── Experience ───────────────────────────────────────────────────────────────
export const experienceService = {
  list: () => api.get<ApiResponse<Experience[]>>('/experience'),
  create: (data: Partial<Experience>) => api.post<ApiResponse<Experience>>('/experience', data),
  update: (id: string, data: Partial<Experience>) =>
    api.put<ApiResponse<Experience>>(`/experience/${id}`, data),
  delete: (id: string) => api.delete(`/experience/${id}`),
  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post(`/experience/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Skills ───────────────────────────────────────────────────────────────────
export const skillService = {
  list: (category?: string) => api.get<ApiResponse<Skill[]>>('/skills', { params: { category } }),
  create: (data: Partial<Skill>) => api.post<ApiResponse<Skill>>('/skills', data),
  update: (id: string, data: Partial<Skill>) => api.put<ApiResponse<Skill>>(`/skills/${id}`, data),
  delete: (id: string) => api.delete(`/skills/${id}`),
};

// ─── About ───────────────────────────────────────────────────────────────────
export const aboutService = {
  get: () => api.get<ApiResponse<About>>('/about'),
  update: (data: Partial<About>) => api.put<ApiResponse<About>>('/about', data),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/about/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadResume: (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/about/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messageService = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Message[]>>('/messages', { params }),
  get: (id: string) => api.get<ApiResponse<Message>>(`/messages/${id}`),
  send: (data: { name: string; email: string; subject: string; body: string }) =>
    api.post<ApiResponse<{ id: string }>>('/messages', data),
  markReplied: (id: string) => api.post(`/messages/${id}/reply`),
  delete: (id: string) => api.delete(`/messages/${id}`),
};

// ─── Media ───────────────────────────────────────────────────────────────────
export const mediaService = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<Media[]>>('/media', { params }),
  upload: (files: File[], folder?: string) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    if (folder) form.append('folder', folder);
    return api.post<ApiResponse<Media[]>>('/media', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/media/${id}`),
  rename: (id: string, name: string) => api.patch(`/media/${id}/rename`, { name }),
  signedUrl: (id: string) =>
    api.get<ApiResponse<{ url: string }>>(`/media/${id}/signed-url`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsService = {
  get: () => api.get<ApiResponse<Settings>>('/settings'),
  bulkUpdate: (settings: Partial<Settings>) => api.post('/settings/bulk', settings),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userService = {
  list: () => api.get<ApiResponse<User[]>>('/users'),
  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard'),
};
