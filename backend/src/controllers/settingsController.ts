import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.settings.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({ success: true, data: map });
  } catch (err) { next(err); }
};

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await prisma.settings.findUnique({ where: { key: req.params.key } });
    if (!setting) throw createError('Setting not found', 404);
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
};

export const upsertSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value } = req.body;
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
};

export const bulkUpsertSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body as Record<string, string>;
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) { next(err); }
};
