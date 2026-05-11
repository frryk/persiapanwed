// Persiapan Menikah Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderPersiapan(state) {
  const section = document.getElementById('persiapan');
  if (!section) return;

  const listHtml = state.persiapan.map(item => `
    <li class="item-row ${item.checked ? 'completed' : ''}">
      <div class="item-content">
        <input type="checkbox" class="checkbox-custom" ${item.checked ? 'checked' : ''} onchange="toggleCheck('persiapan', ${item.id})">
        <div class="item-text">
          <span class="item-title">${sanitize(item.title)}</span>
          ${item.desc ? `<span class="item-desc">${sanitize(item.desc)}</span>` : ''}
          ${item.link ? `<a href="${sanitize(item.link)}" target="_blank" class="item-link"><i class="ri-link"></i> Referensi</a>` : ''}
        </div>
      </div>
      <div class="action-btns">
        <button class="btn-icon edit" onclick="editItem('persiapan', ${item.id})"><i class="ri-edit-line"></i></button>
        <button class="btn-icon delete" onclick="deleteItem('persiapan', ${item.id})"><i class="ri-delete-bin-line"></i></button>
      </div>
    </li>
  `).join('');

  section.innerHTML = `
    <div class="card header-card">
      <h2>Persiapan Pokok</h2>
      <p>Daftar kebutuhan utama pernikahan seperti Mahar, Cincin, Seserahan dan lainnya.</p>
    </div>
    <div class="card list-container">
      <ul class="todo-list">${listHtml}</ul>
      <div class="add-item-form grid-4">
        <input type="text" id="inputPersiapanTitle" placeholder="Kebutuhan (cth: Cincin Nikah)">
        <input type="text" id="inputPersiapanDesc" placeholder="Keterangan / Detail...">
        <input type="url" id="inputPersiapanLink" placeholder="Link Referensi (Opsional)">
        <button onclick="addItem('persiapan')" class="btn-primary"><i class="ri-add-line"></i> Tambah</button>
      </div>
    </div>
  `;
}

export function addItem(stateKey) {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const titleInput = document.getElementById('inputPersiapanTitle');
  const descInput = document.getElementById('inputPersiapanDesc');
  const linkInput = document.getElementById('inputPersiapanLink');
  if (!titleInput?.value.trim()) return showToast('Judul tidak boleh kosong');
  state[stateKey].push({
    id: generateId(), title: titleInput.value.trim(),
    desc: descInput?.value.trim() || '', link: linkInput?.value.trim() || '', checked: false,
  });
  titleInput.value = ''; if(descInput) descInput.value = ''; if(linkInput) linkInput.value = '';
  saveState().then(() => showToast('Berhasil ditambahkan'));
}
