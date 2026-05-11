// Main App Orchestrator — UI Navigation, Rendering, Global Event Handlers
import { getAppState, getIsLoaded, saveState, updateState } from './store.js';
import { showToast, sanitize, generateId, formatRupiah } from './utils.js';
import { renderDashboard, updateProgress } from './modules/dashboard.js';
import { renderPersiapan, addItem as addPersiapanItem } from './modules/persiapan.js';
import { renderTimeline, addTimelineTask } from './modules/timeline.js';
import { renderBerkas, addSimpleItem } from './modules/berkas.js';
import { renderBudget, addBudget } from './modules/budget.js';
import { renderSeserahan, addSeserahan } from './modules/seserahan.js';
import { renderVendor, addVendor, pindahFinal, pindahKandidat } from './modules/vendor.js';
import { renderJobdesk, addJobdesk, populateJobdeskVendorSelect } from './modules/jobdesk.js';
import { renderJobdeskTeman, addJobdeskTeman, addMasterJobdeskTeman, addMasterNamaTeman, renderMasterJobdeskTeman, renderMasterNamaTeman, populateJobdeskTemanSelects, printJobdeskTeman } from './modules/jobdeskTeman.js';
import { renderRundown, addRundown, exportRundownCSV, printRundown } from './modules/rundown.js';
import { renderUndangan, addUndangan, exportUndanganCSV, printUndangan } from './modules/undangan.js';
import { renderMoodboard, openCatModal, closeCatModal, addCategory, editCategory, deleteCategory, openAddModal, closeAddModal, savePhoto, fetchIG, openDeleteMbModal, confirmDeleteMb, closeDeleteMbModal, renderGallery } from './modules/moodboard.js';
import { renderNotes, handleNotesInput, saveNotesManual } from './modules/notes.js';
import { renderEditModal, saveEditedItem, closeEditModal, addPackageToModal, removePackageFromModal, editPackageInModal, savePackageEdit, cancelPackageEdit } from './modules/editModal.js';
import { exportSemuaKeExcel } from './modules/excelExport.js';
import { getAllUsers, saveUserProfile } from './store.js';

// Current state for edit/delete modals
let currentEditStateKey = null;
let currentEditId = null;
let currentDeleteStateKey = null;
let currentDeleteId = null;

// Pagination state
let vendorSeleksiPage = 1;
let undanganPage = 1;

export function getVendorSeleksiPage() { return vendorSeleksiPage; }
export function setVendorSeleksiPageVal(p) { vendorSeleksiPage = p; }
export function getUndanganPage() { return undanganPage; }
export function setUndanganPageVal(p) { undanganPage = p; }

/**
 * Initialize the main app UI — called after auth + data is ready
 */
export function initApp() {
  setupNavigation();
  setupModals();
  setupMobileSidebar();
  injectTabSections();
}

/**
 * Inject all tab-content sections into the content wrapper
 */
function injectTabSections() {
  const wrapper = document.getElementById('contentWrapper');
  wrapper.innerHTML = `
    <!-- Dashboard -->
    <section id="dashboard" class="tab-content active animate-fade-up"></section>
    <!-- Persiapan -->
    <section id="persiapan" class="tab-content animate-fade-up"></section>
    <!-- Timeline -->
    <section id="timeline" class="tab-content animate-fade-up"></section>
    <!-- Berkas KUA -->
    <section id="berkas" class="tab-content animate-fade-up"></section>
    <!-- Budget -->
    <section id="budget" class="tab-content animate-fade-up"></section>
    <!-- Seserahan -->
    <section id="seserahan" class="tab-content animate-fade-up"></section>
    <!-- Vendor -->
    <section id="vendor" class="tab-content animate-fade-up"></section>
    <!-- Job Desk Vendor -->
    <section id="jobdesk" class="tab-content animate-fade-up"></section>
    <!-- Job Desk Panitia -->
    <section id="jobdeskteman" class="tab-content animate-fade-up"></section>
    <!-- Rundown -->
    <section id="rundown" class="tab-content animate-fade-up"></section>
    <!-- Undangan -->
    <section id="undangan" class="tab-content animate-fade-up"></section>
    <!-- Moodboard -->
    <section id="moodboard" class="tab-content animate-fade-up"></section>
    <!-- Notes -->
    <section id="notes" class="tab-content animate-fade-up"></section>
    <!-- Admin Panel -->
    <section id="adminPanel" class="tab-content animate-fade-up">
        <div class="header-card card mb-4">
            <h2><i class="ri-shield-keyhole-line"></i> Super Admin Panel</h2>
            <p>Kelola akses pengguna (Aktivasi Premium).</p>
        </div>
        <div class="card table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama/Email</th>
                        <th>Tgl Daftar</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="adminUserTableBody">
                    <!-- Populated by JS -->
                </tbody>
            </table>
        </div>
    </section>
  `;
}

