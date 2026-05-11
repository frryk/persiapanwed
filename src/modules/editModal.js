// Edit Modal Module
import { getAppState, saveState } from '../store.js';
import { showToast, sanitize } from '../utils.js';

export function renderEditModal(stateKey, id) {
  const state = getAppState();
  const item = state[stateKey]?.find(i => i.id == id);
  if (!item) return;
  const modal = document.getElementById('editModal');
  const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent = 'Edit Item';

  const fieldMap = {
    persiapan: () => `<div class="form-group"><label>Judul</label><input type="text" id="ef1" value="${sanitize(item.title)}"></div><div class="form-group"><label>Keterangan</label><input type="text" id="ef2" value="${sanitize(item.desc||'')}"></div><div class="form-group"><label>Link</label><input type="url" id="ef3" value="${sanitize(item.link||'')}"></div>`,
    timeline: () => `<div class="form-group"><label>Tugas</label><input type="text" id="ef1" value="${sanitize(item.task)}"></div>`,
    berkasCPW: () => `<div class="form-group"><label>Berkas</label><input type="text" id="ef1" value="${sanitize(item.title)}"></div>`,
    berkasCPP: () => `<div class="form-group"><label>Berkas</label><input type="text" id="ef1" value="${sanitize(item.title)}"></div>`,
    masterJobdeskTeman: () => `<div class="form-group"><label>Pekerjaan</label><input type="text" id="ef1" value="${sanitize(item.title)}"></div>`,
    masterNamaTeman: () => `<div class="form-group"><label>Nama</label><input type="text" id="ef1" value="${sanitize(item.title)}"></div>`,
    budget: () => `<div class="form-group"><label>Kategori</label><input type="text" id="ef1" value="${sanitize(item.kategori||'')}"></div><div class="form-group"><label>Detail</label><input type="text" id="ef2" value="${sanitize(item.item||'')}"></div><div class="form-group"><label>Vendor</label><input type="text" id="ef3" value="${sanitize(item.vendor||'')}"></div><div class="form-group"><label>Harga</label><input type="number" id="ef4" value="${item.harga||0}"></div><div class="form-group"><label>Qty</label><input type="number" id="ef5" value="${item.qty||1}"></div><div class="form-group"><label>DP</label><input type="number" id="ef6" value="${item.dpAkhir||0}"></div><div class="form-group"><label>Tgl DP</label><input type="date" id="ef7" value="${item.dpDate||''}"></div><div class="form-group"><label>Pelunasan</label><input type="number" id="ef8" value="${item.lunasAkhir||0}"></div><div class="form-group"><label>Tgl Lunas</label><input type="date" id="ef9" value="${item.lunasDate||''}"></div><div class="form-group"><label>Keterangan</label><input type="text" id="ef10" value="${sanitize(item.keterangan||'')}"></div>`,
    seserahan: () => `<div class="form-group"><label>Item</label><input type="text" id="ef1" value="${sanitize(item.item)}"></div><div class="form-group"><label>Brand</label><input type="text" id="ef2" value="${sanitize(item.brand||'')}"></div><div class="form-group"><label>Harga</label><input type="number" id="ef3" value="${item.harga||0}"></div><div class="form-group"><label>Link</label><input type="url" id="ef4" value="${sanitize(item.link||'')}"></div>`,
    vendorSeleksi: () => `<div class="form-group"><label>Kategori</label><input type="text" id="ef1" value="${sanitize(item.kategori)}"></div><div class="form-group"><label>Nama</label><input type="text" id="ef2" value="${sanitize(item.nama)}"></div><div class="form-group"><label>IG</label><input type="text" id="ef3" value="${sanitize(item.ig||'')}"></div>`,
    vendorFinal: () => `<div class="form-group"><label>Kategori</label><input type="text" id="ef1" value="${sanitize(item.kategori)}"></div><div class="form-group"><label>Nama</label><input type="text" id="ef2" value="${sanitize(item.nama)}"></div><div class="form-group"><label>IG</label><input type="text" id="ef3" value="${sanitize(item.ig||'')}"></div>`,
    jobdesk: () => `<div class="form-group"><label>Vendor</label><input type="text" id="ef1" value="${sanitize(item.vendor)}"></div><div class="form-group"><label>Tugas</label><textarea id="ef2" style="width:100%;min-height:80px;border-radius:6px;border:1px solid var(--border);padding:10px;font-family:inherit;">${sanitize(item.tugas)}</textarea></div>`,
    jobdeskTeman: () => `<div class="form-group"><label>Nama</label><input type="text" id="ef1" value="${sanitize(item.nama)}"></div><div class="form-group"><label>Tugas</label><input type="text" id="ef2" value="${sanitize(item.tugas)}"></div>`,
    rundown: () => `<div class="form-group"><label>Jam</label><input type="time" id="ef1" value="${item.jam||''}"></div><div class="form-group"><label>Kegiatan</label><input type="text" id="ef2" value="${sanitize(item.kegiatan)}"></div><div class="form-group"><label>Keterangan</label><input type="text" id="ef3" value="${sanitize(item.keterangan||'')}"></div>`,
    undangan: () => `<div class="form-group"><label>Nama</label><input type="text" id="ef1" value="${sanitize(item.nama)}"></div><div class="form-group"><label>Pihak</label><select id="ef2"><option value="CPW" ${item.pihak==='CPW'?'selected':''}>CPW</option><option value="CPP" ${item.pihak==='CPP'?'selected':''}>CPP</option></select></div><div class="form-group"><label>Relasi</label><input type="text" id="ef3" value="${sanitize(item.relasi||'')}"></div><div class="form-group"><label>Jumlah</label><input type="number" id="ef4" value="${item.jumlah||1}" min="1"></div>`,
  };

  body.innerHTML = (fieldMap[stateKey] || (() => '<p>N/A</p>'))();
  modal.classList.add('show');
}

