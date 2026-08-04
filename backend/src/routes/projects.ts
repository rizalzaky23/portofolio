import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { projectSchema, paginationSchema } from '../schemas/index.js';

const router = Router();

// Public
router.get('/', validate(paginationSchema), projectController.listProjects);
router.get('/:slug', projectController.getProject);

// Protected (CMS)
router.use(authenticate);
router.post('/', validate(projectSchema), projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/restore', projectController.restoreProject);
router.post('/:id/cover', upload.single('image'), projectController.uploadProjectCover);
router.post('/:id/gallery', upload.array('images', 10), projectController.uploadProjectGallery);

export default router;
