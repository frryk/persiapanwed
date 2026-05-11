// Sharing Module — Invite Code System
import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { generateInviteCode } from './utils.js';

/**
 * Generate and save an invite code for the owner
 */
export async function createInviteCode(ownerUid) {
  const code = generateInviteCode();
  await setDoc(doc(db, 'invites', code), {
    ownerUid,
    createdAt: new Date().toISOString(),
  });
  return code;
}

/**
 * Look up an invite code and return the owner UID
 */
export async function lookupInviteCode(code) {
  const snap = await getDoc(doc(db, 'invites', code.toUpperCase()));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Get existing invite code for owner (if any)
 */
export async function getExistingInviteCode(ownerUid) {
  const q = query(
    collection(db, 'invites'),
    where('ownerUid', '==', ownerUid)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return docSnap.id;
  }
  return null;
}

/**
 * Delete an invite code
 */
export async function deleteInviteCode(code) {
  await deleteDoc(doc(db, 'invites', code));
}
