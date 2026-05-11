// Main Entry Point — Auth Flow → Onboarding → App Init
import './styles/main.css';
import './styles/login.css';
import './styles/moodboard.css';

import { onAuthChange, signInWithGoogle, handleSignOut, getCurrentUser } from './auth.js';
import { getUserProfile, saveUserProfile, createNewWeddingData, listenToData, stopListening, getAppState, updateState } from './store.js';
import { lookupInviteCode, createInviteCode, getExistingInviteCode } from './sharing.js';
import { initApp, renderAll, closeSettingsModal, updateCountdown, renderAdminPanel } from './app.js';
import { exportSemuaKeExcel } from './modules/excelExport.js';
import { showToast } from './utils.js';
import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

// Screen references
const loadingScreen = document.getElementById('loadingScreen');
const loginScreen = document.getElementById('loginScreen');
const onboardingScreen = document.getElementById('onboardingScreen');
const paywallScreen = document.getElementById('paywallScreen');
const appMain = document.getElementById('appMain');

// Current user state
let currentUser = null;
let userProfile = null;

// ====== AUTH STATE LISTENER ======
onAuthChange(async (user) => {
  if (user) {
    currentUser = user;
    await handleAuthenticated(user);
  } else {
    currentUser = null;
    userProfile = null;
    stopListening();
    showScreen('login');
  }
});

// ====== SCREEN MANAGEMENT ======
function showScreen(screen) {
  loadingScreen.style.display = 'none';
  loginScreen.style.display = 'none';
  onboardingScreen.style.display = 'none';
  if (paywallScreen) paywallScreen.style.display = 'none';
  appMain.style.display = 'none';

  switch (screen) {
    case 'loading':
      loadingScreen.style.display = 'flex';
      break;
    case 'login':
      loginScreen.style.display = 'flex';
      break;
    case 'onboarding':
      onboardingScreen.style.display = 'flex';
      break;
    case 'paywall':
      if (paywallScreen) paywallScreen.style.display = 'flex';
      break;
    case 'app':
      appMain.style.display = 'block';
      break;
  }
}

