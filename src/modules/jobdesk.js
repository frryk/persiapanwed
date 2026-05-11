// Job Desk Vendor Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderJobdesk(state) {
  const section = document.getElementById('jobdesk');
  if (!section) return;

  const grouped = {};
  state.jobdesk.forEach(j => {
    if (!grouped[j.vendor]) grouped[j.vendor] = [];
    grouped[j.vendor].push(j);
  });

  let html = '';
  for (const [vendor, tasks] of Object.entries(grouped)) {
    const tasksHtml = tasks.map(t => `
      <li class="item-row" style="margin-bottom:8px;">
        <div class="item-text" style="white-space:pre-wrap;flex:1;">${sanitize(t.tugas)}</div>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editItem('jobdesk',${t.id})"><i class="ri-edit-line"></i></button>
          <button class="btn-icon delete" onclick="deleteItem('jobdesk',${t.id})"><i class="ri-delete-bin-line"></i></button>
        </div>
      </li>
    `).join('');
    html += `<div class="card"><h3 class="accent-title"><i class="ri-store-2-line"></i> ${sanitize(vendor)}</h3><ul class="todo-list">${tasksHtml}</ul></div>`;
  }

  const vendorOptions = state.vendorFinal.map(v => `<option value="${sanitize(v.nama)}">${sanitize(v.nama)}</option>`).join('');

  section.innerHTML = `
    <div class="card header-card"><h2>Job Desk Vendor</h2><p>Rincian tugas dan tanggung jawab vendor pada saat acara resepsi.</p></div>
    <div class="jobdesk-container">${html}</div>
    <div class="card add-timeline-card mt-4">
      <h3>Tambah Tugas Baru</h3>
      <div class="add-item-form" style="display:flex;flex-direction:column;gap:12px;">
        <select id="jobdeskVendor" style="padding:10px;border-radius:6px;border:1px solid var(--border);">
          <option value="">-- Pilih Vendor --</option>${vendorOptions}
        </select>
        <textarea id="jobdeskTugas" placeholder="Rincian Tugas..." style="width:100%;border-radius:6px;border:1px solid var(--border);padding:12px;font-family:inherit;min-height:100px;resize:vertical;outline:none;"></textarea>
        <button onclick="addJobdesk()" class="btn-primary" style="align-self:flex-start;"><i class="ri-add-line"></i> Tambah</button>
      </div>
    </div>
  `;
}

export function populateJobdeskVendorSelect(state) {
  // Already handled in renderJobdesk
}

export function addJobdesk() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const vendor = document.getElementById('jobdeskVendor')?.value;
  const tugas = document.getElementById('jobdeskTugas')?.value.trim();
  if (!vendor) return showToast('Pilih vendor');
  if (!tugas) return showToast('Tugas tidak boleh kosong');
  state.jobdesk.push({ id: generateId(), vendor, tugas });
  document.getElementById('jobdeskTugas').value = '';
  saveState().then(() => showToast('Tugas ditambahkan'));
}
