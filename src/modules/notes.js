// Notes Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, debounce } from '../utils.js';

let notesTimeout;

export function renderNotes(state) {
  const section = document.getElementById('notes');
  if (!section) return;
  section.innerHTML = `
    <div class="card header-card"><h2>Notes & Ide-Ide</h2><p>Tempat referensi apapun bisa Anda simpan di sini otomatis.</p></div>
    <div class="card">
      <textarea id="notesArea" oninput="handleNotesInput()" placeholder="Tuliskan berbagai ide atau catatan penting di sini..."
        style="width:100%;border-radius:6px;border:1px solid var(--border);padding:16px;font-family:inherit;min-height:300px;resize:vertical;outline:none;margin-bottom:16px;background:var(--bg-main);color:var(--text-main);font-size:0.95rem;">${state.notes || ''}</textarea>
      <div style="text-align:right;display:flex;justify-content:flex-end;align-items:center;">
        <span id="notesSaveStatus" style="font-size:0.85rem;color:var(--primary);font-weight:500;margin-right:12px;display:none;"></span>
      </div>
    </div>
  `;
}

export function handleNotesInput() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const area = document.getElementById('notesArea');
  if (!area || !state) return;
  state.notes = area.value;
  const status = document.getElementById('notesSaveStatus');
  if (status) { status.textContent = 'Mengetik...'; status.style.display = 'inline-block'; }
  clearTimeout(notesTimeout);
  notesTimeout = setTimeout(() => {
    saveState().then(() => {
      if (status) { status.textContent = 'Tersimpan'; setTimeout(() => { status.style.display = 'none'; }, 2000); }
    });
  }, 1000);
}

export function saveNotesManual() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const area = document.getElementById('notesArea');
  if (area && state) state.notes = area.value;
  saveState().then(() => showToast('Catatan disimpan'));
}
