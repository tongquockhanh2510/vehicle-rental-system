import { ADMIN_MENU, OWNER_MENU, PUBLIC_NAV, RENTER_MENU } from '../../constants/menus';
import { OWNER_STATUSES, ROLES } from '../../constants/roles';

export function getNavigationForRole({ isAuthenticated, role, ownerStatus }) {
  if (!isAuthenticated) {
    return { navbar: PUBLIC_NAV, sidebar: [], portal: 'PUBLIC' };
  }

  if (role === ROLES.ADMIN) {
    return { navbar: ADMIN_MENU, sidebar: ADMIN_MENU, portal: 'ADMIN' };
  }

  if (ownerStatus === OWNER_STATUSES.APPROVED) {
    return { navbar: RENTER_MENU, sidebar: RENTER_MENU, ownerSidebar: OWNER_MENU, portal: 'RENTER_OWNER' };
  }

  return { navbar: RENTER_MENU, sidebar: RENTER_MENU, portal: 'RENTER' };
}

export default getNavigationForRole;
