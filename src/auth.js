// Authentication Module — Google Sign-In
import { auth } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      return null;
    }
    console.error('Auth error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Listen for auth state changes
 * @param {function} callback - receives user object or null
 * @returns {function} unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}