/**
 * Render all sections — called when data changes
 */
export function renderAll() {
  const state = getAppState();
  if (!state) return;

  renderDashboard(state);
  renderPersiapan(state);
  renderTimeline(state);
  renderBerkas(state);
  renderBudget(state);
  renderSeserahan(state);
  renderVendor(state);
  renderJobdesk(state);
  renderMasterJobdeskTeman(state);
  renderMasterNamaTeman(state);
  populateJobdeskTemanSelects(state);
  renderJobdeskTeman(state);
  renderRundown(state);
  renderUndangan(state);
  renderMoodboard(state);
  renderNotes(state);
  populateJobdeskVendorSelect(state);
  updateProgress(state);
  updateCountdown();
}

/**
 * Render Admin Panel (Super Admin only)
 */
export async function renderAdminPanel() {
  const tbody = document.getElementById('adminUserTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Memuat data...</td></tr>';
  
  const users = await getAllUsers();
  
  if (users.error) {
    if (users.error.includes('Missing or insufficient permissions')) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger); padding: 30px;">
        <i class="ri-error-warning-line" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
        <b>Akses Ditolak (Permission Denied)</b><br>
        Pastikan Anda sudah menyalin isi file <code>firestore.rules</code> terbaru ke menu <b>Firestore Database &gt; Rules</b> di Firebase Console lalu klik Publish.
      </td></tr>`;
    } else if (users.error.includes('index')) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--warning); padding: 30px;">
        <i class="ri-database-2-line" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
        <b>Index Diperlukan</b><br>
        Buka Console Google Chrome (F12) untuk melihat link pembuatan Index otomatis dari Firebase, lalu klik link tersebut.
      </td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger);">${users.error}</td></tr>`;
    }
    return;
  }
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data pengguna.</td></tr>';
    return;
  }
  
  // Sort by createdAt descending
  users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  let html = '';
  users.forEach(user => {
    // Only show owners (partners are linked)
    if (user.role !== 'owner') return;
    
    const date = new Date(user.createdAt || 0).toLocaleDateString('id-ID');
    const isPremium = user.isPremium;
    let trialEnds = user.trialEndsAt;
    if (!trialEnds && user.createdAt) {
       trialEnds = new Date(new Date(user.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
    const isExpired = !isPremium && (!trialEnds || new Date() > new Date(trialEnds));
    
    let statusHtml = '';
    if (isPremium) {
      statusHtml = '<span class="badge success">Premium</span>';
    } else if (isExpired) {
      statusHtml = '<span class="badge danger">Expired (Paywall)</span>';
    } else {
      statusHtml = '<span class="badge warning">Trial</span>';
    }
    
    const actionBtn = isPremium 
      ? `<button class="btn-secondary" onclick="window.togglePremium('${user.uid}', false)" style="padding: 6px 12px; font-size: 0.8rem;">Cabut Premium</button>`
      : `<button class="btn-primary" onclick="window.togglePremium('${user.uid}', true)" style="padding: 6px 12px; font-size: 0.8rem; background: var(--success);">Aktifkan Premium</button>`;

    html += `
      <tr>
        <td>
          <div style="font-weight: 600;">${user.name || 'User'}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${user.email || '-'}</div>
        </td>
        <td>${date}</td>
        <td>${statusHtml}</td>
        <td>${actionBtn}</td>
      </tr>
    `;
  });
  
  if (html === '') {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data pengguna (Owner).</td></tr>';
  } else {
    tbody.innerHTML = html;
  }
}

/**
 * Navigation logic
 */
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      const target = btn.getAttribute('data-target');
      btn.classList.add('active');
      const section = document.getElementById(target);
      if (section) section.classList.add('active');
      // Close mobile sidebar
      if (window.innerWidth <= 992) closeMobileSidebar();
    });
  });
}

