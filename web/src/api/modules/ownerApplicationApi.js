import apiClient from '../client';
import { normalizeOwnerStatus, OWNER_STATUSES } from '../../constants/roles';
import {
  findOwnerApplicationByUser,
  findUserRecord,
  isSameUser,
  patchOwnerApplicationRecord,
  patchUserRecord,
  readCurrentUser,
  readOwnerApplications,
  upsertOwnerApplicationRecord,
  upsertUserRecord,
  writeCurrentUser,
  writeOwnerApplications
} from '../../utils/authStorage';

function buildTimeline(status, createdAt, updatedAt, rejectionReason = '') {
  const created = createdAt || new Date().toISOString();
  const updated = updatedAt || created;

  if (status === OWNER_STATUSES.APPROVED) {
    return [
      { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: created },
      { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'COMPLETED', timestamp: updated },
      { key: 'APPROVED', label: 'Đã duyệt', status: 'COMPLETED', timestamp: updated }
    ];
  }

  if (status === OWNER_STATUSES.REJECTED) {
    return [
      { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: created },
      { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'COMPLETED', timestamp: updated },
      {
        key: 'REJECTED',
        label: rejectionReason ? `Bị từ chối: ${rejectionReason}` : 'Bị từ chối',
        status: 'REJECTED',
        timestamp: updated
      }
    ];
  }

  return [
    { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: created },
    { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'ACTIVE', timestamp: updated },
    { key: 'RESULT', label: 'Chờ kết quả', status: 'PENDING' }
  ];
}

function createLocalApplication(payload, user, status = OWNER_STATUSES.PENDING, extra = {}) {
  const now = new Date().toISOString();
  const finalStatus = normalizeOwnerStatus(status);
  return {
    _id: extra._id || `OWN-${Date.now()}`,
    user_id: user?._id || user?.id || extra.user_id,
    applicant_name: payload.legal_name || extra.applicant_name || user?.full_name || '',
    email: payload.email || user?.email || extra.email || '',
    phone: payload.phone || user?.phone || extra.phone || '',
    owner_profile: {
      ...payload,
      ...(extra.owner_profile || {})
    },
    status: finalStatus,
    review_note: extra.review_note || '',
    rejection_reason: extra.rejection_reason || '',
    created_at: extra.created_at || now,
    updated_at: extra.updated_at || now,
    timeline:
      extra.timeline ||
      buildTimeline(finalStatus, extra.created_at || now, extra.updated_at || now, extra.rejection_reason || '')
  };
}

function extractOwnerEnvelope(responseData) {
  const payload = responseData?.data && typeof responseData.data === 'object' ? responseData.data : responseData;

  const ownerStatus = normalizeOwnerStatus(
    payload?.owner_status || payload?.ownerStatus || payload?.status || OWNER_STATUSES.NONE
  );

  const application =
    payload?.application && typeof payload.application === 'object'
      ? payload.application
      : payload?._id
        ? payload
        : null;

  return {
    owner_status: ownerStatus,
    application
  };
}

function normalizeApiApplication(rawApp, user) {
  if (!rawApp || typeof rawApp !== 'object') return null;

  const status = normalizeOwnerStatus(rawApp.status || rawApp.owner_status || rawApp.ownerStatus || OWNER_STATUSES.PENDING);

  return createLocalApplication(rawApp.owner_profile || {}, user || {}, status, {
    _id: rawApp._id || rawApp.id || `OWN-${Date.now()}`,
    user_id: rawApp.user_id || rawApp.userId,
    applicant_name: rawApp.applicant_name,
    email: rawApp.email,
    phone: rawApp.phone,
    owner_profile: rawApp.owner_profile,
    review_note: rawApp.review_note || rawApp.reviewNote || '',
    rejection_reason: rawApp.rejection_reason || rawApp.rejectionReason || '',
    created_at: rawApp.created_at || rawApp.createdAt,
    updated_at: rawApp.updated_at || rawApp.updatedAt,
    timeline: Array.isArray(rawApp.timeline) ? rawApp.timeline : undefined
  });
}

