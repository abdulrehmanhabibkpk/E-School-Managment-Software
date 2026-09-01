export const originalGetItem = localStorage.getItem.bind(localStorage);
export const originalSetItem = localStorage.setItem.bind(localStorage);
export const originalRemoveItem = localStorage.removeItem.bind(localStorage);

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
    let targetKey = key;
    if (activeSchoolId && !GLOBAL_KEYS.includes(key)) {
      targetKey = `${activeSchoolId}_${key}`;
    }
    originalSetItem(targetKey, value);
    window.dispatchEvent(new CustomEvent('storage_updated', { detail: { key, value, targetKey } }));
  };

  localStorage.removeItem = (key: string) => {
    const activeSchoolId = originalGetItem('active_school_id');
    let targetKey = key;
    if (activeSchoolId && !GLOBAL_KEYS.includes(key)) {
      targetKey = `${activeSchoolId}_${key}`;
    }
    originalRemoveItem(targetKey);
    window.dispatchEvent(new CustomEvent('storage_updated', { detail: { key, targetKey, isRemoval: true } }));
  };
}
