import express from 'express';
import imageService from '../services/ImageService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const url = await imageService.uploadImage(req.file, req.body.folder || 'others');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    await imageService.deleteImage(req.body.imageUrl);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;