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
import { originalSetItem } from './lib/storageProxy';

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
  
  // Use originalSetItem to avoid recursion if we are wrapping
  if (originalSetItem) {
    originalSetItem.call(localStorage, key, valString);
  } else {
    localStorage.setItem(key, valString);
  }
  
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

      // Multi-tenancy check
      const schoolId = localStorage.getItem('active_school_id');
      const docPath = schoolId ? `schools/${schoolId}/state/${key}` : `state/${key}`;
      const docRef = doc(db, docPath);

      await setDoc(docRef, {
        key: key,
        data: rawData,
        updatedAt: new Date().toISOString(),
        schoolId: schoolId || 'global'
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
      // 1. Pull global state
      const globalColRef = collection(db, 'state');
      const globalSnapshot = await getDocs(globalColRef);
      globalSnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        if (docData && docData.key && docData.data !== undefined) {
          const key = docData.key;
          const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
          originalSetItem.call(localStorage, key, valString);
        }
      });

      // 2. Pull school-specific state
      const schoolId = localStorage.getItem('active_school_id');
      if (schoolId) {
        const schoolColRef = collection(db, `schools/${schoolId}/state`);
        const schoolSnapshot = await getDocs(schoolColRef);
        schoolSnapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          if (docData && docData.key && docData.data !== undefined) {
            const key = docData.key;
            const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
            originalSetItem.call(localStorage, key, valString);
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'state');
    }
  }
  sanitizeLocalStorage();
  window.dispatchEvent(new Event('storage_updated'));
}

let unsubscribeSync: (() => void)[] = [];

/**
 * Start real-time listeners.
 */
export function startRealTimeSync() {
  stopRealTimeSync();

  if (auth.currentUser) {
    // 1. Global listener
    const globalColRef = collection(db, 'state');
    const unsubGlobal = onSnapshot(globalColRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const docData = change.doc.data();
          if (docData && docData.key && docData.data !== undefined) {
            const key = docData.key;
            const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
            const currentLocal = localStorage.getItem(key);
            if (currentLocal !== valString) {
              originalSetItem(key, valString);
              window.dispatchEvent(new Event('storage_updated'));
            }
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'state');
    });
    unsubscribeSync.push(unsubGlobal);

    // 2. School-specific listener
    const schoolId = localStorage.getItem('active_school_id');
    if (schoolId) {
      const schoolColRef = collection(db, `schools/${schoolId}/state`);
      const unsubSchool = onSnapshot(schoolColRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const docData = change.doc.data();
            if (docData && docData.key && docData.data !== undefined) {
              const key = docData.key;
              const valString = typeof docData.data === 'string' ? docData.data : JSON.stringify(docData.data);
              const currentLocal = localStorage.getItem(key);
              if (currentLocal !== valString) {
                originalSetItem(key, valString);
                window.dispatchEvent(new Event('storage_updated'));
              }
            }
          }
        });
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/state`);
      });
      unsubscribeSync.push(unsubSchool);
    }
    
    // Set up event listener for local changes to push to Cloud
    const handleLocalUpdate = (e: any) => {
      const { key, value, isRemoval } = e.detail || {};
      if (key && SYNC_KEYS.includes(key) && !isRemoval) {
        if (auth.currentUser) {
          updateCentralKey(key, value).catch(err => {
            console.error(`Deferred sync error for key ${key}:`, err);
          });
        }
      }
    };
    window.addEventListener('storage_updated', handleLocalUpdate);
    unsubscribeSync.push(() => window.removeEventListener('storage_updated', handleLocalUpdate));

    console.log('Real-time sync listeners active.');
  }
}

/**
 * Stop all active real-time listeners.
 */
export function stopRealTimeSync() {
  unsubscribeSync.forEach(unsub => unsub());
  unsubscribeSync = [];
}

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
