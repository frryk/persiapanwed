// Undangan Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

const PER_PAGE = 20;
let sortKey = 'nama';
let sortDir = 'asc';

export function renderUndangan(state) {
  const section = document.getElementById('undangan');
  if (!section) return;

  const totalAll = state.undangan.length;
  const totalCpw = state.undangan.filter(u => u.pihak === 'CPW').length;
  const totalCpp = state.undangan.filter(u => u.pihak === 'CPP').length;
  const totalHadir = state.undangan.filter(u => u.konfirmasi === 'Hadir').length;
  const totalTidak = state.undangan.filter(u => u.konfirmasi === 'Tidak Hadir').length;

  // Filter
  let filtered = [...state.undangan];

  // Build rows
  const rows = filtered.map(u => `<tr>
    <td>${sanitize(u.nama)}</td><td>${sanitize(u.pihak)}</td><td>${sanitize(u.relasi||'')}</td><td>${u.jumlah||1}</td>
    <td><select onchange="updateUndanganField(${u.id},'dikirim',this.value)" style="padding:4px;border-radius:4px;border:1px solid var(--border);font-size:0.85rem;">
      <option value="Belum" ${u.dikirim!=='Sudah'?'selected':''}>Belum</option><option value="Sudah" ${u.dikirim==='Sudah'?'selected':''}>Sudah</option>
    </select></td>
    <td><select onchange="updateUndanganField(${u.id},'konfirmasi',this.value)" style="padding:4px;border-radius:4px;border:1px solid var(--border);font-size:0.85rem;">
      <option value="Pending" ${u.konfirmasi==='Pending'||!u.konfirmasi?'selected':''}>Pending</option><option value="Hadir" ${u.konfirmasi==='Hadir'?'selected':''}>Hadir</option><option value="Tidak Hadir" ${u.konfirmasi==='Tidak Hadir'?'selected':''}>Tidak Hadir</option>
    </select></td>
    <td><div class="action-btns"><button class="btn-icon edit" onclick="editItem('undangan',${u.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('undangan',${u.id})"><i class="ri-delete-bin-line"></i></button></div></td>
  </tr>`).join('');

  section.innerHTML = `
    <div class="card header-card"><h2>List Undangan</h2><p>Daftar tamu undangan beserta status kehadirannya.</p></div>
    <div class="budget-summary grid-3 mb-4" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
      <div class="stat-card"><div class="stat-icon"><i class="ri-mail-open-line"></i></div><div class="stat-info"><span>Total Tamu</span><h3>${totalAll}</h3></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:rgba(233,30,99,0.1);color:#e91e63;"><i class="ri-women-line"></i></div><div class="stat-info"><span>CPW</span><h3>${totalCpw}</h3></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:rgba(33,150,243,0.1);color:#2196f3;"><i class="ri-men-line"></i></div><div class="stat-info"><span>CPP</span><h3>${totalCpp}</h3></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i class="ri-check-line"></i></div><div class="stat-info"><span>Hadir</span><h3>${totalHadir}</h3></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i class="ri-close-line"></i></div><div class="stat-info"><span>Tidak Hadir</span><h3>${totalTidak}</h3></div></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:14px;">
        <button onclick="exportUndanganCSV()" class="btn-secondary" style="padding:8px 14px;font-size:0.88rem;"><i class="ri-download-2-line"></i> CSV</button>
        <button onclick="printUndangan()" class="btn-secondary" style="padding:8px 14px;font-size:0.88rem;"><i class="ri-printer-line"></i> Print</button>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Nama</th><th>Pihak</th><th>Relasi</th><th>Jml</th><th>Dikirim</th><th>Konfirmasi</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card mt-4" style="background:var(--bg-main);border:1px solid var(--border);">
        <h3 style="font-size:1.1rem;margin-bottom:16px;">Tambah Tamu</h3>
        <div class="grid-3" style="gap:16px;margin-bottom:16px;">
          <div class="form-group"><label>Pihak</label><select id="undanganPihak"><option value="CPW">CPW</option><option value="CPP">CPP</option></select></div>
          <div class="form-group" style="grid-column:span 2;"><label>Nama Tamu</label><input type="text" id="undanganNama" placeholder="Nama tamu..."></div>
        </div>
        <div class="grid-3" style="gap:16px;margin-bottom:16px;align-items:end;">
          <div class="form-group" style="grid-column:span 2;"><label>Relasi</label><input type="text" id="undanganRelasi" placeholder="Keluarga/Teman..."></div>
          <div class="form-group"><label>Total Orang</label><select id="undanganJumlah"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select></div>
        </div>
        <div style="text-align:right;"><button onclick="addUndangan()" class="btn-primary"><i class="ri-add-line"></i> Tambah Tamu</button></div>
      </div>
    </div>
  `;
}

export function addUndangan() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const nama = document.getElementById('undanganNama')?.value.trim();
  if (!nama) return showToast('Nama tamu tidak boleh kosong');
  state.undangan.push({
    id: generateId(), nama, pihak: document.getElementById('undanganPihak')?.value || 'CPW',
    relasi: document.getElementById('undanganRelasi')?.value.trim() || '',
    jumlah: Number(document.getElementById('undanganJumlah')?.value) || 1,
    dikirim: 'Belum', konfirmasi: 'Pending',
  });
  document.getElementById('undanganNama').value = '';
  document.getElementById('undanganRelasi').value = '';
  saveState().then(() => showToast('Tamu ditambahkan'));
}

export function exportUndanganCSV() {
  const state = getAppState();
  if (!state) return;
  let csv = 'Nama,Pihak,Relasi,Jumlah,Dikirim,Konfirmasi\n';
  state.undangan.forEach(u => { csv += `"${u.nama}","${u.pihak}","${u.relasi||''}",${u.jumlah||1},"${u.dikirim||'Belum'}","${u.konfirmasi||'Pending'}"\n`; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'list_undangan.csv';
  a.click();
}

export function printUndangan() {
  const state = getAppState();
  if (!state) return;
  let html = '<html><head><title>List Undangan</title><style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f5f5f5;}</style></head><body>';
  html += '<h2>List Undangan</h2><table><tr><th>No</th><th>Nama</th><th>Pihak</th><th>Relasi</th><th>Jml</th><th>Dikirim</th><th>Konfirmasi</th></tr>';
  state.undangan.forEach((u, i) => { html += `<tr><td>${i+1}</td><td>${u.nama}</td><td>${u.pihak}</td><td>${u.relasi||''}</td><td>${u.jumlah||1}</td><td>${u.dikirim||'Belum'}</td><td>${u.konfirmasi||'Pending'}</td></tr>`; });
  html += '</table></body></html>';
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}
