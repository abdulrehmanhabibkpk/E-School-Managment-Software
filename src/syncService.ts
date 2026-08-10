import { sanitizeLocalStorage } from './lib/dataSanitizer';
import { 
  db, 
  auth, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  OperationType, 
  handleFirestoreError,
  onAuthStateChanged
} from './firebase';

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
  'urdu_notes',
  'diary_entries'
];

/**
 * Update a specific key in local storage and write to Firestore.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Always update local storage first for instant UI response
  const valString = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, valString);
  window.dispatchEvent(new Event('storage_updated'));

  // Sync to Firestore if signed in
  if (auth.currentUser) {
    try {
      let rawData = value;
      if (typeof value === 'string') {
        try {
          rawData = JSON.parse(value);
        } catch (e) {
          // If not a valid JSON string, keep as string
        }
      }

      const docRef = doc(db, 'state', key);
      await setDoc(docRef, {
        key: key,
        data: rawData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `state/${key}`);
    }
  }
  return true;
}

/**
 * Pull all data from Firestore to local storage.
 */
export async function pullGlobalData(): Promise<void> {
  if (auth.currentUser) {
    try {
      const colRef = collection(db, 'state');
      const querySnapshot = await getDocs(colRef);
      querySnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        if (docData && docData.key && docData.data !== undefined) {
          const key = docData.key;
          const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
          localStorage.setItem(key, valString);
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'state');
    }
  }
  sanitizeLocalStorage();
  window.dispatchEvent(new Event('storage_updated'));
}

let unsubscribeSync: (() => void) | null = null;

/**
 * Start real-time listeners.
 */
export function startRealTimeSync() {
  if (unsubscribeSync) {
    unsubscribeSync();
    unsubscribeSync = null;
  }

  if (auth.currentUser) {
    const colRef = collection(db, 'state');
    unsubscribeSync = onSnapshot(colRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const docData = change.doc.data();
          if (docData && docData.key && docData.data !== undefined) {
            const key = docData.key;
            const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
            
            // Check current local state to prevent infinite loops of local events
            const currentLocal = localStorage.getItem(key);
            if (currentLocal !== valString) {
              localStorage.setItem(key, valString);
              window.dispatchEvent(new Event('storage_updated'));
            }
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'state');
    });
    console.log('Real-time sync listeners active.');
  } else {
    console.log('Real-time sync skipped (not authenticated).');
  }
}

/**
 * Stop all active real-time listeners.
 */
export function stopRealTimeSync() {
  if (unsubscribeSync) {
    unsubscribeSync();
    unsubscribeSync = null;
    console.log('Stopped active sync listeners.');
  }
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
    // Trigger async push to Firestore
    if (auth.currentUser) {
      updateCentralKey(key, value).catch(err => {
        console.error(`Deferred sync error for key ${key}:`, err);
      });
    }
  }
};

/**
 * Perform manual sync fallback pushing all local state keys to firestore.
 */
export async function triggerClientOfflineSync(): Promise<void> {
  if (auth.currentUser) {
    for (const key of SYNC_KEYS) {
      const localVal = localStorage.getItem(key);
      if (localVal !== null) {
        await updateCentralKey(key, localVal);
      }
    }
  }
}

// Set up automatic listeners on Auth state changed
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('User signed into Firebase:', user.email);
      await pullGlobalData();
      startRealTimeSync();
    } else {
      console.log('User logged out from Firebase.');
      stopRealTimeSync();
    }
  });

  // Global network status listeners
  window.addEventListener('online', () => {
    window.dispatchEvent(new Event('network_online'));
    triggerClientOfflineSync().catch(err => console.error('Offline sync failed:', err));
  });
  
  window.addEventListener('offline', () => {
    window.dispatchEvent(new Event('network_offline'));
  });
}

export async function syncToServer(): Promise<boolean> {
  if (auth.currentUser) {
    await triggerClientOfflineSync();
    return true;
  }
  return false;
}
