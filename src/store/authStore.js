import { create } from 'zustand';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,
  verificationId: null,

  initAuth: () => {
    if (!auth) {
      set({ loading: false });
      return;
    }
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  loginWithGoogle: async () => {
    if (!auth) return;
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      set({ user: result.user, loading: false });
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      set({ error: err.message, loading: false });
    }
  },

  sendOtp: async (phoneNumber, containerId) => {
    if (!auth) return;
    set({ loading: true, error: null });
    try {
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, proceed with phone auth
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      set({ verificationId: confirmationResult.verificationId, loading: false });
      return confirmationResult;
    } catch (err) {
      console.error('Phone Auth OTP Error:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  confirmOtp: async (confirmationResult, code) => {
    set({ loading: true, error: null });
    try {
      const result = await confirmationResult.confirm(code);
      set({ user: result.user, verificationId: null, loading: false });
    } catch (err) {
      console.error('OTP Confirmation Error:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    if (!auth) return;
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (err) {
      console.error('Logout Error:', err);
      set({ loading: false });
    }
  }
}));
