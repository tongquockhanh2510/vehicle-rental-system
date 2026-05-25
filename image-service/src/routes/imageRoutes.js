import express from 'express';
import imageService from '../services/ImageService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

/**
 * Upload image
 * POST /api/images/upload
 * Body: file, service_type, reference_id
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.body.service_type || !req.body.reference_id) {
      return res.status(400).json({
        error: 'Missing required fields: service_type, reference_id'
      });
    }

    const image = await imageService.uploadImage(
      req.file,
      req.body.service_type,
      req.body.reference_id,
      req.userId
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: image
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get image information
 * GET /api/images/:imageId
 */
router.get('/:imageId', async (req, res) => {
  try {
    const image = await imageService.getImageInfo(req.params.imageId);
    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Get images by reference ID
 * GET /api/images/reference/:referenceId
 */
router.get('/reference/:referenceId', async (req, res) => {
  try {
    const images = await imageService.getImagesByReference(req.params.referenceId);
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Delete image
 * DELETE /api/images/:imageId
 */
router.delete('/:imageId', authenticateToken, async (req, res) => {
  try {
    const image = await imageService.deleteImage(req.params.imageId);
    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: image
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Delete all images for a reference ID
 * DELETE /api/images/reference/:referenceId
 */
router.delete('/reference/:referenceId', authenticateToken, async (req, res) => {
  try {
    const images = await imageService.deleteImagesByReference(req.params.referenceId);
    res.json({
      success: true,
      message: 'Images deleted successfully',
      data: images
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get presigned URL for image
 * GET /api/images/:imageId/presigned-url
 */
router.get('/:imageId/presigned-url', async (req, res) => {
  try {
    const expiresIn = req.query.expiresIn || 3600;
    const url = await imageService.getPresignedUrl(req.params.imageId, parseInt(expiresIn));
    res.json({
      success: true,
      data: { presigned_url: url }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
