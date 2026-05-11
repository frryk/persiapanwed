// Rundown Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderRundown(state) {
  const section = document.getElementById('rundown');
  if (!section) return;

  const sorted = [...state.rundown].sort((a, b) => (a.jam || '').localeCompare(b.jam || ''));
  const rows = sorted.map(r => `<tr>
    <td>${sanitize(r.jam||'')}</td><td>${sanitize(r.kegiatan||'')}</td><td>${sanitize(r.keterangan||'')}</td>
    <td><div class="action-btns"><button class="btn-icon edit" onclick="editItem('rundown',${r.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('rundown',${r.id})"><i class="ri-delete-bin-line"></i></button></div></td>
  </tr>`).join('');

  section.innerHTML = `
    <div class="card header-card"><h2>Rundown Acara</h2><p>Daftar kegiatan, waktu eksekusi, dan detail keterangan rundown.</p></div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:0.9rem;color:var(--text-muted);">${state.rundown.length} kegiatan tercatat</span>
        <div style="display:flex;gap:8px;">
          <button onclick="exportRundownCSV()" class="btn-secondary" style="padding:8px 14px;font-size:0.88rem;"><i class="ri-download-2-line"></i> Export CSV</button>
          <button onclick="printRundown()" class="btn-secondary" style="padding:8px 14px;font-size:0.88rem;"><i class="ri-printer-line"></i> Print</button>
        </div>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Jam</th><th>Kegiatan</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card mt-4" style="background:var(--bg-main);border:1px solid var(--border);">
        <h3 style="font-size:1.1rem;margin-bottom:16px;">Tambah Rundown</h3>
        <div class="grid-3" style="gap:16px;margin-bottom:16px;">
          <div class="form-group"><label>Jam Kegiatan</label><input type="time" id="rundownJam"></div>
          <div class="form-group" style="grid-column:span 2;"><label>Nama Kegiatan</label><input type="text" id="rundownKegiatan" placeholder="cth: Penyambutan Mempelai..."></div>
        </div>
        <div class="form-group" style="margin-bottom:16px;"><label>Keterangan</label><input type="text" id="rundownKeterangan" placeholder="Keterangan tambahan..."></div>
        <div style="text-align:right;"><button onclick="addRundown()" class="btn-primary"><i class="ri-add-line"></i> Tambah Rundown</button></div>
      </div>
    </div>
  `;
}

export function addRundown() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const kegiatan = document.getElementById('rundownKegiatan')?.value.trim();
  if (!kegiatan) return showToast('Nama kegiatan tidak boleh kosong');
  state.rundown.push({
    id: generateId(), jam: document.getElementById('rundownJam')?.value || '',
    kegiatan, keterangan: document.getElementById('rundownKeterangan')?.value.trim() || '',
  });
  saveState().then(() => showToast('Rundown ditambahkan'));
}

export function exportRundownCSV() {
  const state = getAppState();
  if (!state) return;
  const sorted = [...state.rundown].sort((a, b) => (a.jam||'').localeCompare(b.jam||''));
  let csv = 'Jam,Kegiatan,Keterangan\n';
  sorted.forEach(r => { csv += `"${r.jam||''}","${r.kegiatan||''}","${r.keterangan||''}"\n`; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'rundown_acara.csv';
  a.click();
}

export function printRundown() {
  const state = getAppState();
  if (!state) return;
  const sorted = [...state.rundown].sort((a, b) => (a.jam||'').localeCompare(b.jam||''));
  let html = '<html><head><title>Rundown Acara</title><style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f5f5f5;}</style></head><body>';
  html += '<h2>Rundown Acara</h2><table><tr><th>Jam</th><th>Kegiatan</th><th>Keterangan</th></tr>';
  sorted.forEach(r => { html += `<tr><td>${r.jam||''}</td><td>${r.kegiatan||''}</td><td>${r.keterangan||''}</td></tr>`; });
  html += '</table></body></html>';
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}
