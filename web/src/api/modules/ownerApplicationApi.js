import apiClient from '../client';

function readUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readApps() {
  try {
    const raw = localStorage.getItem('mock_owner_applications_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeApps(rows) {
  localStorage.setItem('mock_owner_applications_v1', JSON.stringify(rows));
}

function updateStoredUser(patch) {
  const user = readUser();
  if (!user) return;
  localStorage.setItem('user', JSON.stringify({ ...user, ...(patch || {}) }));
}

function createApp(payload, user) {
  const now = new Date().toISOString();
  return {
    _id: `OWN-${Date.now()}`,
    user_id: user?._id || user?.id,
    applicant_name: payload.legal_name,
    email: user?.email || '',
    phone: payload.phone || user?.phone || '',
    owner_profile: payload,
    status: 'PENDING',
    review_note: '',
    created_at: now,
    updated_at: now,
    timeline: [
      { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: now },
      { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'ACTIVE', timestamp: now },
      { key: 'RESULT', label: 'Chờ kết quả', status: 'PENDING' }
    ]
  };
}

function ensureSeedData(rows) {
  if (rows.length) return rows;
  return [
    {
      _id: 'OWN-DEMO-001',
      user_id: 'USR-DEMO-001',
      applicant_name: 'Nguyễn Văn A',
      email: 'owner.demo@rentcar.vn',
      phone: '0900000001',
      owner_profile: {
        legal_name: 'Nguyễn Văn A',
        id_number: '079123456789',
        address: 'Quận 1, TP.HCM',
        bank_name: 'Vietcombank',
        bank_account_number: '0123456789',
        bank_account_holder: 'NGUYEN VAN A'
      },
      status: 'PENDING',
      review_note: '',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
      timeline: [
        { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
        { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'ACTIVE', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
        { key: 'RESULT', label: 'Chờ kết quả', status: 'PENDING' }
      ]
    }
  ];
}

export const ownerApplicationApi = {
  async submitOwnerApplication(payload) {
    try {
      const response = await apiClient.post('/api/owner-applications', payload);
      return response;
    } catch {
      const user = readUser();
      if (!user) {
        throw new Error('Bạn cần đăng nhập để gửi hồ sơ chủ xe.');
      }
      const userId = user._id || user.id;
      let rows = ensureSeedData(readApps()).filter((item) => String(item.user_id) !== String(userId));
      const app = createApp(payload, user);
      rows = [app, ...rows];
      writeApps(rows);
      updateStoredUser({ owner_status: 'PENDING' });
      return { data: app };
    }
  },

  async getMyOwnerApplication() {
    try {
      const response = await apiClient.get('/api/owner-applications/me');
      return response;
    } catch {
      const user = readUser();
      const userId = user?._id || user?.id;
      const rows = ensureSeedData(readApps());
      const app = rows.find((item) => String(item.user_id) === String(userId));
      return { data: app || null };
    }
  },

  async getOwnerApplications(params = {}) {
    try {
      return await apiClient.get('/api/owner-applications', { params });
    } catch {
      let rows = ensureSeedData(readApps());
      if (params.status) {
        const status = String(params.status).toUpperCase();
        rows = rows.filter((item) => String(item.status).toUpperCase() === status);
      }
      return { data: rows };
    }
  },

  async approveOwnerApplication(applicationId, payload = {}) {
    try {
      return await apiClient.put(`/api/owner-applications/${applicationId}/approve`, payload);
    } catch {
      const rows = ensureSeedData(readApps());
      const next = rows.map((item) => {
        if (String(item._id) !== String(applicationId)) return item;
        const now = new Date().toISOString();
        return {
          ...item,
          status: 'APPROVED',
          review_note: payload.review_note || '',
          updated_at: now,
          timeline: [
            { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: item.created_at },
            { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'COMPLETED', timestamp: item.updated_at || item.created_at },
            { key: 'APPROVED', label: 'Đã duyệt', status: 'COMPLETED', timestamp: now }
          ]
        };
      });
      writeApps(next);

      const current = readUser();
      const target = next.find((item) => String(item._id) === String(applicationId));
      if (current && target && String(current._id || current.id) === String(target.user_id)) {
        updateStoredUser({ owner_status: 'APPROVED' });
      }

      return { data: next.find((item) => String(item._id) === String(applicationId)) };
    }
  },

  async rejectOwnerApplication(applicationId, payload = {}) {
    try {
      return await apiClient.put(`/api/owner-applications/${applicationId}/reject`, payload);
    } catch {
      const rows = ensureSeedData(readApps());
      const next = rows.map((item) => {
        if (String(item._id) !== String(applicationId)) return item;
        const now = new Date().toISOString();
        return {
          ...item,
          status: 'REJECTED',
          review_note: payload.reason || payload.review_note || 'Hồ sơ chưa hợp lệ',
          updated_at: now,
          timeline: [
            { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: item.created_at },
            { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'COMPLETED', timestamp: item.updated_at || item.created_at },
            { key: 'REJECTED', label: 'Bị từ chối', status: 'REJECTED', timestamp: now }
          ]
        };
      });
      writeApps(next);

      const current = readUser();
      const target = next.find((item) => String(item._id) === String(applicationId));
      if (current && target && String(current._id || current.id) === String(target.user_id)) {
        updateStoredUser({ owner_status: 'REJECTED' });
      }

      return { data: next.find((item) => String(item._id) === String(applicationId)) };
    }
  }
};
