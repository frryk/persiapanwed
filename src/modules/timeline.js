// Timeline Module
import { getAppState, getIsLoaded, saveState } from '../store.js';
import { showToast, sanitize, generateId } from '../utils.js';

export function renderTimeline(state) {
  const section = document.getElementById('timeline');
  if (!section) return;

  const sorted = [...state.timeline].sort((a, b) => {
    const nA = parseInt((a.month.match(/\d+/) || [0])[0]);
    const nB = parseInt((b.month.match(/\d+/) || [0])[0]);
    return nB - nA;
  });

  const grouped = sorted.reduce((acc, curr) => {
    if (!acc[curr.month]) acc[curr.month] = [];
    acc[curr.month].push(curr);
    return acc;
  }, {});

  let timelineHtml = '';
  for (const [month, tasks] of Object.entries(grouped)) {
    const tasksHtml = tasks.map(t => `
      <li class="item-row ${t.checked ? 'completed' : ''}" style="margin-bottom:8px;">
        <div class="item-content">
          <input type="checkbox" class="checkbox-custom" ${t.checked ? 'checked' : ''} onchange="toggleCheck('timeline', ${t.id})">
          <div class="item-text"><span class="item-title">${sanitize(t.task)}</span></div>
        </div>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editItem('timeline', ${t.id})"><i class="ri-edit-line"></i></button>
          <button class="btn-icon delete" onclick="deleteItem('timeline', ${t.id})"><i class="ri-delete-bin-line"></i></button>
        </div>
      </li>
    `).join('');
    timelineHtml += `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-month">${sanitize(month)}</div>
          <ul class="todo-list">${tasksHtml}</ul>
        </div>
      </div>
    `;
  }

  section.innerHTML = `
    <div class="card header-card">
      <h2>Timeline Persiapan Menikah</h2>
      <p>Jadwal dan to-do list per bulan untuk persiapan dari awal hingga hari H.</p>
    </div>
    <div class="timeline-container">${timelineHtml}</div>
    <div class="card add-timeline-card">
      <h3>Tambah Timeline Baru</h3>
      <div class="add-item-form timeline-form">
        <select id="inputTimelineMonth">
          <option value="Bulan 12-10 Sebelum H">Bulan 12-10 Sebelum H</option>
          <option value="Bulan 9-6 Sebelum H">Bulan 9-6 Sebelum H</option>
          <option value="Bulan 5-4 Sebelum H">Bulan 5-4 Sebelum H</option>
          <option value="Bulan 3-2 Sebelum H">Bulan 3-2 Sebelum H</option>
          <option value="Bulan 1 Sebelum H">Bulan 1 Sebelum H</option>
          <option value="Hari H">Hari H</option>
        </select>
        <input type="text" id="inputTimelineTask" placeholder="Tugas Persiapan">
        <button onclick="addTimelineTask()" class="btn-primary"><i class="ri-add-line"></i> Tambah</button>
      </div>
    </div>
  `;
}

export function addTimelineTask() {
  if (!getIsLoaded()) return;
  const state = getAppState();
  const month = document.getElementById('inputTimelineMonth')?.value;
  const task = document.getElementById('inputTimelineTask')?.value;
  if (!task?.trim()) return showToast('Tugas tidak boleh kosong');
  state.timeline.push({ id: generateId(), month, task: task.trim(), checked: false });
  document.getElementById('inputTimelineTask').value = '';
  saveState().then(() => showToast('Timeline ditambahkan'));
}