function upsertFallbackRowsWithCurrentApp(app) {
  const rows = readOwnerApplications();
  const withoutCurrentUser = rows.filter(
    (item) => !isSameUser({ _id: item.user_id, email: item.email }, { _id: app.user_id, email: app.email })
  );
  const next = [app, ...withoutCurrentUser];
  writeOwnerApplications(next);
  return next;
}

function syncUserOwnerStatus(refUser, status, appId, extraPatch = {}) {
  const finalStatus = normalizeOwnerStatus(status);

  const baseRef = {
    _id: refUser?._id || refUser?.id || refUser?.user_id,
    email: refUser?.email
  };

  const existing = findUserRecord(baseRef);
  const patch = {
    owner_status: finalStatus,
    owner_application_id: appId || existing?.owner_application_id || '',
    ...extraPatch
  };

  if (existing) {
    patchUserRecord(baseRef, patch);
  } else {
    upsertUserRecord({ ...baseRef, role: 'USER', ...patch });
  }

  const current = readCurrentUser();
  if (current && isSameUser(current, baseRef)) {
    const nextCurrent = { ...current, ...patch };
    writeCurrentUser(nextCurrent);
    upsertUserRecord(nextCurrent);
  }
}

function findApplicationById(applicationId) {
  return readOwnerApplications().find((item) => String(item?._id || '') === String(applicationId || '')) || null;
}

