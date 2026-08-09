// Removed Firebase dependencies as per user request
import { sanitizeLocalStorage } from './lib/dataSanitizer';

// List of all keys we sync between localStorage and Firestore
const SYNC_KEYS = [
  'students',
  'staff',
  'system_settings',
  'website_settings',
  'website_fatawa',
  'website_gallery',
  'website_gallery_categories',
  'website_home_sections',
  'books',
  'grades',
  'results',
  'saved_salaries',
  'saved_fees',
  'role_permissions',
  'users',
  'recycle_bin',
  'books_list',
  'book_assignments',
  'grades_list',
  'addresses',
  'districts',
  'madrasas',
  'exams',
  'hours',
  'expulsions',
  'gradeSettings',
  'minPositionPercentage',
  'positions',
  'online_links',
  'online_applications',
  'licensed_madrasas',
  'examRecords',
  'all_exam_results',
  'jamia_papers',
  'jamia_posts',
  'fin_transactions',
  'fin_heads',
  'fin_accounts',
  'library_books',
  'studentList',
  'teacherAttendance',
  'attendanceRecords',
  'zk_attendance_data',
  'urdu_notes'
];

/**
 * Update a specific key in local storage.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Always update local storage first for instant UI response
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  window.dispatchEvent(new Event('storage_updated'));
  return true;
}

/**
 * Pull all data (No-op in local-only mode)
 */
export async function pullGlobalData(): Promise<void> {
  sanitizeLocalStorage();
  window.dispatchEvent(new Event('storage_updated'));
  console.log('Local data sanitized and UI updated.');
}

/**
 * Start real-time listeners (No-op in local-only mode)
 */
export function startRealTimeSync() {
  console.log('Real-time sync is now local-only.');
}

/**
 * Stop all active real-time listeners (No-op in local-only mode)
 */
export function stopRealTimeSync() {
  console.log('Stopped local sync listeners.');
}

/**
 * Monkey-patch localStorage.setItem to dispatch events locally.
 */
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key: string, value: string): void {
  // Write locally
  originalSetItem.call(localStorage, key, value);
  
  if (SYNC_KEYS.includes(key)) {
    window.dispatchEvent(new Event('storage_updated'));
  }
};

/**
 * Perform manual sync fallback (No-op in local-only mode)
 */
export async function triggerClientOfflineSync(): Promise<void> {
  // No-op
}

// Global network status listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    window.dispatchEvent(new Event('network_online'));
  });
  
  window.addEventListener('offline', () => {
    window.dispatchEvent(new Event('network_offline'));
  });
}

export async function syncToServer(): Promise<boolean> {
  return true;
}

