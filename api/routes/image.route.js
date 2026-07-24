import express from 'express';
import { uploadImage, getImage } from '../controllers/image.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post(
  '/upload',
  verifyToken,
  express.raw({ type: 'image/*', limit: '2mb' }),
  uploadImage
);
router.get('/:id', getImage);

export default router;
