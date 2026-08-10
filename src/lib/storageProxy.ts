const originalGetItem = localStorage.getItem.bind(localStorage);
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

const GLOBAL_KEYS = [
  'active_school_id',
  'currentUser',
  'currentUserName',
  'currentUserRole',
  'isLoggedIn',
  'isSuperAdmin',
  'userStatus',
  'paymentStatus',
  'licensed_madrasas',
  'users',
  'system_freeze',
  'recycle_bin'
];

export function initStorageProxy() {
  localStorage.getItem = (key: string) => {
    const activeSchoolId = originalGetItem('active_school_id');
    if (activeSchoolId && !GLOBAL_KEYS.includes(key)) {
      return originalGetItem(`${activeSchoolId}_${key}`);
    }
    return originalGetItem(key);
  };

  localStorage.setItem = (key: string, value: string) => {
    const activeSchoolId = originalGetItem('active_school_id');
    if (activeSchoolId && !GLOBAL_KEYS.includes(key)) {
      originalSetItem(`${activeSchoolId}_${key}`, value);
    } else {
      originalSetItem(key, value);
    }
    window.dispatchEvent(new Event('storage_updated'));
  };

  localStorage.removeItem = (key: string) => {
    const activeSchoolId = originalGetItem('active_school_id');
    if (activeSchoolId && !GLOBAL_KEYS.includes(key)) {
      originalRemoveItem(`${activeSchoolId}_${key}`);
    } else {
      originalRemoveItem(key);
    }
    window.dispatchEvent(new Event('storage_updated'));
  };
}