export function saveEditedItem(stateKey, id) {
  const state = getAppState();
  const idx = state[stateKey]?.findIndex(i => i.id == id);
  if (idx === -1 || idx === undefined) return;
  const item = state[stateKey][idx];
  const g = (id) => document.getElementById(id)?.value || '';

  const saveMap = {
    persiapan: () => { item.title=g('ef1').trim()||item.title; item.desc=g('ef2').trim(); item.link=g('ef3').trim(); },
    timeline: () => { item.task=g('ef1').trim()||item.task; },
    berkasCPW: () => { item.title=g('ef1').trim()||item.title; },
    berkasCPP: () => { item.title=g('ef1').trim()||item.title; },
    masterJobdeskTeman: () => { item.title=g('ef1').trim()||item.title; },
    masterNamaTeman: () => { item.title=g('ef1').trim()||item.title; },
    budget: () => { item.kategori=g('ef1'); item.item=g('ef2').trim(); item.vendor=g('ef3').trim(); item.harga=Number(g('ef4'))||0; item.qty=Number(g('ef5'))||1; item.dpAkhir=Number(g('ef6'))||0; item.dpDate=g('ef7'); item.lunasAkhir=Number(g('ef8'))||0; item.lunasDate=g('ef9'); item.keterangan=g('ef10').trim(); },
    seserahan: () => { item.item=g('ef1').trim()||item.item; item.brand=g('ef2').trim(); item.harga=Number(g('ef3'))||0; item.link=g('ef4').trim(); },
    vendorSeleksi: () => { item.kategori=g('ef1').trim(); item.nama=g('ef2').trim()||item.nama; item.ig=g('ef3').trim(); },
    vendorFinal: () => { item.kategori=g('ef1').trim(); item.nama=g('ef2').trim()||item.nama; item.ig=g('ef3').trim(); },
    jobdesk: () => { item.vendor=g('ef1').trim()||item.vendor; item.tugas=g('ef2').trim()||item.tugas; },
    jobdeskTeman: () => { item.nama=g('ef1').trim()||item.nama; item.tugas=g('ef2').trim()||item.tugas; },
    rundown: () => { item.jam=g('ef1'); item.kegiatan=g('ef2').trim()||item.kegiatan; item.keterangan=g('ef3').trim(); },
    undangan: () => { item.nama=g('ef1').trim()||item.nama; item.pihak=g('ef2')||item.pihak; item.relasi=g('ef3').trim(); item.jumlah=Number(g('ef4'))||1; },
  };

  (saveMap[stateKey] || (() => {}))();
  saveState().then(() => showToast('Berhasil disimpan'));
}

export function closeEditModal() { document.getElementById('editModal')?.classList.remove('show'); }
export function addPackageToModal() {}
export function removePackageFromModal() {}
export function editPackageInModal() {}
export function savePackageEdit() {}
export function cancelPackageEdit() {}
