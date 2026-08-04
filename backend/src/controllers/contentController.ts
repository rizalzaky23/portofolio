import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';

// ─── Certificates ────────────────────────────────────────────────────────────

export const listCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.certificate.findMany({ skip, take: Number(limit), orderBy: [{ displayOrder: 'asc' }, { issueDate: 'desc' }] }),
      prisma.certificate.count(),
    ]);
    res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

export const getCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!item) throw createError('Certificate not found', 404);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const createCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.certificate.create({
      data: {
        ...req.body,
        issueDate: new Date(req.body.issueDate),
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const updateCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.certificate.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
      },
    });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const deleteCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.certificate.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) { next(err); }
};

export const uploadCertificatePreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);
    const result = await storage.upload(file.buffer, { folder: 'certificates', mimeType: file.mimetype, optimize: true });
    await prisma.certificate.update({ where: { id: req.params.id }, data: { previewUrl: result.url } });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) { next(err); }
};

// ─── Experience ──────────────────────────────────────────────────────────────

export const listExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.experience.findMany({ orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }] });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

export const createExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.experience.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Experience deleted' });
  } catch (err) { next(err); }
};

export const uploadExperienceLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);
    const result = await storage.upload(file.buffer, { folder: 'experiences', mimeType: file.mimetype, optimize: true, maxWidth: 400 });
    await prisma.experience.update({ where: { id: req.params.id }, data: { logo: result.url } });
    res.json({ success: true, data: { url: result.url } });
  } catch (err) { next(err); }
};

// ─── Skills ──────────────────────────────────────────────────────────────────

export const listSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};
    const items = await prisma.skill.findMany({ where, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.skill.create({ data: req.body });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.skill.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) { next(err); }
};
