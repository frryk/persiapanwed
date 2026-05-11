// Vendor Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

const VENDOR_PER_PAGE = 10;

export function renderVendor(state) {
  const section = document.getElementById('vendor');
  if (!section) return;

  section.innerHTML = `
    <div class="card header-card"><h2>List Vendor</h2><p>Kandidat vendor yang diseleksi dan pilihan final.</p></div>
    <div class="grid-2">
      <div class="card">
        <h3 class="accent-title"><i class="ri-search-line"></i> Vendor Kandidat</h3>
        <ul class="vendor-list" id="listVendorSeleksi"></ul>
        <div id="paginasiVendorSeleksi"></div>
        <div class="add-item-form timeline-form mt-3" style="padding:0;border:none;grid-template-columns:2fr 3fr 2fr auto;gap:8px;">
          <input type="text" id="inputVendorKategori" placeholder="Kategori">
          <input type="text" id="inputVendorNama" placeholder="Nama Vendor">
          <input type="text" id="inputVendorIg" placeholder="@username IG">
          <button onclick="addVendor('seleksi')" class="btn-secondary"><i class="ri-add-line"></i></button>
        </div>
      </div>
      <div class="card border-primary">
        <h3 class="accent-title primary-color"><i class="ri-check-double-line"></i> Vendor Terpilih</h3>
        <ul class="vendor-list" id="listVendorFinal"></ul>
        <div class="add-item-form timeline-form mt-3" style="padding:0;border:none;grid-template-columns:2fr 3fr 2fr auto;gap:8px;">
          <input type="text" id="inputVendorKategoriFinal" placeholder="Kategori">
          <input type="text" id="inputVendorNamaFinal" placeholder="Nama Vendor">
          <input type="text" id="inputVendorIgFinal" placeholder="@username IG">
          <button onclick="addVendor('final')" class="btn-primary"><i class="ri-add-line"></i></button>
        </div>
      </div>
    </div>
  `;

  renderVendorList('vendorSeleksi', 'listVendorSeleksi', state, true);
  renderVendorList('vendorFinal', 'listVendorFinal', state, false);
}

function renderVendorList(stateKey, elementId, state, isPaginated) {
  const list = document.getElementById(elementId);
  if (!list) return;
  const items = state[stateKey] || [];
  list.innerHTML = '';

  items.forEach(v => {
    const igLink = v.ig ? `<a href="https://instagram.com/${v.ig.replace('@','')}" target="_blank" style="font-size:0.85rem;color:var(--primary);">${sanitize(v.ig)}</a>` : '';
    const moveBtn = stateKey === 'vendorSeleksi'
      ? `<button class="btn-icon" onclick="pindahFinal(${v.id})" title="Pindah ke Terpilih"><i class="ri-arrow-right-line"></i></button>`
      : `<button class="btn-icon" onclick="pindahKandidat(${v.id})" title="Pindah ke Kandidat"><i class="ri-arrow-left-line"></i></button>`;

    const li = document.createElement('li');
    li.className = 'item-row';
    li.innerHTML = `
      <div class="item-content" style="flex-direction:column;gap:4px;">
        <span class="item-title">${sanitize(v.nama)}</span>
        <span class="item-desc">${sanitize(v.kategori)} ${igLink}</span>
      </div>
      <div class="action-btns">
        ${moveBtn}
        <button class="btn-icon edit" onclick="editItem('${stateKey}',${v.id})"><i class="ri-edit-line"></i></button>
        <button class="btn-icon delete" onclick="deleteItem('${stateKey}',${v.id})"><i class="ri-delete-bin-line"></i></button>
      </div>
    `;
    list.appendChild(li);
  });
}

export function addVendor(type) {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const suffix = type === 'final' ? 'Final' : '';
  const kat = document.getElementById(`inputVendorKategori${suffix}`)?.value.trim();
  const nama = document.getElementById(`inputVendorNama${suffix}`)?.value.trim();
  const ig = document.getElementById(`inputVendorIg${suffix}`)?.value.trim();
  if (!nama) return showToast('Nama vendor tidak boleh kosong');
  const key = type === 'final' ? 'vendorFinal' : 'vendorSeleksi';
  state[key].push({ id: generateId(), kategori: kat || '', nama, ig: ig || '', packages: [] });
  document.getElementById(`inputVendorKategori${suffix}`).value = '';
  document.getElementById(`inputVendorNama${suffix}`).value = '';
  document.getElementById(`inputVendorIg${suffix}`).value = '';
  saveState().then(() => showToast('Vendor ditambahkan'));
}

export function pindahFinal(id) {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const idx = state.vendorSeleksi.findIndex(v => v.id == id);
  if (idx !== -1) {
    const [vendor] = state.vendorSeleksi.splice(idx, 1);
    state.vendorFinal.push(vendor);
    saveState().then(() => showToast('Dipindahkan ke Vendor Terpilih'));
  }
}

export function pindahKandidat(id) {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const idx = state.vendorFinal.findIndex(v => v.id == id);
  if (idx !== -1) {
    const [vendor] = state.vendorFinal.splice(idx, 1);
    state.vendorSeleksi.push(vendor);
    saveState().then(() => showToast('Dipindahkan ke Kandidat'));
  }
}
