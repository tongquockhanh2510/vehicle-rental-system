import express from 'express';
import userService from '../services/UserService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/by-role/:role', async (req, res) => {
  try {
    const users = await userService.getUsersByRole(req.params.role);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:userId/verify', async (req, res) => {
  try {
    const user = await userService.verifyUser(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== IDENTITY VERIFICATION ENDPOINTS ==========

/**
 * POST /:userId/identity-verification
 * Submit identity verification with images
 * Updates user document with id_number and images
 * Required fields: id_number
 * Files: id_image_front (required), id_image_back (optional)
 */
router.post('/:userId/identity-verification', upload.fields([
  { name: 'id_image_front', maxCount: 1 },
  { name: 'id_image_back', maxCount: 1 }
]), authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.files || !req.files.id_image_front) {
      return res.status(400).json({ error: 'id_image_front is required' });
    }

    if (!req.body.id_number) {
      return res.status(400).json({ error: 'Missing required field: id_number' });
    }

    const user = await userService.submitIdentityVerification(
      req.params.userId,
      { id_number: req.body.id_number },
      req.files.id_image_front[0],
      req.files.id_image_back ? req.files.id_image_back[0] : null
    );

    res.status(200).json({
      success: true,
      message: 'Identity verification submitted successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/identity-verification
 * Get user identity verification info
 */
router.get('/identity-verification', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.params.user_id);
    
    const verification = {
      id_number: user.id_number,
      id_image_front: user.id_image_front,
      id_image_back: user.id_image_back
    };

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/license-verification', upload.fields([
  { name: 'license_image_front', maxCount: 1 },
  { name: 'license_image_back', maxCount: 1 }
]), authenticateToken, async (req, res) => {
  try {

    if (!req.files || !req.files.license_image_front) {
      return res.status(400).json({ error: 'license_image_front is required' });
    }

    if (!req.body.license_number || !req.body.expiry_date) {
      return res.status(400).json({
        error: 'Missing required fields: license_number, expiry_date'
      });
    }

    const user = await userService.submitLicenseVerification(
      req.body.user_id,
      {
        license_number: req.body.license_number,
        expiry_date: req.body.expiry_date
      },
      req.files.license_image_front[0],
      req.files.license_image_back ? req.files.license_image_back[0] : null
    );

    res.status(200).json({
      success: true,
      message: 'License verification submitted successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/license-verification
 * Get user license verification info
 */
router.get('/:userId/license-verification', authenticateToken, async (req, res) => {
  try {

    const user = await userService.getUserProfile(req.params.userId);
    
    const verification = {
      license_number: user.license_number,
      license_image: user.license_image,
      license_expiry_date: user.license_expiry_date
    };

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ========== BANK VERIFICATION ENDPOINTS ==========

/**
 * POST /:userId/bank-verification
 * Submit bank verification with images
 * Updates user document with bank_account and bank_name
 * Required fields: bank_account_number, bank_name
 * Files: bank_statement_image (required), id_card_image (optional)
 */
router.post('/:userId/bank-verification', upload.fields([
  { name: 'bank_statement_image', maxCount: 1 },
  { name: 'id_card_image', maxCount: 1 }
]), authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.files || !req.files.bank_statement_image) {
      return res.status(400).json({ error: 'bank_statement_image is required' });
    }

    if (!req.body.bank_account_number || !req.body.bank_name) {
      return res.status(400).json({
        error: 'Missing required fields: bank_account_number, bank_name'
      });
    }

    const user = await userService.submitBankVerification(
      req.params.userId,
      {
        bank_account_number: req.body.bank_account_number,
        bank_name: req.body.bank_name
      },
      req.files.bank_statement_image[0],
      req.files.id_card_image ? req.files.id_card_image[0] : null
    );

    res.status(200).json({
      success: true,
      message: 'Bank verification submitted successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/bank-verification
 * Get user bank verification info
 */
router.get('/:userId/bank-verification', authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await userService.getUserProfile(req.params.userId);
    
    const verification = {
      bank_account: user.bank_account,
      bank_name: user.bank_name
    };

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
