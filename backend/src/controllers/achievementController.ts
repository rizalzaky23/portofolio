import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';

export const listAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, category, featured, search } = req.query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) where.title = { contains: search as string };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.achievement.findMany({ where, skip, take: Number(limit), orderBy: [{ displayOrder: 'asc' }, { date: 'desc' }] }),
      prisma.achievement.count({ where }),
    ]);
    res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

export const getAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.achievement.findUnique({ where: { id: req.params.id } });
    if (!item) throw createError('Achievement not found', 404);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.achievement.create({ data: { ...req.body, date: new Date(req.body.date) } });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.achievement.update({
      where: { id: req.params.id },
      data: { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined },
    });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.achievement.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (err) { next(err); }
};

export const uploadAchievementCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);

    const isPdf = file.mimetype === 'application/pdf';
    const result = await storage.upload(file.buffer, {
      folder: 'achievements',
      mimeType: file.mimetype,
      optimize: !isPdf,
    });

    const updateData = isPdf
      ? { certificatePdf: result.url }
      : { certificateImage: result.url };

    await prisma.achievement.update({ where: { id }, data: updateData });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) { next(err); }
};
