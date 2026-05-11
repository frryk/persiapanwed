// Seserahan Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId, formatRupiah } from '../utils.js';

export function renderSeserahan(state) {
  const section = document.getElementById('seserahan');
  if (!section) return;

  const filter = document.getElementById('filterSeserahan')?.value || 'Semua';
  const filtered = filter === 'Semua' ? state.seserahan : state.seserahan.filter(s => s.kategori === filter);
  const total = state.seserahan.reduce((s, i) => s + (i.checked ? (Number(i.harga) || 0) : 0), 0);

  const rows = filtered.map(s => `<tr>
    <td><input type="checkbox" class="checkbox-custom" ${s.checked?'checked':''} onchange="toggleCheck('seserahan',${s.id})"></td>
    <td>${sanitize(s.kategori)}</td><td>${sanitize(s.item)}</td><td>${sanitize(s.brand||'')}</td>
    <td>${formatRupiah(s.harga)}</td>
    <td>${s.link?`<a href="${sanitize(s.link)}" target="_blank" class="item-link"><i class="ri-link"></i></a>`:'-'}</td>
    <td><div class="action-btns"><button class="btn-icon edit" onclick="editItem('seserahan',${s.id})"><i class="ri-edit-line"></i></button><button class="btn-icon delete" onclick="deleteItem('seserahan',${s.id})"><i class="ri-delete-bin-line"></i></button></div></td>
  </tr>`).join('');

  // Only set innerHTML if section is empty or needs full re-render
  section.innerHTML = `
    <div class="card header-card"><h2>Checklist Seserahan</h2><p>Daftar barang seserahan beserta brand dan harga.</p></div>
    <div class="card">
      <div class="stat-card mb-4"><div class="stat-icon"><i class="ri-shopping-bag-3-line"></i></div><div class="stat-info"><p>Total Pengeluaran Seserahan</p><h3>${formatRupiah(total)}</h3></div></div>
      <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <label for="filterSeserahan" style="font-weight:500;">Filter:</label>
        <select id="filterSeserahan" onchange="renderSeserahan()">
          <option value="Semua" ${filter==='Semua'?'selected':''}>Semua Kategori</option>
          <option value="Dipakai Bersama" ${filter==='Dipakai Bersama'?'selected':''}>Dipakai Bersama</option>
          <option value="Dipakai Pria" ${filter==='Dipakai Pria'?'selected':''}>Dipakai Pria</option>
          <option value="Dipakai Wanita" ${filter==='Dipakai Wanita'?'selected':''}>Dipakai Wanita</option>
        </select>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Status</th><th>Kategori</th><th>Item</th><th>Brand</th><th>Harga</th><th>Link</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="add-item-form timeline-form mt-4" style="grid-template-columns:1fr 2fr 1.5fr 1fr 1.5fr auto;gap:8px;">
        <select id="seserahanKategori"><option value="Dipakai Bersama">Dipakai Bersama</option><option value="Dipakai Pria">Dipakai Pria</option><option value="Dipakai Wanita">Dipakai Wanita</option></select>
        <input type="text" id="seserahanItem" placeholder="Nama Item"><input type="text" id="seserahanBrand" placeholder="Brand/Merk">
        <input type="number" id="seserahanHarga" placeholder="Harga (Rp)"><input type="url" id="seserahanLink" placeholder="Link Pembelian">
        <button onclick="addSeserahan()" class="btn-primary"><i class="ri-add-line"></i> Tambah</button>
      </div>
    </div>
  `;
}

export function addSeserahan() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const item = document.getElementById('seserahanItem')?.value.trim();
  if (!item) return showToast('Nama item tidak boleh kosong');
  state.seserahan.push({
    id: generateId(), kategori: document.getElementById('seserahanKategori')?.value || '',
    item, brand: document.getElementById('seserahanBrand')?.value.trim() || '',
    harga: Number(document.getElementById('seserahanHarga')?.value) || 0,
    link: document.getElementById('seserahanLink')?.value.trim() || '', checked: false,
  });
  saveState().then(() => showToast('Seserahan ditambahkan'));
}
