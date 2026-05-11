// Moodboard Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

let deleteIdTarget = null;

export function renderMoodboard(state) {
  const section = document.getElementById('moodboard');
  if (!section) return;
  const mb = state.moodboard || { categories: [], photos: [] };
  const cats = mb.categories || [];
  const catOptions = cats.length > 0 ? cats.map(c => `<option value="${sanitize(c)}">${sanitize(c)}</option>`).join('') : '<option value="">-- Belum ada Momen --</option>';

  section.innerHTML = `
    <div class="card header-card"><h2>Moodboard & Referensi</h2><p>Kategori pose atau momen yang akan diambil fotografer.</p></div>
    <div class="mb-filter-container">
      <div><label style="font-weight:500;display:block;margin-bottom:8px;color:var(--text-muted);font-size:0.9rem;">Pilih Momen:</label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <select id="mbSectionFilter" class="mb-dropdown" onchange="renderGallery()">${catOptions}</select>
          <button onclick="openCatModal()" class="btn-primary" style="padding:10px;">Kelola Momen</button>
        </div>
      </div>
      <button id="mbBtnAdd" class="btn-primary" style="display:none;" onclick="openAddModal()"><i class="ri-add-line"></i> Tambah Foto</button>
    </div>
    <div class="mb-gallery-grid" id="mbGalleryGrid"></div>
    ${renderCatModal(mb)}
    ${renderAddPhotoModal()}
    ${renderDeleteMbModal()}
  `;
  renderGallery(state);
}

function renderCatModal(mb) {
  const cats = (mb.categories||[]).map((c,i) => `<li class="mb-cat-item"><span>${sanitize(c)}</span><div style="display:flex;gap:8px;"><button onclick="editCategory(${i})" class="btn-icon"><i class="ri-edit-line"></i></button><button onclick="deleteCategory(${i})" class="btn-icon delete"><i class="ri-delete-bin-line"></i></button></div></li>`).join('');
  return `<div class="modal" id="mbCatModal"><div class="modal-content" style="max-width:500px;"><div class="modal-header"><h3>Kelola Momen</h3><button class="close-btn" onclick="closeCatModal()"><i class="ri-close-line"></i></button></div><div class="modal-body"><div style="display:flex;gap:8px;margin-bottom:16px;"><input type="text" id="mbNewCat" placeholder="Nama momen baru..."><button class="btn-primary" onclick="addCategory()">Tambah</button></div><ul class="mb-cat-list">${cats}</ul></div></div></div>`;
}

function renderAddPhotoModal() {
  return `<div class="modal" id="mbAddModal"><div class="modal-content" style="max-width:700px;"><div class="modal-header"><h3>Tambah Foto Referensi</h3><button class="close-btn" onclick="closeAddModal()"><i class="ri-close-line"></i></button></div><div class="modal-body">
    <div class="form-group" style="background:var(--bg-card);padding:12px;border-radius:8px;border:1px solid var(--border);"><label style="color:var(--text-muted);">Momen:</label><div id="mbLockedCat" style="font-weight:600;color:var(--primary);"></div><input type="hidden" id="mbInputCat"></div>
    <div class="form-group" style="background:var(--bg-main);padding:16px;border-radius:8px;border:1px dashed var(--border);"><label style="font-weight:600;margin-bottom:12px;">Sumber Gambar</label>
      <div style="margin-bottom:16px;"><label style="font-size:0.85rem;color:var(--text-muted);display:block;margin-bottom:6px;">Pilih Gambar Lokal</label><input type="file" id="mbFiles" multiple accept="image/*"></div>
      <div style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">-- ATAU DARI URL --</div>
      <div style="display:flex;gap:8px;"><input type="url" id="mbInputUrl" placeholder="Paste URL gambar..." style="flex:1;"><button class="btn-primary" onclick="fetchIG()" style="padding:10px;">Ambil</button></div>
      <div id="mbIgGrid" class="mb-ig-grid"></div>
    </div>
    <div class="form-group"><label>Keterangan (Opsional)</label><input type="text" id="mbInputDesc" placeholder="Keterangan foto..."></div>
    <div id="mbUploadProgress" style="display:none;text-align:center;color:var(--primary);font-weight:500;">Mengupload...</div>
    </div><div class="modal-footer"><button class="btn-secondary" onclick="closeAddModal()">Batal</button><button class="btn-primary" id="mbBtnSave" onclick="savePhoto()"><i class="ri-save-line"></i> Simpan</button></div></div></div>`;
}

function renderDeleteMbModal() {
  return `<div class="modal" id="mbDeleteModal"><div class="modal-content" style="max-width:400px;text-align:center;"><i class="ri-error-warning-line" style="font-size:4rem;color:#ff5252;"></i><h3 style="margin:16px 0;">Hapus Referensi?</h3><p style="color:var(--text-muted);margin-bottom:24px;">Yakin ingin menghapus foto ini?</p><div style="display:flex;gap:12px;justify-content:center;"><button class="btn-secondary" onclick="closeDeleteMbModal()">Batal</button><button class="btn-primary" onclick="confirmDeleteMb()" style="background:#ff5252;border-color:#ff5252;"><i class="ri-delete-bin-line"></i> Hapus</button></div></div></div>`;
}

