// Dashboard Module
import { formatRupiah, sanitize } from '../utils.js';

export function renderDashboard(state) {
  const section = document.getElementById('dashboard');
  if (!section) return;

  // Calculate stats
  const allCheckable = [
    ...state.persiapan, ...state.timeline,
    ...state.berkasCPW, ...state.berkasCPP,
  ];
  const totalChecked = allCheckable.filter(i => i.checked).length;
  const totalItems = allCheckable.length;
  const checkPct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  const totalEstimasi = state.budget.reduce((s, b) => s + (b.harga || b.estimasi || 0) * (b.qty || 1), 0);
  const totalAktual = state.budget.reduce((s, b) => s + (b.dpAkhir || 0) + (b.lunasAkhir || 0), 0);
  const budgetPct = totalEstimasi > 0 ? Math.round((totalAktual / totalEstimasi) * 100) : 0;

  const totalTamu = state.undangan.length;
  const totalHadir = state.undangan.filter(u => u.konfirmasi === 'Hadir').length;
  const vendorFix = state.vendorFinal.length;
  const vendorTugas = state.jobdesk.length;
  const panitiaTugas = state.jobdeskTeman.length;

  section.innerHTML = `
    <div class="card header-card">
      <h2>Dashboard Wedding Tracker</h2>
      <p>Ringkasan menyeluruh progres persiapan dari setiap sektor.</p>
    </div>
    <div class="grid-2 mb-4" style="gap:20px;display:grid;">
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="stat-card" style="flex-direction:row;justify-content:flex-start;align-items:center;gap:16px;">
          <div class="stat-icon" style="background:var(--bg-accent)"><i class="ri-checkbox-circle-line"></i></div>
          <div>
            <span style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:2px;">Checklist Selesai</span>
            <h3 style="color:var(--text-main);">${totalChecked}/${totalItems} <span style="font-size:1rem;font-weight:normal;color:var(--text-muted);">(${checkPct}%)</span></h3>
          </div>
        </div>
        <div class="stat-card" style="flex-direction:row;justify-content:flex-start;align-items:center;gap:16px;">
          <div class="stat-icon" style="background:rgba(76,175,80,0.1);color:#4caf50;"><i class="ri-hand-coin-line"></i></div>
          <div>
            <span style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:2px;">Budget Digunakan</span>
            <h3 style="color:var(--text-main);">${formatRupiah(totalAktual)}</h3>
            <div style="font-size:0.85rem;color:#4caf50;font-weight:500;">${budgetPct}% dari Budget</div>
          </div>
        </div>
        <div class="stat-card" style="flex-direction:row;justify-content:flex-start;align-items:center;gap:16px;">
          <div class="stat-icon" style="background:rgba(233,30,99,0.1);color:#e91e63;"><i class="ri-group-line"></i></div>
          <div>
            <span style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:2px;">Konfirmasi Hadir</span>
            <h3 style="color:var(--text-main);">${totalHadir} <span style="font-size:1rem;font-weight:normal;color:var(--text-muted);">/ ${totalTamu}</span></h3>
          </div>
        </div>
      </div>
      <div>
        <div class="card p-4" style="height:100%;">
          <h3 style="font-size:1.1rem;margin-bottom:16px;"><i class="ri-store-2-line" style="color:var(--primary);margin-right:6px;"></i> Rekap Vendor & Catering</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:8px;">
            <span>Vendor Kunci (Fix)</span><strong>${vendorFix}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:8px;">
            <span>Tugas Vendor Tercatat</span><strong>${vendorTugas}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid var(--border);padding-bottom:8px;">
            <span>Tugas Panitia Tercatat</span><strong>${panitiaTugas}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function updateProgress(state) {
  if (!state) return;
  const allCheckable = [
    ...state.persiapan, ...state.timeline,
    ...state.berkasCPW, ...state.berkasCPP,
  ];
  const total = allCheckable.length;
  const checked = allCheckable.filter(i => i.checked).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const bar = document.getElementById('overallProgress');
  const text = document.getElementById('overallText');
  if (bar) bar.style.width = `${pct}%`;
  if (text) text.textContent = `${pct}%`;
}