/**
 * Mobile sidebar
 */
function setupMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('mobileToggle');
  const close = document.getElementById('mobileClose');

  if (toggle) toggle.addEventListener('click', () => openMobileSidebar());
  if (close) close.addEventListener('click', () => closeMobileSidebar());
  if (overlay) overlay.addEventListener('click', () => closeMobileSidebar());
}

function openMobileSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('show');
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}

/**
 * Modal logic
 */
function setupModals() {
  // Edit modal
  const closeModalBtns = [document.getElementById('closeModalBtn'), document.getElementById('cancelModalBtn')];
  closeModalBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => closeEditModalHandler());
  });
  const saveBtn = document.getElementById('saveModalBtn');
  if (saveBtn) saveBtn.addEventListener('click', () => saveEditedItemHandler());

  // Delete modal
  const closeDeleteBtns = [document.getElementById('closeDeleteModalBtn'), document.getElementById('cancelDeleteBtn')];
  closeDeleteBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => closeDeleteModalHandler());
  });
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) confirmBtn.addEventListener('click', () => confirmDeleteHandler());

  // Settings modal close button
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => closeSettingsModal());

  // Click outside modals
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) closeEditModalHandler();
    if (e.target === document.getElementById('deleteModal')) closeDeleteModalHandler();
    if (e.target === document.getElementById('settingsModal')) closeSettingsModal();
  });
}

function closeEditModalHandler() {
  const modal = document.getElementById('editModal');
  if (modal) modal.classList.remove('show');
  currentEditStateKey = null;
  currentEditId = null;
}

function closeDeleteModalHandler() {
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('show');
  currentDeleteStateKey = null;
  currentDeleteId = null;
}

function saveEditedItemHandler() {
  if (!currentEditStateKey || currentEditId === null) return;
  saveEditedItem(currentEditStateKey, currentEditId);
  closeEditModalHandler();
}

function confirmDeleteHandler() {
  if (!getIsLoaded() || !currentDeleteStateKey || currentDeleteId === null) return;
  const state = getAppState();
  state[currentDeleteStateKey] = state[currentDeleteStateKey].filter(item => item.id != currentDeleteId);
  saveState().then(() => {
    showToast('Item dihapus');
    renderAll();
  });
  closeDeleteModalHandler();
}

export function closeSettingsModal() {
  document.getElementById('settingsModal')?.classList.remove('show');
}

/**
 * Countdown widget
 */
let countdownInterval = null;
export function updateCountdown() {
  const timerDisplay = document.getElementById('countdownTimer');
  if (!timerDisplay) return;
  const state = getAppState();
  if (!state || !state.weddingDate) {
    timerDisplay.textContent = 'Atur Tanggal';
    return;
  }

  function calc() {
    const targetDate = new Date(state.weddingDate).getTime();
    const now = Date.now();
    if (targetDate - now < 0) {
      timerDisplay.textContent = 'Hari H Telah Tiba! 💍';
      return;
    }
    const nowDate = new Date(); nowDate.setHours(0,0,0,0);
    const targetObj = new Date(state.weddingDate); targetObj.setHours(0,0,0,0);
    let months = (targetObj.getFullYear() - nowDate.getFullYear()) * 12 + targetObj.getMonth() - nowDate.getMonth();
    let days = targetObj.getDate() - nowDate.getDate();
    if (days < 0) {
      months--;
      days += new Date(targetObj.getFullYear(), targetObj.getMonth(), 0).getDate();
    }
    timerDisplay.textContent = months > 0 ? `${months} bulan ${days} hari` : `${days} hari`;
  }

  calc();
  if (!countdownInterval) {
    countdownInterval = setInterval(calc, 60000);
  }
}

