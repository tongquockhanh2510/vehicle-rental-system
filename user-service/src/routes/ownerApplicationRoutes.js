import express from 'express';
import OwnerApplication from '../models/OwnerApplication.js';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

function toOwnerStatus(value) {
  const raw = String(value || '').toUpperCase();
  if (raw === STATUS.APPROVED) return STATUS.APPROVED;
  if (raw === STATUS.REJECTED) return STATUS.REJECTED;
  if (raw === STATUS.PENDING) return STATUS.PENDING;
  return STATUS.NONE;
}

function mapApplicationDoc(application) {
  if (!application) return null;

  const profile = application.owner_profile || {};
  const ownerProfile = {
    ...profile,
    legal_name: profile.legal_name || profile.full_name || '',
    phone: profile.phone || '',
    email: profile.email || '',
    address: profile.address || '',
    id_number: profile.id_number || '',
    id_card_front_url:
      profile.id_card_front_url ||
      profile.id_image_front ||
      profile.id_front_url ||
      '',
    id_card_back_url:
      profile.id_card_back_url ||
      profile.id_image_back ||
      profile.id_back_url ||
      '',
    bank_name: profile.bank_name || '',
    bank_account_number: profile.bank_account_number || '',
    bank_account_holder: profile.bank_account_holder || '',
    bank_branch: profile.bank_branch || ''
  };

  return {
    _id: application._id,
    user_id: application.user_id,
    applicant_name: application.applicant_name || '',
    email: application.email || '',
    phone: application.phone || '',
    owner_profile: ownerProfile,
    legal_name: ownerProfile.legal_name,
    address: ownerProfile.address,
    id_number: ownerProfile.id_number,
    id_card_front_url: ownerProfile.id_card_front_url,
    id_card_back_url: ownerProfile.id_card_back_url,
    bank_name: ownerProfile.bank_name,
    bank_account_number: ownerProfile.bank_account_number,
    bank_account_holder: ownerProfile.bank_account_holder,
    bank_branch: ownerProfile.bank_branch,
    status: toOwnerStatus(application.status),
    review_note: application.review_note || '',
    rejection_reason: application.rejection_reason || '',
    submitted_at: application.submitted_at,
    reviewed_at: application.reviewed_at,
    reviewed_by: application.reviewed_by || null,
    created_at: application.created_at,
    updated_at: application.updated_at
  };
}

async function getLatestApplicationByUser(userId) {
  return await OwnerApplication.findOne({ user_id: userId }).sort({ created_at: -1 });
}

function isAdmin(req) {
  return String(req.userRole || '').toUpperCase() === 'ADMIN';
}

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [user, application] = await Promise.all([
      User.findById(req.userId),
      getLatestApplicationByUser(req.userId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const ownerStatus = toOwnerStatus(user.owner_status || application?.status);

    return res.json({
      success: true,
      data: {
        owner_status: ownerStatus,
        application: mapApplicationDoc(application)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const payload = req.body || {};
    const now = new Date();
    const existing = await getLatestApplicationByUser(req.userId);

    let application;

    if (existing) {
      existing.status = STATUS.PENDING;
      existing.rejection_reason = '';
      existing.review_note = '';
      existing.reviewed_at = null;
      existing.updated_at = now;
      existing.owner_profile = payload;
      existing.applicant_name = payload.legal_name || `${user.last_name || ''} ${user.first_name || ''}`.trim();
      existing.email = payload.email || user.email;
      existing.phone = payload.phone || user.phone;
      existing.submitted_at = now;
      application = await existing.save();
    } else {
      application = await OwnerApplication.create({
        user_id: user._id,
        applicant_name: payload.legal_name || `${user.last_name || ''} ${user.first_name || ''}`.trim(),
        email: payload.email || user.email,
        phone: payload.phone || user.phone,
        owner_profile: payload,
        status: STATUS.PENDING,
        submitted_at: now
      });
    }

    user.owner_status = STATUS.PENDING;
    user.owner_application_id = application._id;
    user.rejection_reason = '';
    user.updated_at = now;
    await user.save();

    return res.status(201).json({
      success: true,
      data: {
        owner_status: STATUS.PENDING,
        application: mapApplicationDoc(application)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    const query = {};
    if (req.query.status) {
      query.status = toOwnerStatus(req.query.status);
    }

    const applications = await OwnerApplication.find(query).sort({ created_at: -1 });

    return res.json({
      success: true,
      data: applications.map(mapApplicationDoc)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:applicationId', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    const application = await OwnerApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Owner application not found'
      });
    }

    return res.json({
      success: true,
      data: mapApplicationDoc(application)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/:applicationId/approve', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    const application = await OwnerApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Owner application not found'
      });
    }

    const user = await User.findById(application.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const now = new Date();
    application.status = STATUS.APPROVED;
    application.rejection_reason = '';
    application.review_note = req.body?.review_note || '';
    application.reviewed_at = now;
    application.reviewed_by = req.userId;
    application.updated_at = now;
    await application.save();

    user.owner_status = STATUS.APPROVED;
    user.owner_application_id = application._id;
    user.rejection_reason = '';
    user.updated_at = now;
    await user.save();

    return res.json({
      success: true,
      data: {
        owner_status: STATUS.APPROVED,
        application: mapApplicationDoc(application)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/:applicationId/reject', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    const application = await OwnerApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Owner application not found'
      });
    }

    const user = await User.findById(application.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const reason = req.body?.reason || req.body?.review_note || 'Hồ sơ chưa đạt yêu cầu';
    const now = new Date();
    application.status = STATUS.REJECTED;
    application.rejection_reason = reason;
    application.review_note = reason;
    application.reviewed_at = now;
    application.reviewed_by = req.userId;
    application.updated_at = now;
    await application.save();

    user.owner_status = STATUS.REJECTED;
    user.owner_application_id = application._id;
    user.rejection_reason = reason;
    user.updated_at = now;
    await user.save();

    return res.json({
      success: true,
      data: {
        owner_status: STATUS.REJECTED,
        application: mapApplicationDoc(application)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
