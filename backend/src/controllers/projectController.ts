import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildProjectWhere = (query: Record<string, unknown>) => {
  const where: Record<string, unknown> = { deletedAt: null };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search as string } },
      { summary: { contains: query.search as string } },
    ];
  }
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.featured !== undefined) where.featured = query.featured;
  return where;
};

export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page = 1, limit = 12, sort = 'createdAt', order = 'desc', ...filters } =
      req.query as Record<string, unknown>;
    const where = buildProjectWhere(filters);
    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort as string]: order },
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const project = await prisma.project.findFirst({
      where: { slug, deletedAt: null },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!project) throw createError('Project not found', 404);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body;
    const slug = data.slug ?? slugify(data.title);

    // Check slug uniqueness
    const existing = await prisma.project.findFirst({ where: { slug } });
    if (existing) throw createError('Slug already exists', 409);

    const project = await prisma.project.create({
      data: { ...data, slug, techStack: JSON.stringify(data.techStack) },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw createError('Project not found', 404);

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        techStack: data.techStack ? JSON.stringify(data.techStack) : undefined,
        publishedAt:
          data.status === 'PUBLISHED' && !project.publishedAt
            ? new Date()
            : undefined,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Project moved to trash' });
  } catch (err) {
    next(err);
  }
};

export const restoreProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.project.update({ where: { id }, data: { deletedAt: null } });
    res.json({ success: true, message: 'Project restored' });
  } catch (err) {
    next(err);
  }
};

export const uploadProjectCover = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);

    const result = await storage.upload(file.buffer, {
      folder: 'projects/covers',
      mimeType: file.mimetype,
      optimize: true,
      maxWidth: 1920,
    });

    await prisma.project.update({ where: { id }, data: { coverImage: result.url } });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) {
    next(err);
  }
};

export const uploadProjectGallery = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw createError('No files uploaded', 400);

    const uploads = await Promise.all(
      files.map((file) =>
        storage.upload(file.buffer, {
          folder: 'projects/gallery',
          mimeType: file.mimetype,
          optimize: true,
        }),
      ),
    );

    const images = await prisma.$transaction(
      uploads.map((result, i) =>
        prisma.projectImage.create({
          data: { projectId: id, url: result.url, order: i },
        }),
      ),
    );

    res.json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
};
