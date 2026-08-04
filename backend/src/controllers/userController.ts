import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage/MinIOProvider.js';
import { createError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, lastLoginAt: true, createdAt: true },
    });
    if (!user) throw createError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw createError('Email already registered', 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData: Record<string, unknown> = { name, email, role };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.userId === req.params.id) throw createError("You can't delete your own account", 400);
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

export const uploadUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw createError('No file uploaded', 400);
    const result = await storage.upload(file.buffer, { folder: 'avatars', mimeType: file.mimetype, optimize: true, maxWidth: 400 });
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { avatar: result.url }, select: { id: true, avatar: true } });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [projects, achievements, messages, media] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.achievement.count(),
      prisma.message.count({ where: { deletedAt: null } }),
      prisma.media.count(),
    ]);
    const [unreadMessages, publishedProjects, draftProjects, recentMessages, recentProjects] = await Promise.all([
      prisma.message.count({ where: { status: 'UNREAD', deletedAt: null } }),
      prisma.project.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.project.count({ where: { status: 'DRAFT', deletedAt: null } }),
      prisma.message.findMany({ where: { deletedAt: null }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true } }),
      prisma.project.findMany({ where: { deletedAt: null }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, slug: true, status: true, createdAt: true, coverImage: true } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { projects, achievements, messages, media, unreadMessages, publishedProjects, draftProjects },
        recentMessages,
        recentProjects,
      },
    });
  } catch (err) { next(err); }
};
