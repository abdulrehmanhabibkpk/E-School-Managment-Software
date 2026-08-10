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

export const sendEmailVerification = async (..._args: any[]) => {};
export const updateProfile = async (..._args: any[]) => {};

export const doc = (...args: any[]) => ({ id: args[args.length - 1] });
export const setDoc = async (..._args: any[]) => {};
export const deleteDoc = async (..._args: any[]) => {};
export const collection = (..._args: any[]) => ({});
export const getDocs = async (..._args: any[]) => ({ empty: true, docs: [] });
export const query = (..._args: any[]) => ({});
export const where = (..._args: any[]) => ({});
export const addDoc = async (..._args: any[]) => ({ id: 'doc_' + Date.now() });
export const serverTimestamp = () => new Date().toISOString();