// ====== Global function exports for onclick handlers ======
window.addItem = (key) => addPersiapanItem(key);
window.addTimelineTask = () => addTimelineTask();
window.addSimpleItem = (listId, inputId) => addSimpleItem(listId, inputId);
window.addBudget = () => addBudget();
window.addSeserahan = () => addSeserahan();
window.addVendor = (type) => addVendor(type);
window.pindahFinal = (id) => pindahFinal(id);
window.pindahKandidat = (id) => pindahKandidat(id);
window.addJobdesk = () => addJobdesk();
window.addJobdeskTeman = () => addJobdeskTeman();
window.addMasterJobdeskTeman = () => addMasterJobdeskTeman();
window.addMasterNamaTeman = () => addMasterNamaTeman();
window.addRundown = () => addRundown();
window.addUndangan = () => addUndangan();
window.exportRundownCSV = () => exportRundownCSV();
window.printRundown = () => printRundown();
window.exportUndanganCSV = () => exportUndanganCSV();
window.printUndangan = () => printUndangan();
window.handleNotesInput = () => handleNotesInput();
window.saveNotesManual = () => saveNotesManual();
window.exportSemuaKeExcel = () => exportSemuaKeExcel();
window.renderSeserahan = () => { const s = getAppState(); if(s) renderSeserahan(s); };

window.togglePremium = async (uid, isPremium) => {
  if (!confirm(`Yakin ingin ${isPremium ? 'mengaktifkan' : 'mencabut'} premium untuk user ini?`)) return;
  
  const updateData = { isPremium };
  if (!isPremium) {
    // Force expire their trial immediately by setting it to the past
    updateData.trialEndsAt = new Date(0).toISOString();
  }
  
  await saveUserProfile(uid, updateData);
  showToast(`Status Premium berhasil diubah`);
  renderAdminPanel();
};

window.toggleCheck = (stateKey, id) => {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const idx = state[stateKey].findIndex(i => i.id == id);
  if (idx !== -1) {
    state[stateKey][idx].checked = !state[stateKey][idx].checked;
    saveState().then(() => updateProgress(state));
  }
};

window.deleteItem = (stateKey, id) => {
  if (!getIsLoaded()) return;
  currentDeleteStateKey = stateKey;
  currentDeleteId = id;
  document.getElementById('deleteModal')?.classList.add('show');
};

window.editItem = (stateKey, id) => {
  if (!getIsLoaded()) return;
  currentEditStateKey = stateKey;
  currentEditId = id;
  renderEditModal(stateKey, id);
};

window.editGlobalLink = (key) => {
  const state = getAppState();
  const val = prompt('Masukkan link Google Drive:', state[key] || '');
  if (val !== null) {
    updateState(key, val).then(() => {
      showToast('Link disimpan');
      renderAll();
    });
  }
};

window.updateUndanganField = (id, field, value) => {
  const state = getAppState();
  const idx = state.undangan.findIndex(u => u.id == id);
  if (idx !== -1) {
    state.undangan[idx][field] = value;
    saveState();
  }
};

window.setVendorSeleksiPage = (p) => { vendorSeleksiPage = p; const s = getAppState(); if(s) renderVendor(s); };
window.setUndanganPage = (p) => { undanganPage = p; const s = getAppState(); if(s) renderUndangan(s); };
window.setUndanganSort = (key) => { /* handled inside undangan module */ };
window.resetUndanganFilter = () => { undanganPage = 1; const s = getAppState(); if(s) renderUndangan(s); };
window.printJobdeskTeman = () => printJobdeskTeman();

// Moodboard global handlers
window.openCatModal = () => openCatModal();
window.closeCatModal = () => closeCatModal();
window.addCategory = () => addCategory();
window.editCategory = (idx) => editCategory(idx);
window.deleteCategory = (idx) => deleteCategory(idx);
window.openAddModal = () => openAddModal();
window.closeAddModal = () => closeAddModal();
window.savePhoto = () => savePhoto();
window.fetchIG = () => fetchIG();
window.selectIgImg = (url, el) => { el.classList.toggle('selected'); };
window.openDeleteMbModal = (id) => openDeleteMbModal(id);
window.confirmDeleteMb = () => confirmDeleteMb();
window.closeDeleteMbModal = () => closeDeleteMbModal();
window.renderGallery = () => { const s = getAppState(); if(s) renderGallery(s); };

// Vendor package modal handlers
window.addPackageToModal = () => addPackageToModal();
window.removePackageFromModal = (idx) => removePackageFromModal(idx);
window.editPackageInModal = (idx) => editPackageInModal(idx);
window.savePackageEdit = () => savePackageEdit();
window.cancelPackageEdit = () => cancelPackageEdit();
