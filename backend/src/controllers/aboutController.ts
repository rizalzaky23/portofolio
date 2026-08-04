import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';

export const getAbout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let about = await prisma.about.findFirst();
    if (!about) {
      about = await prisma.about.create({
        data: {
          biography: '',
          socialLinks: JSON.stringify({ github: '', linkedin: '', instagram: '', email: '' }),
          techStack: JSON.stringify([]),
        },
      });
    }
    res.json({ success: true, data: about });
  } catch (err) { next(err); }
};

export const updateAbout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let about = await prisma.about.findFirst();
    const data = {
      biography: req.body.biography,
      socialLinks: JSON.stringify(req.body.socialLinks),
      techStack: JSON.stringify(req.body.techStack),
    };
    if (about) {
      about = await prisma.about.update({ where: { id: about.id }, data });
    } else {
      about = await prisma.about.create({ data });
    }
    res.json({ success: true, data: about });
  } catch (err) { next(err); }
};

export const uploadAboutPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);
    const result = await storage.upload(file.buffer, { folder: 'about', mimeType: file.mimetype, optimize: true, maxWidth: 800 });
    const about = await prisma.about.findFirst();
    if (about) await prisma.about.update({ where: { id: about.id }, data: { photo: result.url } });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) { next(err); }
};

export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);
    const result = await storage.upload(file.buffer, { folder: 'about', mimeType: file.mimetype, optimize: false });
    const about = await prisma.about.findFirst();
    if (about) await prisma.about.update({ where: { id: about.id }, data: { resume: result.url } });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) { next(err); }
};
