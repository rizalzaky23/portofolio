import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const projectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).optional(),
    summary: z.string().min(1).max(500),
    description: z.string().min(1),
    problem: z.string().min(1),
    solution: z.string().min(1),
    architecture: z.string().optional().default(''),
    challenges: z.string().optional().default(''),
    lessons: z.string().optional().default(''),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
    featured: z.boolean().optional().default(false),
    year: z.number().int().min(2000).max(2100),
    category: z.string().min(1),
    githubUrl: z.string().url().optional().nullable(),
    demoUrl: z.string().url().optional().nullable(),
    techStack: z.array(z.string()).min(1),
    displayOrder: z.number().int().optional().default(0),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
  }),
});

export const achievementSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    organizer: z.string().min(1),
    date: z.string().datetime(),
    category: z.enum(['competition', 'award', 'scholarship', 'recognition', 'certificate']),
    featured: z.boolean().optional().default(false),
    displayOrder: z.number().int().optional().default(0),
  }),
});

export const certificateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    issuer: z.string().min(1),
    credentialId: z.string().optional().nullable(),
    credentialUrl: z.string().url().optional().nullable(),
    issueDate: z.string().datetime(),
    expirationDate: z.string().datetime().optional().nullable(),
    featured: z.boolean().optional().default(false),
    displayOrder: z.number().int().optional().default(0),
  }),
});

export const experienceSchema = z.object({
  body: z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    description: z.string().min(1),
    website: z.string().url().optional().nullable(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional().nullable(),
    current: z.boolean().optional().default(false),
    displayOrder: z.number().int().optional().default(0),
  }),
});

export const skillSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    level: z.number().int().min(1).max(100),
    icon: z.string().optional().nullable(),
    displayOrder: z.number().int().optional().default(0),
  }),
});

export const aboutSchema = z.object({
  body: z.object({
    biography: z.string().min(1),
    socialLinks: z.object({
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      instagram: z.string().url().optional(),
      email: z.string().email().optional(),
    }),
    techStack: z.array(z.string()),
  }),
});

export const messageSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
  }),
});

export const settingsSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    value: z.string(),
  }),
});

export const userSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8).optional(),
    role: z.enum(['ADMIN', 'EDITOR']).optional(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(12),
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