export function renderGallery(state) {
  if (!state) state = getAppState();
  if (!state) return;
  const mb = state.moodboard || { categories: [], photos: [] };
  const filter = document.getElementById('mbSectionFilter')?.value;
  const grid = document.getElementById('mbGalleryGrid');
  const btnAdd = document.getElementById('mbBtnAdd');
  if (!grid) return;
  if (!filter) { btnAdd && (btnAdd.style.display='none'); grid.innerHTML='<div class="mb-empty"><i class="ri-list-settings-line"></i><p>Silakan tambah momen terlebih dahulu.</p></div>'; return; }
  btnAdd && (btnAdd.style.display='flex');
  const photos = (mb.photos||[]).filter(p => p.category === filter);
  if (photos.length === 0) { grid.innerHTML='<div class="mb-empty"><i class="ri-image-add-line"></i><p>Belum ada foto untuk momen ini.</p></div>'; return; }
  grid.innerHTML = [...photos].reverse().map(p => `<div class="mb-gallery-item"><button class="mb-delete-btn" onclick="openDeleteMbModal(${p.id})"><i class="ri-delete-bin-line"></i></button><img src="${sanitize(p.img)}" alt="${sanitize(p.desc||'')}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Error'">${p.desc?`<div class="mb-overlay">${sanitize(p.desc)}</div>`:''}</div>`).join('');
}

export function openCatModal() { document.getElementById('mbCatModal')?.classList.add('show'); }
export function closeCatModal() { document.getElementById('mbCatModal')?.classList.remove('show'); }

export function addCategory() {
  const state = getAppState(); if (!state) return;
  const val = document.getElementById('mbNewCat')?.value.trim();
  if (!val) return;
  if (!state.moodboard) state.moodboard = { categories: [], photos: [] };
  if (!state.moodboard.categories.includes(val)) { state.moodboard.categories.push(val); document.getElementById('mbNewCat').value=''; saveState().then(()=>showToast('Momen ditambahkan')); }
}

export function editCategory(idx) {
  const state = getAppState(); if (!state?.moodboard) return;
  const old = state.moodboard.categories[idx];
  const nw = prompt('Ubah nama momen:', old);
  if (nw && nw.trim() && nw !== old) { state.moodboard.categories[idx]=nw.trim(); (state.moodboard.photos||[]).forEach(p=>{if(p.category===old)p.category=nw.trim();}); saveState(); }
}

export function deleteCategory(idx) {
  const state = getAppState(); if (!state?.moodboard) return;
  const name = state.moodboard.categories[idx];
  if (confirm(`Hapus "${name}" beserta semua fotonya?`)) { state.moodboard.categories.splice(idx,1); state.moodboard.photos=(state.moodboard.photos||[]).filter(p=>p.category!==name); saveState(); }
}

export function openAddModal() { const f=document.getElementById('mbSectionFilter')?.value; document.getElementById('mbLockedCat').textContent=f; document.getElementById('mbInputCat').value=f; document.getElementById('mbAddModal')?.classList.add('show'); }
export function closeAddModal() { document.getElementById('mbAddModal')?.classList.remove('show'); document.getElementById('mbFiles').value=''; document.getElementById('mbInputDesc').value=''; document.getElementById('mbInputUrl').value=''; document.getElementById('mbIgGrid').innerHTML=''; }

export async function savePhoto() {
  const state = getAppState(); if (!state) return;
  const cat = document.getElementById('mbInputCat')?.value;
  const desc = document.getElementById('mbInputDesc')?.value||'';
  const files = document.getElementById('mbFiles')?.files;
  const igImgs = Array.from(document.querySelectorAll('.ig-thumb.selected')).map(el=>el.src);
  const urlInput = document.getElementById('mbInputUrl')?.value.trim();
  let urls = [...igImgs];
  if (urlInput && !igImgs.length && (!files || files.length===0)) urls.push(urlInput);
  if (files && files.length > 0) {
    const prog = document.getElementById('mbUploadProgress'); if(prog){prog.style.display='block';prog.textContent=`Uploading ${files.length} gambar...`;}
    for (let f of files) { const fd=new FormData();fd.append('file',f);fd.append('upload_preset','moodboard'); try{const r=await fetch('https://api.cloudinary.com/v1_1/dlb3eamrw/image/upload',{method:'POST',body:fd});const d=await r.json();if(d.secure_url)urls.push(d.secure_url);}catch(e){console.error(e);} }
    if(prog)prog.style.display='none';
  }
  if (urls.length===0) return showToast('Pilih minimal satu gambar');
  if (!state.moodboard) state.moodboard={categories:[],photos:[]};
  urls.forEach((url,i)=>state.moodboard.photos.push({id:Date.now()+i,category:cat,img:url,desc}));
  saveState().then(()=>{closeAddModal();showToast('Foto disimpan');});
}

export function fetchIG() { const url=document.getElementById('mbInputUrl')?.value.trim(); if(!url)return showToast('Masukkan URL'); document.getElementById('mbIgGrid').innerHTML=`<img src="${sanitize(url)}" onclick="selectIgImg('${sanitize(url)}',this)" class="ig-thumb" style="cursor:pointer;border:2px solid transparent;border-radius:6px;max-width:140px;aspect-ratio:1;object-fit:cover;">`; }

export function openDeleteMbModal(id) { deleteIdTarget=id; document.getElementById('mbDeleteModal')?.classList.add('show'); }
export function closeDeleteMbModal() { deleteIdTarget=null; document.getElementById('mbDeleteModal')?.classList.remove('show'); }
export function confirmDeleteMb() { const state=getAppState(); if(deleteIdTarget!==null&&state?.moodboard) { state.moodboard.photos=(state.moodboard.photos||[]).filter(p=>p.id!==deleteIdTarget); saveState().then(()=>{closeDeleteMbModal();}); } }
