export const db = {};
export const auth: any = {
  currentUser: null
};

export class GoogleAuthProvider {
  constructor(...args: any[]) {}
}

export const signInWithPopup = async (...args: any[]): Promise<any> => {
  throw new Error("Google Sign-In is unavailable because Firebase has been deleted.");
};

export const signInWithEmailAndPassword = async (...args: any[]): Promise<any> => {
  throw new Error("Sign-In is unavailable because Firebase has been deleted.");
};

export const createUserWithEmailAndPassword = async (...args: any[]): Promise<any> => {
  throw new Error("Account creation is unavailable because Firebase has been deleted.");
};

export const signOut = async (...args: any[]): Promise<any> => {};
export const sendEmailVerification = async (...args: any[]): Promise<any> => {};
export const updateProfile = async (...args: any[]): Promise<any> => {};

export const doc = (...args: any[]): any => ({});
export const getDoc = async (...args: any[]): Promise<any> => ({ 
  exists: () => false, 
  data: () => null,
  empty: true,
  docs: []
});
export const getDocFromServer = async (...args: any[]): Promise<any> => ({ 
  exists: () => false, 
  data: () => null,
  empty: true,
  docs: []
});
export const setDoc = async (...args: any[]): Promise<any> => {};
export const deleteDoc = async (...args: any[]): Promise<any> => {};
export const collection = (...args: any[]): any => ({});
export const getDocs = async (...args: any[]): Promise<any> => ({
  forEach: (callback: any) => {},
  empty: true,
  docs: []
});
export const query = (...args: any[]): any => ({});
export const where = (...args: any[]): any => ({});
export const addDoc = async (...args: any[]): Promise<any> => ({ id: '1' });
export const serverTimestamp = (...args: any[]): any => new Date();
export const onSnapshot = (...args: any[]): any => () => {};

export const onAuthStateChanged = (...args: any[]): any => {
  const callback = args[1] || args[0];
  if (typeof callback === 'function') {
    callback(null);
  }
  return () => {};
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error);
}
