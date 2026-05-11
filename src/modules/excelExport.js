// Excel Export Module
import { getAppState } from '../store.js';
import { showToast, formatRupiah } from '../utils.js';

export function exportSemuaKeExcel() {
  const state = getAppState();
  if (!state) return;
  if (typeof XLSX === 'undefined') { showToast('Library XLSX belum dimuat'); return; }

  const wb = XLSX.utils.book_new();

  // Persiapan
  const persiapanData = state.persiapan.map(p => ({ Item: p.title, Keterangan: p.desc||'', Status: p.checked?'Selesai':'Belum' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(persiapanData), 'Persiapan');

  // Timeline
  const tlData = state.timeline.map(t => ({ Bulan: t.month, Tugas: t.task, Status: t.checked?'Selesai':'Belum' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tlData), 'Timeline');

  // Budget
  const budgetData = state.budget.map(b => ({ Kategori: b.kategori, Item: b.item||b.detail||'', Vendor: b.vendor||'', 'Harga Satuan': b.harga||0, Qty: b.qty||1, DP: b.dpAkhir||0, 'Tgl DP': b.dpDate||'', Pelunasan: b.lunasAkhir||0, 'Tgl Lunas': b.lunasDate||'', Keterangan: b.keterangan||'' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(budgetData), 'Budget');

  // Seserahan
  const sesData = state.seserahan.map(s => ({ Kategori: s.kategori, Item: s.item, Brand: s.brand||'', Harga: s.harga||0, Status: s.checked?'Beli':'Belum' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sesData), 'Seserahan');

  // Vendor
  const vData = [...state.vendorSeleksi.map(v=>({...v,status:'Kandidat'})), ...state.vendorFinal.map(v=>({...v,status:'Terpilih'}))].map(v=>({ Kategori: v.kategori, Nama: v.nama, IG: v.ig||'', Status: v.status }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vData), 'Vendor');

  // Rundown
  const rdData = [...state.rundown].sort((a,b)=>(a.jam||'').localeCompare(b.jam||'')).map(r=>({ Jam: r.jam, Kegiatan: r.kegiatan, Keterangan: r.keterangan||'' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rdData), 'Rundown');

  // Undangan
  const undData = state.undangan.map(u=>({ Nama: u.nama, Pihak: u.pihak, Relasi: u.relasi||'', Jumlah: u.jumlah||1, Dikirim: u.dikirim||'Belum', Konfirmasi: u.konfirmasi||'Pending' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(undData), 'Undangan');

  XLSX.writeFile(wb, 'Wedding_Tracker_Export.xlsx');
  showToast('File Excel berhasil di-download');
}
