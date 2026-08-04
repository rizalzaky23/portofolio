import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

export const listMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total, unreadCount] = await Promise.all([
      prisma.message.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.message.count({ where }),
      prisma.message.count({ where: { status: 'UNREAD', deletedAt: null } }),
    ]);

    res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit), unreadCount } });
  } catch (err) { next(err); }
};

export const getMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await prisma.message.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!message) throw createError('Message not found', 404);
    if (message.status === 'UNREAD') {
      await prisma.message.update({ where: { id: message.id }, data: { status: 'READ' } });
    }
    res.json({ success: true, data: { ...message, status: message.status === 'UNREAD' ? 'READ' : message.status } });
  } catch (err) { next(err); }
};

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sanitized = {
      name: sanitizeHtml(req.body.name, { allowedTags: [] }),
      email: req.body.email,
      subject: sanitizeHtml(req.body.subject, { allowedTags: [] }),
      body: sanitizeHtml(req.body.body, { allowedTags: [] }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const message = await prisma.message.create({ data: sanitized });
    res.status(201).json({ success: true, message: 'Message sent successfully', data: { id: message.id } });
  } catch (err) { next(err); }
};

export const markMessageReplied = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.message.update({ where: { id: req.params.id }, data: { status: 'REPLIED' } });
    res.json({ success: true, message: 'Message marked as replied' });
  } catch (err) { next(err); }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.message.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};