export const ownerApplicationApi = {
  async submitOwnerApplication(payload) {
    const user = readCurrentUser();
    if (!user) {
      throw new Error('Bạn cần đăng nhập để gửi hồ sơ chủ xe.');
    }

    try {
      const response = await apiClient.post('/api/owner-applications', payload);
      const envelope = extractOwnerEnvelope(response.data);
      const status = normalizeOwnerStatus(envelope.owner_status || OWNER_STATUSES.PENDING);
      const app = normalizeApiApplication(envelope.application, user) || createLocalApplication(payload, user, status);

      upsertFallbackRowsWithCurrentApp(app);
      upsertOwnerApplicationRecord(app);
      syncUserOwnerStatus({ _id: app.user_id, email: app.email }, status, app._id);

      return { ...response, data: app, owner_status: status };
    } catch {
      const app = createLocalApplication(payload, user, OWNER_STATUSES.PENDING);
      upsertFallbackRowsWithCurrentApp(app);
      upsertOwnerApplicationRecord(app);
      syncUserOwnerStatus({ _id: app.user_id, email: app.email }, OWNER_STATUSES.PENDING, app._id);
      return { data: app, owner_status: OWNER_STATUSES.PENDING };
    }
  },

  async getMyOwnerApplication() {
    const user = readCurrentUser();
    if (!user) {
      return { data: null, owner_status: OWNER_STATUSES.NONE };
    }

    try {
      const response = await apiClient.get('/api/owner-applications/me');
      const envelope = extractOwnerEnvelope(response.data);
      const status = normalizeOwnerStatus(envelope.owner_status);
      const app = normalizeApiApplication(envelope.application, user);

      syncUserOwnerStatus(user, status, app?._id || user?.owner_application_id || '', {
        rejection_reason: app?.rejection_reason || ''
      });

      if (app) {
        upsertOwnerApplicationRecord(app);
      }

      return { ...response, data: app, owner_status: status };
    } catch {
      const localApp = findOwnerApplicationByUser(user);
      if (localApp) {
        return { data: localApp, owner_status: normalizeOwnerStatus(localApp.status) };
      }

      return { data: null, owner_status: normalizeOwnerStatus(user.owner_status) };
    }
  },

  async getOwnerApplications(params = {}) {
    try {
      const response = await apiClient.get('/api/owner-applications', { params });
      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];

      return {
        ...response,
        data: rows.map((item) => normalizeApiApplication(item, readCurrentUser() || {}) || item)
      };
    } catch {
      let rows = readOwnerApplications();
      if (params.status) {
        const status = String(params.status).toUpperCase();
        rows = rows.filter((item) => String(item.status || '').toUpperCase() === status);
      }
      return { data: rows };
    }
  },

  async approveOwnerApplication(applicationId, payload = {}) {
    try {
      const response = await apiClient.put(`/api/owner-applications/${applicationId}/approve`, payload);
      const envelope = extractOwnerEnvelope(response.data);
      const app = normalizeApiApplication(envelope.application, readCurrentUser() || {});
      const existing = findApplicationById(applicationId);
      const normalized = {
        ...(existing || {}),
        ...(app || {}),
        _id: existing?._id || app?._id || applicationId,
        user_id: existing?.user_id || app?.user_id,
        email: existing?.email || app?.email,
        status: OWNER_STATUSES.APPROVED,
        rejection_reason: ''
      };
      upsertOwnerApplicationRecord(normalized);
      patchOwnerApplicationRecord(applicationId, normalized);
      syncUserOwnerStatus({ _id: normalized.user_id, email: normalized.email }, OWNER_STATUSES.APPROVED, normalized._id);
      return { ...response, data: normalized, owner_status: OWNER_STATUSES.APPROVED };
    } catch {
      const rows = readOwnerApplications();
      const target = rows.find((item) => String(item._id) === String(applicationId));
      if (!target) {
        throw new Error('Không tìm thấy hồ sơ để duyệt.');
      }

      const now = new Date().toISOString();
      const normalized = {
        ...target,
        status: OWNER_STATUSES.APPROVED,
        review_note: payload.review_note || '',
        rejection_reason: '',
        updated_at: now,
        timeline: buildTimeline(OWNER_STATUSES.APPROVED, target.created_at, now)
      };

      patchOwnerApplicationRecord(applicationId, normalized);
      syncUserOwnerStatus({ _id: normalized.user_id, email: normalized.email }, OWNER_STATUSES.APPROVED, normalized._id);
      return { data: normalized, owner_status: OWNER_STATUSES.APPROVED };
    }
  },

  async rejectOwnerApplication(applicationId, payload = {}) {
    try {
      const response = await apiClient.put(`/api/owner-applications/${applicationId}/reject`, payload);
      const reason = payload.reason || payload.review_note || 'Hồ sơ chưa hợp lệ';
      const envelope = extractOwnerEnvelope(response.data);
      const app = normalizeApiApplication(envelope.application, readCurrentUser() || {});
      const existing = findApplicationById(applicationId);
      const normalized = {
        ...(existing || {}),
        ...(app || {}),
        _id: existing?._id || app?._id || applicationId,
        user_id: existing?.user_id || app?.user_id,
        email: existing?.email || app?.email,
        status: OWNER_STATUSES.REJECTED,
        rejection_reason: app?.rejection_reason || reason,
        review_note: app?.review_note || reason
      };
      upsertOwnerApplicationRecord(normalized);
      patchOwnerApplicationRecord(applicationId, normalized);
      syncUserOwnerStatus(
        { _id: normalized.user_id, email: normalized.email },
        OWNER_STATUSES.REJECTED,
        normalized._id,
        { rejection_reason: normalized.rejection_reason }
      );
      return { ...response, data: normalized, owner_status: OWNER_STATUSES.REJECTED };
    } catch {
      const rows = readOwnerApplications();
      const target = rows.find((item) => String(item._id) === String(applicationId));
      if (!target) {
        throw new Error('Không tìm thấy hồ sơ để từ chối.');
      }

      const reason = payload.reason || payload.review_note || 'Hồ sơ chưa hợp lệ';
      const now = new Date().toISOString();
      const normalized = {
        ...target,
        status: OWNER_STATUSES.REJECTED,
        review_note: reason,
        rejection_reason: reason,
        updated_at: now,
        timeline: buildTimeline(OWNER_STATUSES.REJECTED, target.created_at, now, reason)
      };

      patchOwnerApplicationRecord(applicationId, normalized);
      syncUserOwnerStatus(
        { _id: normalized.user_id, email: normalized.email },
        OWNER_STATUSES.REJECTED,
        normalized._id,
        { rejection_reason: reason }
      );
      return { data: normalized, owner_status: OWNER_STATUSES.REJECTED };
    }
  }
};

