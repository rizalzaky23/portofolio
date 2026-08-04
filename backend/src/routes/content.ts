import { Router } from 'express';
import * as c from '../controllers/contentController.js';
import * as ach from '../controllers/achievementController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// ─── Achievements (Public read, protected write) ─────────────────────────────
router.get('/achievements', ach.listAchievements);
router.get('/achievements/:id', ach.getAchievement);
router.use('/achievements', authenticate);
router.post('/achievements', ach.createAchievement);
router.put('/achievements/:id', ach.updateAchievement);
router.delete('/achievements/:id', ach.deleteAchievement);
router.post('/achievements/:id/certificate', upload.single('file'), ach.uploadAchievementCertificate);

// ─── Certificates (Public read, protected write) ──────────────────────────────
router.get('/certificates', c.listCertificates);
router.get('/certificates/:id', c.getCertificate);
router.use('/certificates', authenticate);
router.post('/certificates', c.createCertificate);
router.put('/certificates/:id', c.updateCertificate);
router.delete('/certificates/:id', c.deleteCertificate);
router.post('/certificates/:id/preview', upload.single('file'), c.uploadCertificatePreview);

// ─── Experience (Public read, protected write) ────────────────────────────────
router.get('/experience', c.listExperiences);
router.use('/experience', authenticate);
router.post('/experience', c.createExperience);
router.put('/experience/:id', c.updateExperience);
router.delete('/experience/:id', c.deleteExperience);
router.post('/experience/:id/logo', upload.single('logo'), c.uploadExperienceLogo);

// ─── Skills (Public read, protected write) ────────────────────────────────────
router.get('/skills', c.listSkills);
router.use('/skills', authenticate);
router.post('/skills', c.createSkill);
router.put('/skills/:id', c.updateSkill);
router.delete('/skills/:id', c.deleteSkill);

export default router;
