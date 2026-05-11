// Berkas KUA Module
import { getAppState, getIsLoaded, saveState, updateState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderBerkas(state) {
  const section = document.getElementById('berkas');
  if (!section) return;

  const renderList = (key, items) => items.map(item => `
    <li class="item-row ${item.checked ? 'completed' : ''}">
      <div class="item-content">
        <input type="checkbox" class="checkbox-custom" ${item.checked ? 'checked' : ''} onchange="toggleCheck('${key}', ${item.id})">
        <div class="item-text"><span class="item-title">${sanitize(item.title)}</span></div>
      </div>
      <div class="action-btns">
        <button class="btn-icon edit" onclick="editItem('${key}', ${item.id})"><i class="ri-edit-line"></i></button>
        <button class="btn-icon delete" onclick="deleteItem('${key}', ${item.id})"><i class="ri-delete-bin-line"></i></button>
      </div>
    </li>
  `).join('');

  const cpwLink = state.berkasCPWLink ? `<a href="${sanitize(state.berkasCPWLink)}" target="_blank" style="display:inline;color:var(--primary);font-size:1.2rem;" title="Buka GDrive CPW"><i class="ri-drive-line"></i></a>` : '';
  const cppLink = state.berkasCPPLink ? `<a href="${sanitize(state.berkasCPPLink)}" target="_blank" style="display:inline;color:var(--primary);font-size:1.2rem;" title="Buka GDrive CPP"><i class="ri-drive-line"></i></a>` : '';

  section.innerHTML = `
    <div class="card header-card">
      <h2>Berkas KUA</h2>
      <p>Checklist berkas pernikahan untuk CPW dan CPP.</p>
    </div>
    <div class="grid-2">
      <div class="card list-container">
        <h3 class="accent-title" style="display:flex;align-items:center;gap:8px;">
          <i class="ri-women-line"></i> Berkas CPW ${cpwLink}
          <button onclick="editGlobalLink('berkasCPWLink')" class="btn-icon" style="font-size:1rem;padding:4px;margin-left:auto;" title="Edit Link GDrive"><i class="ri-edit-line"></i></button>
        </h3>
        <ul class="todo-list">${renderList('berkasCPW', state.berkasCPW)}</ul>
        <div class="add-item-form compact mt-3" style="display:flex;gap:8px;">
          <input type="text" id="inputBerkasCPW" placeholder="Tambah Berkas CPW..." style="flex:1;">
          <button onclick="addSimpleItem('berkasCPW','inputBerkasCPW')" class="btn-secondary"><i class="ri-add-line"></i></button>
        </div>
      </div>
      <div class="card list-container">
        <h3 class="accent-title" style="display:flex;align-items:center;gap:8px;">
          <i class="ri-men-line"></i> Berkas CPP ${cppLink}
          <button onclick="editGlobalLink('berkasCPPLink')" class="btn-icon" style="font-size:1rem;padding:4px;margin-left:auto;" title="Edit Link GDrive"><i class="ri-edit-line"></i></button>
        </h3>
        <ul class="todo-list">${renderList('berkasCPP', state.berkasCPP)}</ul>
        <div class="add-item-form compact mt-3" style="display:flex;gap:8px;">
          <input type="text" id="inputBerkasCPP" placeholder="Tambah Berkas CPP..." style="flex:1;">
          <button onclick="addSimpleItem('berkasCPP','inputBerkasCPP')" class="btn-secondary"><i class="ri-add-line"></i></button>
        </div>
      </div>
    </div>
  `;
}

export function addSimpleItem(stateKey, inputId) {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const input = document.getElementById(inputId);
  if (!input?.value.trim()) return showToast('Tidak boleh kosong');
  state[stateKey].push({ id: generateId(), title: input.value.trim(), checked: false });
  input.value = '';
  saveState().then(() => showToast('Berkas ditambahkan'));
}
