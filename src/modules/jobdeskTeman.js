// Job Desk Panitia (Teman) Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderMasterJobdeskTeman(state) { /* rendered inside renderJobdeskTemanSection */ }
export function renderMasterNamaTeman(state) { /* rendered inside renderJobdeskTemanSection */ }

export function populateJobdeskTemanSelects(state) { /* rendered inside renderJobdeskTemanSection */ }

export function renderJobdeskTeman(state) {
  const section = document.getElementById('jobdeskteman');
  if (!section) return;

  const masterJobHtml = (state.masterJobdeskTeman||[]).map(j => `
    <li class="item-row"><div class="item-content"><div class="item-text"><span class="item-title">${sanitize(j.title)}</span></div></div>
    <div class="action-btns"><button class="btn-icon edit" onclick="editItem('masterJobdeskTeman',${j.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('masterJobdeskTeman',${j.id})"><i class="ri-delete-bin-line"></i></button></div></li>
  `).join('');

  const masterNamaHtml = (state.masterNamaTeman||[]).map(n => `
    <li class="item-row"><div class="item-content"><div class="item-text"><span class="item-title">${sanitize(n.title)}</span></div></div>
    <div class="action-btns"><button class="btn-icon edit" onclick="editItem('masterNamaTeman',${n.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('masterNamaTeman',${n.id})"><i class="ri-delete-bin-line"></i></button></div></li>
  `).join('');

  const namaOpts = (state.masterNamaTeman||[]).map(n => `<option value="${sanitize(n.title)}">${sanitize(n.title)}</option>`).join('');
  const tugasOpts = (state.masterJobdeskTeman||[]).map(t => `<option value="${sanitize(t.title)}">${sanitize(t.title)}</option>`).join('');

  // Grouped assignments
  const grouped = {};
  (state.jobdeskTeman||[]).forEach(j => {
    if (!grouped[j.nama]) grouped[j.nama] = [];
    grouped[j.nama].push(j);
  });
  let assignHtml = '';
  for (const [nama, tasks] of Object.entries(grouped)) {
    const tHtml = tasks.map(t => `
      <li class="item-row" style="margin-bottom:8px;"><div class="item-text" style="flex:1;"><span class="item-title">${sanitize(t.tugas)}</span></div>
      <div class="action-btns"><button class="btn-icon edit" onclick="editItem('jobdeskTeman',${t.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('jobdeskTeman',${t.id})"><i class="ri-delete-bin-line"></i></button></div></li>
    `).join('');
    assignHtml += `<div class="card"><h3 class="accent-title"><i class="ri-user-smile-line"></i> ${sanitize(nama)}</h3><ul class="todo-list">${tHtml}</ul></div>`;
  }

  section.innerHTML = `
    <div class="card header-card"><h2>Job Desk Panitia</h2><p>Kelola daftar pekerjaan, daftar panitia, dan bagi tugasnya.</p></div>
    <div class="grid-2">
      <div class="card list-container"><h3 class="accent-title"><i class="ri-list-check-2"></i> Daftar Pekerjaan</h3><ul class="todo-list">${masterJobHtml}</ul>
        <div class="add-item-form compact mt-3" style="display:flex;gap:8px;"><input type="text" id="inputMasterJobdeskTeman" placeholder="Tambah Pekerjaan..." style="flex:1;"><button onclick="addMasterJobdeskTeman()" class="btn-secondary"><i class="ri-add-line"></i></button></div></div>
      <div class="card list-container"><h3 class="accent-title"><i class="ri-user-add-line"></i> Daftar Panitia</h3><ul class="todo-list">${masterNamaHtml}</ul>
        <div class="add-item-form compact mt-3" style="display:flex;gap:8px;"><input type="text" id="inputMasterNamaTeman" placeholder="Tambah Nama Panitia..." style="flex:1;"><button onclick="addMasterNamaTeman()" class="btn-secondary"><i class="ri-add-line"></i></button></div></div>
    </div>
    <div class="card add-timeline-card mt-4">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="margin:0;">Pembagian Tugas Baru</h3>
        <button onclick="printJobdeskTeman()" class="btn-secondary" style="padding:8px 14px;font-size:0.88rem;"><i class="ri-printer-line"></i> Print</button>
      </div>
      <div class="add-item-form grid-2" style="gap:12px;">
        <div class="form-group"><label>Pilih Panitia</label><select id="jobdeskTemanNama"><option value="">-- Pilih Panitia --</option>${namaOpts}</select></div>
        <div class="form-group"><label>Pilih Pekerjaan</label><select id="jobdeskTemanTugas"><option value="">-- Pilih Pekerjaan --</option>${tugasOpts}</select></div>
      </div>
      <button onclick="addJobdeskTeman()" class="btn-primary mt-3"><i class="ri-add-line"></i> Tambah Tugas</button>
    </div>
    <div class="jobdesk-container mt-4">${assignHtml}</div>
  `;
}

export function addMasterJobdeskTeman() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const input = document.getElementById('inputMasterJobdeskTeman');
  if (!input?.value.trim()) return showToast('Tidak boleh kosong');
  state.masterJobdeskTeman.push({ id: generateId(), title: input.value.trim() });
  input.value = '';
  saveState().then(() => showToast('Pekerjaan ditambahkan'));
}

export function addMasterNamaTeman() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const input = document.getElementById('inputMasterNamaTeman');
  if (!input?.value.trim()) return showToast('Tidak boleh kosong');
  state.masterNamaTeman.push({ id: generateId(), title: input.value.trim() });
  input.value = '';
  saveState().then(() => showToast('Panitia ditambahkan'));
}

export function addJobdeskTeman() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const nama = document.getElementById('jobdeskTemanNama')?.value;
  const tugas = document.getElementById('jobdeskTemanTugas')?.value;
  if (!nama) return showToast('Pilih panitia');
  if (!tugas) return showToast('Pilih pekerjaan');
  state.jobdeskTeman.push({ id: generateId(), nama, tugas });
  saveState().then(() => showToast('Tugas ditambahkan'));
}

export function printJobdeskTeman() {
  const state = getAppState();
  if (!state) return;
  const grouped = {};
  (state.jobdeskTeman||[]).forEach(j => { if (!grouped[j.nama]) grouped[j.nama] = []; grouped[j.nama].push(j); });
  let html = '<html><head><title>Daftar Tugas Panitia</title><style>body{font-family:Arial;padding:20px;}h2{color:#d8a7b1;}table{width:100%;border-collapse:collapse;margin-top:10px;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f5f5f5;}</style></head><body>';
  html += '<h2>Daftar Tugas Panitia</h2>';
  for (const [nama, tasks] of Object.entries(grouped)) {
    html += `<h3>${nama}</h3><table><tr><th>No</th><th>Tugas</th></tr>`;
    tasks.forEach((t, i) => { html += `<tr><td>${i+1}</td><td>${t.tugas}</td></tr>`; });
    html += '</table>';
  }
  html += '</body></html>';
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}
