export const auth = {};
export const db = {};

export class GoogleAuthProvider {}

export const signInWithPopup = async (_auth: any, _provider: any) => {
  return {
    user: {
      uid: 'google-user-' + Date.now(),
      email: 'demo.user@school.com',
      displayName: 'Demo User',
      emailVerified: true,
    }
  };
};

export const signInWithEmailAndPassword = async (_auth: any, email: string, _pass: string) => {
  return {
    user: {
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      emailVerified: true,
    }
  };
};

export const createUserWithEmailAndPassword = async (_auth: any, email: string, _pass: string) => {
  return {
    user: {
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      emailVerified: true,
    }
  };
};

export const sendEmailVerification = async () => {};
export const updateProfile = async () => {};

export const doc = (...args: any[]) => ({ id: args[args.length - 1] });
export const setDoc = async () => {};
export const deleteDoc = async () => {};
export const collection = () => ({});
export const getDocs = async () => ({ empty: true, docs: [] });
export const query = () => ({});
export const where = () => ({});
export const addDoc = async () => ({ id: 'doc_' + Date.now() });
export const serverTimestamp = () => new Date().toISOString();
