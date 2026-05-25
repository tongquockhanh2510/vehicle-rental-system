import express from 'express';
import userService from '../services/UserService.js';
import identityVerificationService from '../services/IdentityVerificationService.js';
import licenseVerificationService from '../services/LicenseVerificationService.js';
import bankVerificationService from '../services/BankVerificationService.js';
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
 * Required fields: id_number, id_type, full_name
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

    if (!req.body.id_number || !req.body.id_type || !req.body.full_name) {
      return res.status(400).json({
        error: 'Missing required fields: id_number, id_type, full_name'
      });
    }

    const verification = await identityVerificationService.submitIdentityVerification(
      req.params.userId,
      {
        id_number: req.body.id_number,
        id_type: req.body.id_type,
        full_name: req.body.full_name,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        nationality: req.body.nationality,
        address: req.body.address,
        issued_date: req.body.issued_date,
        expiry_date: req.body.expiry_date
      },
      req.files.id_image_front[0],
      req.files.id_image_back ? req.files.id_image_back[0] : null
    );

    res.status(201).json({
      success: true,
      message: 'Identity verification submitted successfully',
      data: verification
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/identity-verification
 * Get identity verification info
 */
router.get('/:userId/identity-verification', authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const verification = await identityVerificationService.getIdentityVerification(req.params.userId);
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ========== LICENSE VERIFICATION ENDPOINTS ==========

/**
 * POST /:userId/license-verification
 * Submit license verification with images
 * Required fields: license_number, license_type, full_name, issued_date, expiry_date
 * Files: license_image_front (required), license_image_back (optional)
 */
router.post('/:userId/license-verification', upload.fields([
  { name: 'license_image_front', maxCount: 1 },
  { name: 'license_image_back', maxCount: 1 }
]), authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.files || !req.files.license_image_front) {
      return res.status(400).json({ error: 'license_image_front is required' });
    }

    if (!req.body.license_number || !req.body.license_type || !req.body.full_name ||
        !req.body.issued_date || !req.body.expiry_date) {
      return res.status(400).json({
        error: 'Missing required fields: license_number, license_type, full_name, issued_date, expiry_date'
      });
    }

    const verification = await licenseVerificationService.submitLicenseVerification(
      req.params.userId,
      {
        license_number: req.body.license_number,
        license_type: req.body.license_type,
        full_name: req.body.full_name,
        date_of_birth: req.body.date_of_birth,
        issued_date: req.body.issued_date,
        expiry_date: req.body.expiry_date,
        issued_country: req.body.issued_country,
        driving_class: req.body.driving_class,
        restrictions: req.body.restrictions
      },
      req.files.license_image_front[0],
      req.files.license_image_back ? req.files.license_image_back[0] : null
    );

    res.status(201).json({
      success: true,
      message: 'License verification submitted successfully',
      data: verification
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/license-verification
 * Get license verification info
 */
router.get('/:userId/license-verification', authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const verification = await licenseVerificationService.getLicenseVerification(req.params.userId);
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
 * Required fields: bank_account_number, bank_name, account_holder_name, account_type
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

    if (!req.body.bank_account_number || !req.body.bank_name || 
        !req.body.account_holder_name || !req.body.account_type) {
      return res.status(400).json({
        error: 'Missing required fields: bank_account_number, bank_name, account_holder_name, account_type'
      });
    }

    const verification = await bankVerificationService.submitBankVerification(
      req.params.userId,
      {
        bank_account_number: req.body.bank_account_number,
        bank_name: req.body.bank_name,
        account_holder_name: req.body.account_holder_name,
        account_type: req.body.account_type,
        bank_code: req.body.bank_code,
        branch_name: req.body.branch_name,
        verification_method: req.body.verification_method,
        is_default: req.body.is_default
      },
      req.files.bank_statement_image[0],
      req.files.id_card_image ? req.files.id_card_image[0] : null
    );

    res.status(201).json({
      success: true,
      message: 'Bank verification submitted successfully',
      data: verification
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /:userId/bank-verification
 * Get bank verification info (default account)
 */
router.get('/:userId/bank-verification', authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const verification = await bankVerificationService.getBankVerification(req.params.userId);
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * GET /:userId/bank-verifications
 * Get all bank verifications for user
 */
router.get('/:userId/bank-verifications', authenticateToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const verifications = await bankVerificationService.getAllBankVerifications(req.params.userId);
    res.json({
      success: true,
      data: verifications
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
