/**
 * dashboard.ts
 * Redesigned Model Insights & Telemetry Dashboard for SureSign.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { navigateTo } from '../router';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

interface AuditRecord {
  caseId: string;
  timeAgo: string;
  sigRefSvg: string;
  sigScanSvg: string;
  isMatch: boolean;
  docName: string;
  docMeta: string;
  l1Distance: string;
  l1Margin: string;
  verdictScore: string;
  category: 'genuine' | 'forged' | 'batch';
}

const auditRecords: AuditRecord[] = [
  {
    caseId: '#SIG-8921',
    timeAgo: '12s ago',
    sigRefSvg: `<path d="M 10,22 C 30,8 60,35 90,18 S 130,10 150,25" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    sigScanSvg: `<path d="M 10,22 C 30,8 60,35 90,18 S 130,10 150,25" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    isMatch: true,
    docName: 'Commercial Loan Affidavit',
    docMeta: 'Branch: NY-01 // Primary',
    l1Distance: '0.082',
    l1Margin: '+0.418',
    verdictScore: '98.4%',
    category: 'genuine',
  },
  {
    caseId: '#SIG-8920',
    timeAgo: '1m ago',
    sigRefSvg: `<path d="M 10,25 C 40,10 75,40 105,20 S 140,10 150,28" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    sigScanSvg: `<path d="M 10,35 C 30,45 80,15 110,38 S 135,15 150,20" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    isMatch: false,
    docName: 'Wire Transfer Slip #05',
    docMeta: 'Amount: $450,000.00',
    l1Distance: '0.842',
    l1Margin: '-0.342',
    verdictScore: '12.1%',
    category: 'forged',
  },
  {
    caseId: '#SIG-8919',
    timeAgo: '3m ago',
    sigRefSvg: `<path d="M 12,20 C 35,8 70,30 100,15 S 135,22 150,16" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    sigScanSvg: `<path d="M 12,20 C 35,8 70,30 100,15 S 135,22 150,16" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    isMatch: true,
    docName: 'Employee NDA Agreement',
    docMeta: 'Legal vault // Safe-assert',
    l1Distance: '0.095',
    l1Margin: '+0.405',
    verdictScore: '95.2%',
    category: 'genuine',
  },
  {
    caseId: '#SIG-8918',
    timeAgo: '7m ago',
    sigRefSvg: `<path d="M 10,28 C 45,18 80,36 125,22 S 145,28 150,12" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    sigScanSvg: `<path d="M 10,12 C 40,40 70,12 110,35 S 130,8 150,30" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    isMatch: false,
    docName: 'Commercial Property Lease',
    docMeta: 'Deed registry access',
    l1Distance: '0.791',
    l1Margin: '-0.291',
    verdictScore: '18.5%',
    category: 'forged',
  },
  {
    caseId: '#SIG-8917',
    timeAgo: '12m ago',
    sigRefSvg: `<path d="M 15,25 C 45,10 75,40 105,20 S 140,8 150,28" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    sigScanSvg: `<path d="M 15,25 C 45,10 75,40 105,20 S 140,8 150,28" stroke="#1C1C16" stroke-width="4" stroke-linecap="round" fill="none" />`,
    isMatch: true,
    docName: 'Mortgage Deed Contract',
    docMeta: 'Batch Job #B-402',
    l1Distance: '0.041',
    l1Margin: '+0.459',
    verdictScore: '99.1%',
    category: 'batch',
  },
];

let activeFilter: 'all' | 'genuine' | 'forged' | 'batch' = 'all';
let searchQuery = '';

export function renderDashboard(container: HTMLElement): void {
  // Clean up any existing ScrollTriggers & Lenis
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  ScrollTrigger.getAll().forEach((st) => st.kill());

  container.innerHTML = `
    <!-- ─── Top Nav ─── -->
    <nav class="topnav" id="topnav">
      <div class="topnav__brand" id="nav-brand" style="cursor: pointer;">SureSign</div>
      <div class="topnav__links">
        <a href="/" data-route="/" class="topnav__link">Verify</a>
        <a href="/batch" data-route="/batch" class="topnav__link">Batch Mode</a>
        <a href="/#how-it-works" class="topnav__link">How It Works</a>
        <a href="/#features" class="topnav__link">Features</a>
        <a href="/dashboard" data-route="/dashboard" class="topnav__link topnav__link--active">Dashboard</a>
      </div>
      <button class="topnav__account" aria-label="Account">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">account_circle</span>
      </button>
    </nav>

    <!-- ─── Dashboard 2-Column Layout ─── -->
    <div class="dash-layout">
      <!-- ─── Sidebar ─── -->
      <aside class="dash-sidebar">
        <div class="dash-sidebar__nav">
          <button class="dash-nav-btn dash-nav-btn--active" id="sb-dashboard">
            <span class="material-symbols-outlined">dashboard</span>
            <span>DASHBOARD</span>
          </button>
          <button class="dash-nav-btn" id="sb-verify">
            <span class="material-symbols-outlined">verified</span>
            <span>LIVE VERIFY</span>
          </button>
          <button class="dash-nav-btn" id="sb-batch">
            <span class="material-symbols-outlined">folder_zip</span>
            <span>BATCH MODE</span>
          </button>
          <button class="dash-nav-btn" id="sb-audit">
            <span class="material-symbols-outlined">receipt_long</span>
            <span>AUDIT LOGS</span>
          </button>
          <button class="dash-nav-btn" id="sb-apikeys">
            <span class="material-symbols-outlined">key</span>
            <span>API KEYS</span>
          </button>
        </div>
      </aside>

      <!-- ─── Main Content ─── -->
      <main class="dash-main">
        <!-- ─── Header ─── -->
        <div class="dash-header">
          <div class="dash-header__titles">
            <h1 class="dash-title">
              MODEL INSIGHTS & <span class="dash-title__highlight">TELEMETRY</span>
            </h1>
            <p class="dash-subtitle">
              Real-time forensic Siamese twin-network distance telemetry, signature anomaly clustering, and live verification logs.
            </p>
          </div>
          <div class="dash-header__actions">
            <button class="btn btn--secondary btn--sm" id="btn-recalibrate">
              <span class="material-symbols-outlined">tune</span>
              RE-CALIBRATE THRESHOLD
            </button>
            <button class="btn btn--primary btn--sm" id="btn-test-sample">
              + TEST SAMPLE PAIR
            </button>
          </div>
        </div>

        <!-- ─── Top 4 Metric Cards Grid ─── -->
        <div class="dash-metrics-grid">
          <!-- Metric 01: Accuracy -->
          <div class="dash-metric-card dash-metric-card--yellow">
            <div class="dash-metric-card__head">
              <span>METRIC // 01</span>
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <div class="dash-metric-card__sub">TEST ACCURACY</div>
            <div class="dash-metric-card__val">99.1%</div>
            <div class="dash-metric-card__foot">
              <span class="tag-badge tag-badge--yellow">+0.4% from epoch #40</span>
            </div>
          </div>

          <!-- Metric 02: ROC-AUC -->
          <div class="dash-metric-card dash-metric-card--pink">
            <div class="dash-metric-card__head">
              <span>METRIC // 02</span>
              <span class="material-symbols-outlined">trending_up</span>
            </div>
            <div class="dash-metric-card__sub">ROC-AUC SCORE</div>
            <div class="dash-metric-card__val">0.998</div>
            <div class="dash-metric-card__foot">
              <span class="tag-badge tag-badge--pink">Discrimination Rank: Excellent</span>
            </div>
          </div>

          <!-- Metric 03: Latency -->
          <div class="dash-metric-card dash-metric-card--blue">
            <div class="dash-metric-card__head">
              <span>METRIC // 03</span>
              <span class="material-symbols-outlined">timer</span>
            </div>
            <div class="dash-metric-card__sub">INFERENCE LATENCY</div>
            <div class="dash-metric-card__val">&lt;180ms</div>
            <div class="dash-metric-card__foot">
              <span class="tag-badge tag-badge--blue">Real-time edge CUDA</span>
            </div>
          </div>

          <!-- Metric 04: Pairs Verified -->
          <div class="dash-metric-card dash-metric-card--green">
            <div class="dash-metric-card__head">
              <span>METRIC // 04</span>
              <span class="material-symbols-outlined">verified_user</span>
            </div>
            <div class="dash-metric-card__sub">PAIRS VERIFIED</div>
            <div class="dash-metric-card__val">14,820</div>
            <div class="dash-metric-card__foot">
              <span class="tag-badge tag-badge--green">99.4% precision rate</span>
            </div>
          </div>
        </div>

        <!-- ─── Live Forensic Audit Log Section ─── -->
        <div class="dash-audit-section" id="audit-log-section">
          <!-- Section Title & Controls -->
          <div class="dash-audit-header">
            <div class="dash-audit-header__title">
              <h2 class="dash-section-title">LIVE FORENSIC AUDIT LOG</h2>
              <span class="dash-live-badge">REAL-TIME</span>
            </div>
            <div class="dash-audit-header__controls">
              <button class="btn btn--secondary btn--xs" id="btn-export-csv">
                <span class="material-symbols-outlined">download</span> EXPORT CSV
              </button>
              <button class="btn btn--secondary btn--xs icon-only" id="btn-refresh-log" title="Refresh Log">
                <span class="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>

          <!-- Filter Bar & Search Box -->
          <div class="dash-filter-bar">
            <div class="dash-filter-tabs">
              <button class="dash-filter-tab dash-filter-tab--active" data-filter="all">ALL (14,820)</button>
              <button class="dash-filter-tab" data-filter="genuine">GENUINE (11,430)</button>
              <button class="dash-filter-tab" data-filter="forged">FORGED (3,390)</button>
              <button class="dash-filter-tab" data-filter="batch">BATCH RUNS</button>
            </div>

            <div class="dash-search-box">
              <span class="material-symbols-outlined search-icon">search</span>
              <input type="text" id="audit-search-input" placeholder="Search Case ID / Document..." />
            </div>
          </div>

          <!-- Table Container -->
          <div class="audit-table-wrap">
            <table class="audit-table">
              <thead>
                <tr>
                  <th style="width: 110px;">CASE ID</th>
                  <th style="width: 280px;">SIGNATURE PAIR COMPARISON (REF vs SCAN)</th>
                  <th>SOURCE DOCUMENT</th>
                  <th style="width: 120px;">SIAMESE L1</th>
                  <th style="width: 140px;">VERDICT STAMP</th>
                  <th style="width: 130px; text-align: center;">ACTION</th>
                </tr>
              </thead>
              <tbody id="audit-tbody">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Table Pagination Footer -->
          <div class="audit-table-foot">
            <div class="audit-foot-count" id="audit-count-label">SHOWING 5 OF 14,820 FORENSIC AUDIT TICKETS</div>
            <div class="audit-pagination">
              <button class="btn btn--secondary btn--xs" id="pg-prev">PREV</button>
              <span class="audit-pg-text">PAGE 01 / 970</span>
              <button class="btn btn--secondary btn--xs" id="pg-next">NEXT</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Container -->
    <div id="dash-modal" class="dash-modal hidden" aria-hidden="true">
      <div class="dash-modal__content">
        <button class="dash-modal__close" id="dash-modal-close">&times;</button>
        <div id="dash-modal-body"></div>
      </div>
    </div>
  `;

  // Attach interactive listeners
  attachDashboardEvents(container);

  // Initial table render
  renderAuditTable();

  // Scroll to top
  window.scrollTo(0, 0);
}

function attachDashboardEvents(container: HTMLElement): void {
  // Brand logo click
  container.querySelector('#nav-brand')?.addEventListener('click', () => navigateTo('/'));

  // Sidebar navigation buttons
  container.querySelector('#sb-dashboard')?.addEventListener('click', () => {
    container.querySelector('#audit-log-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelector('#sb-verify')?.addEventListener('click', () => navigateTo('/verify'));
  container.querySelector('#sb-batch')?.addEventListener('click', () => navigateTo('/batch'));

  container.querySelector('#sb-audit')?.addEventListener('click', () => {
    container.querySelector('#audit-log-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelector('#sb-apikeys')?.addEventListener('click', () => openApiKeysModal());

  // Header action buttons
  container.querySelector('#btn-recalibrate')?.addEventListener('click', () => {
    showToast('Threshold re-calibrated! Optimal L1 cutoff set to 0.45.');
  });

  container.querySelector('#btn-test-sample')?.addEventListener('click', () => navigateTo('/verify'));

  // Filter tabs
  const tabs = container.querySelectorAll<HTMLButtonElement>('.dash-filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('dash-filter-tab--active'));
      tab.classList.add('dash-filter-tab--active');
      activeFilter = (tab.dataset.filter as any) ?? 'all';
      renderAuditTable();
    });
  });

  // Search input
  const searchInput = container.querySelector<HTMLInputElement>('#audit-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
    renderAuditTable();
  });

  // Refresh button
  container.querySelector('#btn-refresh-log')?.addEventListener('click', () => {
    renderAuditTable();
    showToast('Audit log updated in real-time.');
  });

  // Export CSV button
  container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
    showToast('Downloading forensic_audit_log_2024.csv...');
  });

  // Modal close
  container.querySelector('#dash-modal-close')?.addEventListener('click', closeModal);
  container.querySelector('#dash-modal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'dash-modal') closeModal();
  });
}

function renderAuditTable(): void {
  const tbody = document.getElementById('audit-tbody');
  const countLabel = document.getElementById('audit-count-label');
  if (!tbody) return;

  const filtered = auditRecords.filter((rec) => {
    // Category filter
    if (activeFilter === 'genuine' && !rec.isMatch) return false;
    if (activeFilter === 'forged' && rec.isMatch) return false;
    if (activeFilter === 'batch' && rec.category !== 'batch') return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCase = rec.caseId.toLowerCase().includes(q);
      const matchDoc = rec.docName.toLowerCase().includes(q);
      return matchCase || matchDoc;
    }

    return true;
  });

  if (countLabel) {
    countLabel.textContent = `SHOWING ${filtered.length} OF 14,820 FORENSIC AUDIT TICKETS`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem; font-family: var(--ff-mono);">
          NO MATCHING FORENSIC AUDIT RECORDS FOUND.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (rec) => `
    <tr class="audit-tr">
      <td>
        <div class="audit-case-id">${rec.caseId}</div>
        <div class="audit-time-ago">${rec.timeAgo}</div>
      </td>

      <td>
        <div class="audit-pair-thumb">
          <div class="thumb-box">
            <span class="thumb-tag">REF</span>
            <svg viewBox="0 0 160 40">${rec.sigRefSvg}</svg>
          </div>
          <span class="vs-divider">VS</span>
          <div class="thumb-box">
            <span class="thumb-tag">SCAN</span>
            <svg viewBox="0 0 160 40">${rec.sigScanSvg}</svg>
          </div>
        </div>
      </td>

      <td>
        <div class="audit-doc-name">${rec.docName}</div>
        <div class="audit-doc-meta">${rec.docMeta}</div>
      </td>

      <td>
        <div class="audit-l1-val ${rec.isMatch ? 'text-green' : 'text-pink'}">${rec.l1Distance}</div>
        <div class="audit-l1-margin">margin: ${rec.l1Margin}</div>
      </td>

      <td>
        <div class="verdict-stamp ${rec.isMatch ? 'verdict-stamp--genuine' : 'verdict-stamp--forged'}">
          ${rec.isMatch ? '✓ GENUINE' : '▲ FORGED'} [${rec.verdictScore}]
        </div>
      </td>

      <td style="text-align: center;">
        <button class="btn btn--secondary btn--xs btn-action-modal" data-case="${rec.caseId}">
          ${rec.isMatch ? 'FORENSIC MAP →' : 'HEATMAP OVERLAY →'}
        </button>
      </td>
    </tr>
  `
    )
    .join('');

  // Attach action button clicks
  tbody.querySelectorAll<HTMLButtonElement>('.btn-action-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.dataset.case;
      const rec = auditRecords.find((r) => r.caseId === caseId);
      if (rec) openForensicModal(rec);
    });
  });
}

function openForensicModal(rec: AuditRecord): void {
  const modal = document.getElementById('dash-modal');
  const body = document.getElementById('dash-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="modal-header">
      <span class="label-tag ${rec.isMatch ? 'label-tag--green' : 'label-tag--pink'}">
        ${rec.isMatch ? 'AUTHENTIC PAIR' : 'FORGERY DETECTED'}
      </span>
      <h3 class="modal-title">FORENSIC ANALYSIS // ${rec.caseId}</h3>
      <p class="modal-desc">${rec.docName} — ${rec.docMeta}</p>
    </div>

    <div class="modal-grid">
      <div class="modal-card">
        <h4 class="modal-card-title">REFERENCE SIGNATURE</h4>
        <div class="modal-sig-box">
          <svg viewBox="0 0 160 40">${rec.sigRefSvg}</svg>
        </div>
      </div>

      <div class="modal-card">
        <h4 class="modal-card-title">SCAN SIGNATURE</h4>
        <div class="modal-sig-box">
          <svg viewBox="0 0 160 40">${rec.sigScanSvg}</svg>
        </div>
      </div>
    </div>

    <div class="modal-metrics-row">
      <div class="modal-stat">
        <span class="modal-stat__label">L1 DISTANCE</span>
        <span class="modal-stat__val">${rec.l1Distance}</span>
      </div>
      <div class="modal-stat">
        <span class="modal-stat__label">MARGIN TO CUTOFF</span>
        <span class="modal-stat__val">${rec.l1Margin}</span>
      </div>
      <div class="modal-stat">
        <span class="modal-stat__label">VERDICT CONFIDENCE</span>
        <span class="modal-stat__val">${rec.verdictScore}</span>
      </div>
    </div>

    <div class="modal-footer-action">
      <button class="btn btn--primary" id="btn-modal-close-act">CLOSE ANALYSIS</button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  body.querySelector('#btn-modal-close-act')?.addEventListener('click', closeModal);
}

function openApiKeysModal(): void {
  const modal = document.getElementById('dash-modal');
  const body = document.getElementById('dash-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="modal-header">
      <span class="label-tag label-tag--yellow">DEVELOPER ACCESS</span>
      <h3 class="modal-title">API KEYS & INTEGRATION</h3>
      <p class="modal-desc">Manage production and sandbox API keys for batch & live verification APIs.</p>
    </div>

    <div class="modal-card" style="margin-bottom: 1.5rem;">
      <h4 class="modal-card-title">PRODUCTION SECRET KEY</h4>
      <div class="api-key-box">
        <code>sv_live_8f9a2b7c4d1e6f0a3b5c7d9e</code>
        <button class="btn btn--secondary btn--xs" onclick="alert('Key copied to clipboard!')">COPY</button>
      </div>
    </div>

    <div class="modal-card">
      <h4 class="modal-card-title">SANDBOX TEST KEY</h4>
      <div class="api-key-box">
        <code>sv_test_1a2b3c4d5e6f7a8b9c0d1e2f</code>
        <button class="btn btn--secondary btn--xs" onclick="alert('Test key copied to clipboard!')">COPY</button>
      </div>
    </div>

    <div class="modal-footer-action" style="margin-top: 1.5rem;">
      <button class="btn btn--primary" id="btn-modal-close-act">DONE</button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  body.querySelector('#btn-modal-close-act')?.addEventListener('click', closeModal);
}

function closeModal(): void {
  const modal = document.getElementById('dash-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function showToast(msg: string): void {
  let toast = document.getElementById('dash-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dash-toast';
    toast.className = 'dash-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('dash-toast--show');
  setTimeout(() => {
    toast?.classList.remove('dash-toast--show');
  }, 3000);
}
