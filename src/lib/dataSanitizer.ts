
/**
 * Data Sanitizer Utility
 * Helps fix duplicate IDs in localStorage that cause React key errors.
 */

import { generateNumericId, generateUniqueId } from './idUtils';

const SYNC_KEYS = [
  'students',
  'staff',
  'users',
  'books_list',
  'grades_list',
  'jamia_posts',
  'fin_transactions',
  'attendanceRecords'
];

export function sanitizeLocalStorage() {
  console.log('Running localStorage Data Sanitization...');
  let totalFixed = 0;

  SYNC_KEYS.forEach(key => {
    try {
      const dataStr = localStorage.getItem(key);
      if (!dataStr) return;

      const data = JSON.parse(dataStr);
      if (!Array.isArray(data)) return;

      const seenIds = new Set();
      let changed = false;

      const cleanedData = data.map((item, index) => {
        if (!item || typeof item !== 'object') return item;

        // If ID is missing or duplicate
        if (item.id === undefined || item.id === null || seenIds.has(item.id)) {
          changed = true;
          totalFixed++;
          
          // Generate a new ID
          const newId = typeof item.id === 'string' 
            ? `${item.id}-fixed-${index}-${Math.floor(Math.random() * 1000)}`
            : generateNumericId();
            
          const newItem = { ...item, id: newId };
          seenIds.add(newId);
          return newItem;
        }

        seenIds.add(item.id);
        return item;
      });

      if (changed) {
        console.warn(`Sanitized ${key}: Fixed duplicates or missing IDs.`);
        localStorage.setItem(key, JSON.stringify(cleanedData));
        // We don't trigger storage_updated here to avoid loops, 
        // but App.tsx will continue once it finishes.
      }
    } catch (e) {
      console.error(`Failed to sanitize key "${key}":`, e);
    }
  });

  if (totalFixed > 0) {
    console.log(`Sanitization complete. Fixed ${totalFixed} items.`);
    window.dispatchEvent(new Event('storage_updated'));
  } else {
    console.log('Sanitization complete. No issues found.');
  }
}
