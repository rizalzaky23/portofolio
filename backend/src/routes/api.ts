import { Router } from 'express';
import * as aboutController from '../controllers/aboutController.js';
import * as messageController from '../controllers/messageController.js';
import * as mediaController from '../controllers/mediaController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as userController from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { messageSchema, settingsSchema } from '../schemas/index.js';
import { rateLimitGlobal } from '../middleware/rateLimit.js';

const router = Router();

// ─── About (Public read) ──────────────────────────────────────────────────────
router.get('/about', aboutController.getAbout);
router.put('/about', authenticate, aboutController.updateAbout);
router.post('/about/photo', authenticate, upload.single('photo'), aboutController.uploadAboutPhoto);
router.post('/about/resume', authenticate, upload.single('resume'), aboutController.uploadResume);

// ─── Messages ─────────────────────────────────────────────────────────────────
router.post('/messages', rateLimitGlobal, validate(messageSchema), messageController.createMessage);
router.get('/messages', authenticate, messageController.listMessages);
router.get('/messages/:id', authenticate, messageController.getMessage);
router.post('/messages/:id/reply', authenticate, messageController.markMessageReplied);
router.delete('/messages/:id', authenticate, messageController.deleteMessage);

// ─── Media ────────────────────────────────────────────────────────────────────
router.get('/media', authenticate, mediaController.listMedia);
router.post('/media', authenticate, upload.array('files', 10), mediaController.uploadMedia);
router.delete('/media/:id', authenticate, mediaController.deleteMedia);
router.patch('/media/:id/rename', authenticate, mediaController.renameMedia);
router.get('/media/:id/signed-url', authenticate, mediaController.getSignedUrl);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', settingsController.getSettings);
router.get('/settings/:key', settingsController.getSetting);
router.post('/settings', authenticate, validate(settingsSchema), settingsController.upsertSetting);
router.post('/settings/bulk', authenticate, settingsController.bulkUpsertSettings);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', authenticate, requireRole('ADMIN'), userController.listUsers);
router.get('/users/:id', authenticate, requireRole('ADMIN'), userController.getUser);
router.post('/users', authenticate, requireRole('ADMIN'), userController.createUser);
router.put('/users/:id', authenticate, requireRole('ADMIN'), userController.updateUser);
router.delete('/users/:id', authenticate, requireRole('ADMIN'), userController.deleteUser);
router.post('/users/:id/avatar', authenticate, upload.single('avatar'), userController.uploadUserAvatar);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, userController.getDashboardStats);

export default router;
