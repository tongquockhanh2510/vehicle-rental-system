import { normalizeOwnerStatus, OWNER_STATUSES } from '../constants/roles';

export function getOwnerCta(user, ownerStatusInput) {
  const status = normalizeOwnerStatus(ownerStatusInput || user);

  if (!user) {
    return {
      label: 'Đăng ký làm chủ xe',
      to: '/become-owner',
      tone: 'cyan'
    };
  }

  if (status === OWNER_STATUSES.APPROVED) {
    return {
      label: 'Cổng chủ xe',
      to: '/owner/dashboard',
      tone: 'blue'
    };
  }

  if (status === OWNER_STATUSES.PENDING) {
    return {
      label: 'Hồ sơ đang chờ duyệt',
      to: '/app/owner-application-status',
      tone: 'amber'
    };
  }

  if (status === OWNER_STATUSES.REJECTED) {
    return {
      label: 'Cập nhật hồ sơ chủ xe',
      to: '/app/become-owner',
      tone: 'rose'
    };
  }

  return {
    label: 'Đăng ký làm chủ xe',
    to: '/app/become-owner',
    tone: 'cyan'
  };
}

export function getOwnerStatusHint(ownerStatusInput) {
  const status = normalizeOwnerStatus(ownerStatusInput);

  if (status === OWNER_STATUSES.PENDING) {
    return 'Hồ sơ chủ xe: Đang chờ duyệt';
  }
  if (status === OWNER_STATUSES.REJECTED) {
    return 'Hồ sơ chủ xe: Cần cập nhật';
  }
  if (status === OWNER_STATUSES.APPROVED) {
    return 'Hồ sơ chủ xe: Đã duyệt';
  }

  return '';
}
