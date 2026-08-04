import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';

export const listMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 24, folder, search, mimeType } = req.query;
    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder;
    if (search) where.originalName = { contains: search as string };
    if (mimeType) where.mimeType = { startsWith: mimeType as string };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.media.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.media.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw createError('No files uploaded', 400);
    const folder = (req.body.folder as string) ?? 'general';

    const results = await Promise.all(
      files.map(async (file) => {
        const result = await storage.upload(file.buffer, {
          folder,
          mimeType: file.mimetype,
          optimize: file.mimetype.startsWith('image/'),
        });

        return prisma.media.create({
          data: {
            filename: result.filename,
            originalName: file.originalname,
            url: result.url,
            mimeType: result.mimeType,
            size: result.size,
            folder,
            width: result.width,
            height: result.height,
          },
        });
      }),
    );

    res.status(201).json({ success: true, data: results });
  } catch (err) { next(err); }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw createError('Media not found', 404);

    await storage.delete(media.filename);
    await prisma.media.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Media deleted' });
  } catch (err) { next(err); }
};

export const renameMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: { originalName: name },
    });
    res.json({ success: true, data: media });
  } catch (err) { next(err); }
};

export const getSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw createError('Media not found', 404);
    const url = await storage.getSignedUrl(media.filename, 3600);
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
};
