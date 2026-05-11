// Budget Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId, formatRupiah } from '../utils.js';

export function renderBudget(state) {
  const section = document.getElementById('budget');
  if (!section) return;

  const totalEstimasi = state.budget.reduce((s, b) => s + (b.harga || b.estimasi || 0) * (b.qty || 1), 0);
  const totalAktual = state.budget.reduce((s, b) => s + (b.dpAkhir || 0) + (b.lunasAkhir || 0), 0);
  const sisa = totalEstimasi - totalAktual;

  const rows = state.budget.map(b => {
    const est = (b.harga || b.estimasi || 0) * (b.qty || 1);
    const akt = (b.dpAkhir || 0) + (b.lunasAkhir || 0);
    const statusClass = akt >= est && est > 0 ? 'success' : (b.dpAkhir > 0 ? 'warning' : 'danger');
    const statusText = akt >= est && est > 0 ? 'Lunas' : (b.dpAkhir > 0 ? 'DP' : 'Belum');
    return `<tr>
      <td>${sanitize(b.kategori||'')}</td><td>${sanitize(b.item||b.detail||'')}</td><td>${sanitize(b.vendor||'')}</td>
      <td>${formatRupiah(b.harga||b.estimasi||0)} x${b.qty||1}</td>
      <td>${formatRupiah(b.dpAkhir||0)}${b.dpDate?`<br><small>${b.dpDate}</small>`:''}</td>
      <td>${formatRupiah(b.lunasAkhir||0)}${b.lunasDate?`<br><small>${b.lunasDate}</small>`:''}</td>
      <td>${formatRupiah(est)} / ${formatRupiah(akt)}</td>
      <td>${sanitize(b.keterangan||'')}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td><div class="action-btns"><button class="btn-icon edit" onclick="editItem('budget',${b.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('budget',${b.id})"><i class="ri-delete-bin-line"></i></button></div></td>
    </tr>`;
  }).join('');

  section.innerHTML = `
    <div class="card header-card"><h2>Budget Pernikahan</h2><p>Rincian estimasi biaya dan pengeluaran aktual.</p></div>
    <div class="budget-summary grid-3 mb-4">
      <div class="stat-card"><div class="stat-icon"><i class="ri-wallet-3-line"></i></div><div class="stat-info"><span>Total Estimasi</span><h3>${formatRupiah(totalEstimasi)}</h3></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i class="ri-money-dollar-circle-line"></i></div><div class="stat-info"><span>Total Aktual</span><h3>${formatRupiah(totalAktual)}</h3></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i class="ri-funds-line"></i></div><div class="stat-info"><span>Sisa Budget</span><h3>${formatRupiah(sisa)}</h3></div></div>
    </div>
    <div class="card">
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Kategori</th><th>Detail</th><th>Vendor</th><th>Harga & Qty</th><th>DP & Tgl</th><th>Pelunasan & Tgl</th><th>Est / Aktual</th><th>Ket</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card mt-4" style="background:var(--bg-main);border:1px solid var(--border);">
        <h3 style="font-size:1.1rem;margin-bottom:16px;">Tambah Budget Baru</h3>
        <div class="grid-3" style="gap:16px;margin-bottom:16px;">
          <div class="form-group"><label>Kategori</label><select id="budgetKat"><option value="Venue">Venue</option><option value="Konsumsi">Konsumsi</option><option value="Attire">Attire</option><option value="Entertainment">Entertainment</option><option value="Transport">Transport</option><option value="Seserahan">Seserahan</option><option value="Tamu">Tamu</option><option value="KUA">KUA</option></select></div>
          <div class="form-group"><label>Detail Item</label><input type="text" id="budgetDetail" placeholder="Nama item..."></div>
          <div class="form-group"><label>Vendor</label><input type="text" id="budgetVendor" placeholder="Nama Vendor..."></div>
        </div>
        <div class="grid-4" style="gap:16px;margin-bottom:16px;">
          <div class="form-group"><label>Harga Satuan (Rp)</label><input type="number" id="budgetHarga" placeholder="0"></div>
          <div class="form-group"><label>Qty</label><input type="number" id="budgetQty" value="1" min="1"></div>
          <div class="form-group"><label>DP (Rp)</label><input type="number" id="budgetDp" placeholder="0"></div>
          <div class="form-group"><label>Tanggal DP</label><input type="date" id="budgetDpDate"></div>
        </div>
        <div class="grid-3" style="gap:16px;margin-bottom:16px;">
          <div class="form-group"><label>Pelunasan (Rp)</label><input type="number" id="budgetLunas" placeholder="0"></div>
          <div class="form-group"><label>Tgl Pelunasan</label><input type="date" id="budgetLunasDate"></div>
          <div class="form-group"><label>Keterangan</label><input type="text" id="budgetKet" placeholder="Catatan..."></div>
        </div>
        <div style="text-align:right;"><button onclick="addBudget()" class="btn-primary"><i class="ri-add-line"></i> Tambah Item Budget</button></div>
      </div>
    </div>
  `;
}

export function addBudget() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const item = document.getElementById('budgetDetail')?.value.trim();
  if (!item) return showToast('Detail item tidak boleh kosong');
  state.budget.push({
    id: generateId(), kategori: document.getElementById('budgetKat')?.value || '',
    item, vendor: document.getElementById('budgetVendor')?.value.trim() || '',
    harga: Number(document.getElementById('budgetHarga')?.value) || 0,
    qty: Number(document.getElementById('budgetQty')?.value) || 1,
    dpAkhir: Number(document.getElementById('budgetDp')?.value) || 0,
    dpDate: document.getElementById('budgetDpDate')?.value || '',
    lunasAkhir: Number(document.getElementById('budgetLunas')?.value) || 0,
    lunasDate: document.getElementById('budgetLunasDate')?.value || '',
    keterangan: document.getElementById('budgetKet')?.value.trim() || '',
  });
  saveState().then(() => showToast('Budget ditambahkan'));
}
