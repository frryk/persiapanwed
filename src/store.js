// Firestore Data Store — per-user CRUD with realtime listener
import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

// Default state for a brand new wedding tracker
export const defaultState = {
  theme: 'light',
  persiapan: [
    { id: 1, title: 'Menentukan Tanggal', desc: 'Diskusikan dengan keluarga kedua belah pihak', checked: false },
    { id: 2, title: 'Cincin Kawin', desc: 'Membeli sepasang cincin', checked: false },
    { id: 3, title: 'Mahar', desc: 'Sesuai kesepakatan', checked: false },
  ],
  timeline: [
    { id: 1, month: 'Bulan 12-10 Sebelum H', task: 'Tentukan tanggal dan budget', checked: false },
    { id: 2, month: 'Bulan 9-6 Sebelum H', task: 'DP Venue dan Catering', checked: false },
  ],
  berkasCPW: [
    { id: 1, title: 'FC KTP, KK, Akta Kelahiran', checked: false },
    { id: 2, title: 'Surat Pengantar RT/RW', checked: false },
    { id: 3, title: 'Surat N1, N2, N4 dari Kelurahan', checked: false },
  ],
  berkasCPP: [
    { id: 1, title: 'FC KTP, KK, Akta Kelahiran', checked: false },
    { id: 2, title: 'Surat Pengantar RT/RW', checked: false },
    { id: 3, title: 'Surat N1, N2, N4 dari Kelurahan', checked: false },
  ],
  budget: [],
  seserahan: [],
  vendorSeleksi: [],
  vendorFinal: [],
  jobdesk: [],
  jobdeskTeman: [],
  masterJobdeskTeman: [],
  masterNamaTeman: [],
  rundown: [],
  undangan: [],
  moodboard: { categories: [], photos: [] },
  weddingDate: '',
  berkasCPWLink: '',
  berkasCPPLink: '',
  notes: '',
};

let appState = null;
let isLoaded = false;
let unsubscribeSnapshot = null;
let currentDataOwnerUid = null;

export function getAppState() {
  return appState;
}

export function getIsLoaded() {
  return isLoaded;
}

export function getDataOwnerUid() {
  return currentDataOwnerUid;
}

/**
 * Get user profile doc to check if they have data or are linked
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
  return snap.exists() ? snap.data() : null;
}

/**
 * Save user profile
 */
export async function saveUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), data, { merge: true });
}

/**
 * Initialize data for a new owner
 */
export async function createNewWeddingData(user) {
  const state = JSON.parse(JSON.stringify(defaultState));
  await setDoc(doc(db, 'users', user.uid, 'weddingData', 'main'), state);
  
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  await saveUserProfile(user.uid, { 
    role: 'owner', 
    createdAt: now.toISOString(),
    trialEndsAt: trialEndsAt,
    isPremium: false,
    email: user.email || '',
    name: user.displayName || 'User'
  });
  return state;
}

import { collectionGroup, getDocs } from 'firebase/firestore';

/**
 * Get all users for Admin Panel (Super Admin only)
 */
export async function getAllUsers() {
  try {
    const q = collectionGroup(db, 'profile');
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((docSnap) => {
      const uid = docSnap.ref.parent.parent.id;
      users.push({ uid, ...docSnap.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return { error: error.message };
  }
}

/**
 * Start listening to wedding data (owner or linked partner)
 */
export function listenToData(ownerUid, onDataChange, onError) {
  // Unsubscribe from previous listener if any
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }

  currentDataOwnerUid = ownerUid;
  isLoaded = false;

  const docRef = doc(db, 'users', ownerUid, 'weddingData', 'main');

  unsubscribeSnapshot = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Ensure all arrays exist (Firestore removes empty arrays)
      appState = {
        theme: data.theme || 'light',
        persiapan: data.persiapan || [],
        timeline: data.timeline || [],
        berkasCPW: data.berkasCPW || [],
        berkasCPP: data.berkasCPP || [],
        budget: data.budget || [],
        seserahan: data.seserahan || [],
        vendorSeleksi: data.vendorSeleksi || [],
        vendorFinal: data.vendorFinal || [],
        jobdesk: data.jobdesk || [],
        jobdeskTeman: data.jobdeskTeman || [],
        masterJobdeskTeman: data.masterJobdeskTeman || [],
        masterNamaTeman: data.masterNamaTeman || [],
        rundown: data.rundown || [],
        undangan: data.undangan || [],
        moodboard: data.moodboard || { categories: [], photos: [] },
        weddingDate: data.weddingDate || '',
        berkasCPWLink: data.berkasCPWLink || '',
        berkasCPPLink: data.berkasCPPLink || '',
        notes: data.notes || '',
      };
    } else {
      // Document doesn't exist, create defaults
      appState = JSON.parse(JSON.stringify(defaultState));
      setDoc(docRef, appState);
    }

    isLoaded = true;
    if (onDataChange) onDataChange(appState);
  }, (error) => {
    console.error('Firestore listen error:', error);
    if (onError) onError(error);
  });

  return unsubscribeSnapshot;
}

/**
 * Save full state back to Firestore
 */
export async function saveState() {
  if (!appState || !currentDataOwnerUid) return;
  try {
    await setDoc(
      doc(db, 'users', currentDataOwnerUid, 'weddingData', 'main'),
      appState
    );
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

/**
 * Update specific field in state and save
 */
export async function updateState(key, value) {
  if (!appState || !currentDataOwnerUid) return;
  appState[key] = value;
  try {
    await updateDoc(
      doc(db, 'users', currentDataOwnerUid, 'weddingData', 'main'),
      { [key]: value }
    );
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

/**
 * Stop listening to data
 */
export function stopListening() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  appState = null;
  isLoaded = false;
  currentDataOwnerUid = null;
}
