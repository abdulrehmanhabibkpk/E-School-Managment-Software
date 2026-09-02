
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
      }
    } catch (e) {
      console.error(`Failed to sanitize key "${key}":`, e);
    }
  });

  // Purge any dummy mock schools from localStorage mms_schools
  try {
    const dummySchoolNames = [
      "Siraj-ul-Uloom Academy",
      "Siraj-ul-Uloom Arabic University Mansehra",
      "Apex Model School",
      "Oasis Girls College"
    ];
    const dummyCodes = ["SUU-01", "AMH-02", "OGA-03", "MSA-015111"];
    
    // Get real current school name from system_settings if configured
    let currentJamiaName = "";
    try {
      const sysStr = localStorage.getItem("system_settings");
      if (sysStr) {
        const sys = JSON.parse(sysStr);
        if (sys.jamiaName) currentJamiaName = sys.jamiaName;
      }
    } catch (e) {}

    const savedSchools = localStorage.getItem("mms_schools");
    if (savedSchools) {
      const parsed = JSON.parse(savedSchools);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((s: any) => {
          if (!s || !s.name) return false;
          if (dummySchoolNames.includes(s.name) || dummyCodes.includes(s.code) || dummyCodes.includes(s.registrationPrefix)) {
            return false;
          }
          // If the school is "Modern School Academy" but the user's real school is configured as something else (e.g. "limo school")
          if (currentJamiaName && currentJamiaName !== "Modern School Academy" && s.name === "Modern School Academy") {
            return false;
          }
          return true;
        });

        if (filtered.length !== parsed.length) {
          localStorage.setItem("mms_schools", JSON.stringify(filtered));
          totalFixed += (parsed.length - filtered.length);
        }
      }
    }
  } catch (e) {}

  if (totalFixed > 0) {
    console.log(`Sanitization complete. Fixed ${totalFixed} items.`);
    window.dispatchEvent(new Event('storage_updated'));
  } else {
    console.log('Sanitization complete. No issues found.');
  }
}