// ====== AUTHENTICATED FLOW ======
async function handleAuthenticated(user) {
  showScreen('loading');

  try {
    // Check user profile
    const profile = await getUserProfile(user.uid);
    userProfile = profile;

    // Ensure root document and profile exist with email for Admin Panel
    try {
      await setDoc(doc(db, 'users', user.uid), { email: user.email || '', name: user.displayName || 'User' }, { merge: true });
      if (profile) {
        await saveUserProfile(user.uid, { email: user.email || '', name: user.displayName || 'User' });
      }
    } catch (err) {
      console.warn('Could not sync user info', err);
    }

    if (!profile) {
      // New user → show onboarding
      showOnboarding(user);
      return;
    }

    // Check Premium/Trial Status
    let isAllowed = true;
    let dataOwnerUid = user.uid;

    if (profile.role === 'owner') {
      let trialEnds = profile.trialEndsAt;
      if (!trialEnds && profile.createdAt) {
          trialEnds = new Date(new Date(profile.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
      if (!profile.isPremium && user.email !== 'frryk404@gmail.com') {
         if (!trialEnds || new Date() > new Date(trialEnds)) {
             isAllowed = false;
         }
      }
    } else if (profile.role === 'partner' && profile.linkedTo) {
      dataOwnerUid = profile.linkedTo;
      const ownerProfile = await getUserProfile(dataOwnerUid);
      if (ownerProfile) {
        let trialEnds = ownerProfile.trialEndsAt;
        if (!trialEnds && ownerProfile.createdAt) {
            trialEnds = new Date(new Date(ownerProfile.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
        }
        if (!ownerProfile.isPremium && user.email !== 'frryk404@gmail.com') {
           if (!trialEnds || new Date() > new Date(trialEnds)) {
               isAllowed = false;
           }
        }
      }
    }

    if (!isAllowed) {
        showScreen('paywall');
        return;
    }

    if (profile.role === 'owner') {
      // Owner → load own data
      await startApp(user, user.uid, 'owner');
    } else if (profile.role === 'partner' && profile.linkedTo) {
      // Partner → load owner's data
      await startApp(user, profile.linkedTo, 'partner');
    } else {
      // Profile exists but incomplete → show onboarding
      showOnboarding(user);
    }
  } catch (error) {
    console.error('Auth flow error:', error);
    showToast('Terjadi kesalahan. Coba lagi.');
    showScreen('login');
  }
}

// ====== ONBOARDING ======
function showOnboarding(user) {
  const avatar = document.getElementById('onboardingAvatar');
  const name = document.getElementById('onboardingName');
  if (avatar) avatar.src = user.photoURL || '';
  if (name) name.textContent = `Halo, ${user.displayName || 'User'}!`;
  document.getElementById('joinCodeForm').style.display = 'none';
  document.querySelector('.onboarding-options').style.display = 'flex';
  showScreen('onboarding');
}

// ====== START APP ======
async function startApp(user, dataOwnerUid, role) {
  showScreen('loading');
  initApp();

  // Set user profile in sidebar
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  if (avatarEl) avatarEl.src = user.photoURL || '';
  if (nameEl) nameEl.textContent = user.displayName || 'User';
  if (roleEl) roleEl.textContent = role === 'owner' ? 'Owner' : 'Partner';

  // Listen to data
  listenToData(dataOwnerUid, (state) => {
    showScreen('app');
    
    // Admin Panel Logic
    if (user.email === 'frryk404@gmail.com') {
      const adminNavBtn = document.getElementById('navAdminPanel');
      if (adminNavBtn) {
        adminNavBtn.style.display = 'flex';
      }
      renderAdminPanel();
    }

    renderAll();
  }, (error) => {
    showToast('Gagal memuat data: ' + error.message);
  });
}

// ====== EVENT LISTENERS ======

// Login button
document.getElementById('btnGoogleLogin')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnGoogleLogin');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner-small"></div> Memproses...';
  try {
    await signInWithGoogle();
  } catch (e) {
    showToast('Gagal login. Coba lagi.');
  }
  btn.disabled = false;
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Masuk dengan Google`;
});

// Onboarding: Create New
document.getElementById('btnCreateNew')?.addEventListener('click', async () => {
  if (!currentUser) return;
  const btn = document.getElementById('btnCreateNew');
  btn.disabled = true;
  try {
    await createNewWeddingData(currentUser);
    userProfile = { role: 'owner', isPremium: false };
    await startApp(currentUser, currentUser.uid, 'owner');
  } catch (e) {
    console.error(e);
    showToast('Gagal membuat data baru.');
    btn.disabled = false;
  }
});

// Onboarding: Join with Code
document.getElementById('btnJoinCode')?.addEventListener('click', () => {
  document.querySelector('.onboarding-options').style.display = 'none';
  document.getElementById('joinCodeForm').style.display = 'flex';
  document.getElementById('inputInviteCode').focus();
});

document.getElementById('btnBackOnboarding')?.addEventListener('click', () => {
  document.getElementById('joinCodeForm').style.display = 'none';
  const errorEl = document.getElementById('inviteError');
  if (errorEl) errorEl.style.display = 'none';
  document.getElementById('inputInviteCode').value = '';
  document.querySelector('.onboarding-options').style.display = 'flex';
});

document.getElementById('btnSubmitCode')?.addEventListener('click', async () => {
  const code = document.getElementById('inputInviteCode').value.trim().toUpperCase();
  const errorEl = document.getElementById('inviteError');
  if (errorEl) errorEl.style.display = 'none';

  if (!code || code.length < 4) {
    if (errorEl) {
      errorEl.textContent = 'Masukkan kode yang valid (minimal 4 karakter)';
      errorEl.style.display = 'block';
    } else {
      showToast('Masukkan kode yang valid');
    }
    return;
  }
  const btn = document.getElementById('btnSubmitCode');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner-small"></div>';

  try {
    const invite = await lookupInviteCode(code);
    if (!invite) {
      if (errorEl) {
        errorEl.textContent = 'Kode tidak valid atau tidak ditemukan';
        errorEl.style.display = 'block';
      } else {
        showToast('Kode tidak ditemukan');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="ri-check-line"></i> Gabung';
      return;
    }

    // Save as partner
    await saveUserProfile(currentUser.uid, {
      role: 'partner',
      linkedTo: invite.ownerUid,
      joinedAt: new Date().toISOString(),
    });
    userProfile = { role: 'partner', linkedTo: invite.ownerUid };
    await startApp(currentUser, invite.ownerUid, 'partner');
    showToast('Berhasil bergabung!');
  } catch (e) {
    console.error(e);
    showToast('Gagal bergabung. Coba lagi.');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ri-check-line"></i> Gabung';
});

// Settings button
document.getElementById('btnSettings')?.addEventListener('click', async () => {
  const modal = document.getElementById('settingsModal');
  const user = getCurrentUser();
  if (!user) return;

  // User info
  const userInfoEl = document.getElementById('settingsUserInfo');
  if (userInfoEl) {
    userInfoEl.innerHTML = `
      <div class="settings-user-card">
        <div>
          <strong>${user.displayName || 'User'}</strong>
          <span>${user.email || ''}</span>
        </div>
      </div>
    `;
  }

  // Sharing section
  const sharingEl = document.getElementById('settingsSharingContent');
  const profile = await getUserProfile(user.uid);
  if (sharingEl) {
    if (profile?.role === 'owner') {
      const existingCode = await getExistingInviteCode(user.uid);
      if (existingCode) {
        sharingEl.innerHTML = `
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;">Kode undangan Anda:</p>
          <div class="invite-code-display">
            <span class="invite-code-text">${existingCode}</span>
            <button onclick="navigator.clipboard.writeText('${existingCode}').then(()=>window._showToast('Kode disalin!'))" class="btn-secondary" style="padding:6px 12px;font-size:0.85rem;">
              <i class="ri-file-copy-line"></i> Salin
            </button>
          </div>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">Bagikan kode ini ke pasangan Anda agar bisa mengakses data bersama.</p>
        `;
      } else {
        sharingEl.innerHTML = `
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:12px;">Buat kode undangan agar pasangan Anda bisa mengakses data ini.</p>
          <button id="btnGenerateCode" class="btn-primary" style="width:100%;">
            <i class="ri-link"></i> Generate Kode Undangan
          </button>
        `;
        document.getElementById('btnGenerateCode')?.addEventListener('click', async () => {
          const btn = document.getElementById('btnGenerateCode');
          btn.disabled = true;
          btn.innerHTML = '<div class="loading-spinner-small"></div>';
          try {
            const code = await createInviteCode(user.uid);
            showToast('Kode berhasil dibuat: ' + code);
            document.getElementById('btnSettings')?.click(); // Refresh modal
          } catch (e) {
            showToast('Gagal membuat kode');
          }
          btn.disabled = false;
        });
      }
    } else if (profile?.role === 'partner') {
      sharingEl.innerHTML = `
        <div class="partner-info">
          <i class="ri-link" style="color:var(--primary);font-size:1.5rem;"></i>
          <p>Anda terhubung sebagai <strong>Partner</strong>. Data yang Anda lihat milik akun pasangan.</p>
        </div>
        <button id="btnUnlink" class="btn-secondary" style="width:100%;margin-top:12px;color:var(--danger);">
          <i class="ri-link-unlink"></i> Putus Koneksi
        </button>
      `;
      document.getElementById('btnUnlink')?.addEventListener('click', async () => {
        if (!confirm('Yakin ingin memutuskan koneksi? Anda akan kehilangan akses ke data ini.')) return;
        await saveUserProfile(user.uid, { role: null, linkedTo: null });
        stopListening();
        showOnboarding(user);
        closeSettingsModal();
      });
    }
  }

  // Wedding date
  const state = getAppState();
  const dateInput = document.getElementById('settingsWeddingDate');
  if (dateInput && state) {
    dateInput.value = state.weddingDate || '';
  }

  modal?.classList.add('show');
});

// Save wedding date from settings
document.getElementById('btnSaveWeddingDate')?.addEventListener('click', async () => {
  const val = document.getElementById('settingsWeddingDate')?.value;
  await updateState('weddingDate', val || '');
  updateCountdown();
  showToast('Tanggal Hari H disimpan');
});

// Export Excel from settings
document.getElementById('btnExportExcel')?.addEventListener('click', () => {
  exportSemuaKeExcel();
});

// Logout
document.getElementById('btnLogout')?.addEventListener('click', async () => {
  closeSettingsModal();
  stopListening();
  await handleSignOut();
  showScreen('login');
  showToast('Berhasil keluar');
});

// Paywall Logout
document.getElementById('btnPaywallLogout')?.addEventListener('click', async () => {
  stopListening();
  await handleSignOut();
  showScreen('login');
});

// Global toast access
window._showToast = showToast;

// Initial state
showScreen('loading');
