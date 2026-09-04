/**
 * verify.ts
 * Upload and Compare Signatures page component in TypeScript.
 */

import { navigateTo } from '../router';

export function renderVerify(container: HTMLElement): void {
  window.scrollTo({ top: 0, behavior: 'instant' });

  container.innerHTML = `
    <div class="verify-page-wrapper">
      <!-- TopNavBar -->
      <header class="verify-header">
        <div class="verify-header__left">
          <a href="/" class="verify-header__brand" data-route="/">
            <span class="material-symbols-outlined verify-header__icon">verified_user</span>
            SignVerify AI
          </a>
          <nav class="verify-header__nav">
            <a class="verify-header__link active" href="/verify" data-route="/verify">Verify</a>
            <a class="verify-header__link" href="/batch" data-route="/batch">Batch Mode</a>
            <a class="verify-header__link" href="/#stats" data-route="/">Dashboard</a>
          </nav>
        </div>
        <div class="verify-header__right">
          <a href="/" class="verify-btn-home" data-route="/">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Back Home
          </a>
          <button class="verify-header__account" aria-label="Account">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_circle</span>
          </button>
        </div>
      </header>

      <!-- Main Layout -->
      <main class="verify-main-container">
        <!-- Side Admin Panel -->
        <aside class="verify-sidebar">
          <div class="verify-sidebar__header">
            <h2 class="verify-sidebar__title">
              <span class="material-symbols-outlined">tune</span>
              Admin Panel
            </h2>
            <p class="verify-sidebar__node">NODE // #01-ACTIVE</p>
          </div>

          <nav class="verify-sidebar__nav">
            <button class="sidebar-tab-btn active" data-tab="overview">
              <span class="material-symbols-outlined">dashboard</span>
              Overview
            </button>
            <button class="sidebar-tab-btn" data-tab="history">
              <span class="material-symbols-outlined">history</span>
              Recent History
            </button>
            <button class="sidebar-tab-btn" data-tab="settings">
              <span class="material-symbols-outlined">settings</span>
              Model Config
            </button>
            <button class="sidebar-tab-btn" data-tab="export">
              <span class="material-symbols-outlined">ios_share</span>
              Export Reports
            </button>
          </nav>

          <button id="btn-new-analysis" class="verify-btn-new">
            <span class="material-symbols-outlined">restart_alt</span>
            New Analysis
          </button>
        </aside>

        <!-- Main Workspace -->
        <section class="verify-workspace">
          <!-- Page Header & Mode Toggle -->
          <div class="workspace-header">
            <div>
              <div class="workspace-badge">
                <span class="material-symbols-outlined">security</span>
                <h1>Verify Signatures</h1>
              </div>
              <p class="workspace-desc">Upload reference and target to analyze authenticity with CNN Siamese network.</p>
            </div>

            <div class="mode-toggle-group">
              <button id="tab-compare" class="mode-toggle-btn active">Compare Two Images</button>
              <button id="tab-extract" class="mode-toggle-btn" data-route="/batch">Extract From Document</button>
            </div>
          </div>

          <!-- Quick Load Preset Toolbar -->
          <div class="preset-toolbar">
            <div class="preset-toolbar__label">
              <span class="material-symbols-outlined">lightbulb</span>
              <span>QUICK LOAD SAMPLE CASES:</span>
            </div>
            <div class="preset-toolbar__actions">
              <button id="btn-load-match" class="preset-btn">
                <span class="material-symbols-outlined text-green">check</span> Sample Genuine Pair
              </button>
              <button id="btn-load-forgery" class="preset-btn">
                <span class="material-symbols-outlined text-red">warning</span> Sample Forged Pair
              </button>
              <button id="btn-clear-all" class="preset-btn preset-btn--yellow">
                Clear Both
              </button>
            </div>
          </div>

          <!-- Upload Zones -->
          <div class="upload-zones-grid">
            <!-- Reference Zone -->
            <div class="zone-col">
              <div class="zone-header">
                <h3 class="zone-badge zone-badge--ref">
                  <span class="material-symbols-outlined">verified</span>
                  REFERENCE SIGNATURE (ORIGINAL)
                </h3>
                <span id="ref-status-badge" class="zone-status-badge ready hidden">READY</span>
              </div>

              <div id="dropzone-ref" class="upload-dropzone group">
                <input type="file" id="file-ref" accept="image/*" class="hidden-input" />

                <!-- Empty state -->
                <div id="placeholder-ref" class="dropzone-empty">
                  <div class="dropzone-icon-circle">
                    <span class="material-symbols-outlined">upload_file</span>
                  </div>
                  <p class="dropzone-title">DROP FILE OR CLICK TO BROWSE</p>
                  <p class="dropzone-sub">JPG, PNG, WEBP (Max 5MB)</p>
                  <span class="dropzone-cta-badge">Select Reference Image</span>
                </div>

                <!-- Preview state -->
                <div id="preview-box-ref" class="dropzone-preview hidden">
                  <div class="preview-header">
                    <div class="preview-meta">
                      <span class="material-symbols-outlined text-green">check_circle</span>
                      <span id="ref-filename" class="preview-filename">ref_signature_01.png</span>
                    </div>
                    <button id="btn-remove-ref" title="Remove signature" class="btn-remove-sig">
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div class="preview-img-container">
                    <img id="img-preview-ref" class="preview-img" src="" alt="Reference Signature" />
                  </div>
                  <div class="preview-footer">
                    <span>FORMAT: IMAGE/PNG</span>
                    <span class="text-green">BASELINE EMBEDDED</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Target Zone -->
            <div class="zone-col">
              <div class="zone-header">
                <h3 class="zone-badge zone-badge--target">
                  <span class="material-symbols-outlined">help</span>
                  SIGNATURE TO VERIFY (TARGET)
                </h3>
                <span id="target-status-badge" class="zone-status-badge ready hidden">READY</span>
              </div>

              <div id="dropzone-target" class="upload-dropzone group">
                <input type="file" id="file-target" accept="image/*" class="hidden-input" />

                <!-- Empty state -->
                <div id="placeholder-target" class="dropzone-empty">
                  <div class="dropzone-icon-circle">
                    <span class="material-symbols-outlined">upload_file</span>
                  </div>
                  <p class="dropzone-title">DROP FILE OR CLICK TO BROWSE</p>
                  <p class="dropzone-sub">JPG, PNG, WEBP (Max 5MB)</p>
                  <span class="dropzone-cta-badge">Select Target Image</span>
                </div>

                <!-- Preview state -->
                <div id="preview-box-target" class="dropzone-preview hidden">
                  <div class="preview-header">
                    <div class="preview-meta">
                      <span class="material-symbols-outlined text-blue">visibility</span>
                      <span id="target-filename" class="preview-filename">scanned_target_sig.png</span>
                    </div>
                    <button id="btn-remove-target" title="Remove signature" class="btn-remove-sig">
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div class="preview-img-container">
                    <img id="img-preview-target" class="preview-img" src="" alt="Target Signature" />
                    <div id="scan-line-target" class="scan-beam hidden"></div>
                  </div>
                  <div class="preview-footer">
                    <span>FORMAT: IMAGE/PNG</span>
                    <span class="text-blue">READY FOR INFERENCE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action -->
          <div class="verify-action-row">
            <div class="verify-model-indicator">
              <span class="pulse-dot"></span>
              <span>SYSTEM READY // MODEL: SIAMESE-RESNET50-V2</span>
            </div>

            <button id="btn-run-verify" class="btn-run-verification">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">bolt</span>
              RUN VERIFICATION
            </button>
          </div>

          <!-- Analysis Result Section -->
          <div id="result-container" class="verification-report hidden">
            <div class="report-header">
              <div>
                <span class="report-id-tag">ANALYSIS REPORT #SV-8924</span>
                <h2 class="report-main-title">VERIFICATION COMPLETE</h2>
              </div>
              <div id="verdict-pill" class="verdict-pill verdict-pill--genuine">
                GENUINE MATCH
              </div>
            </div>

            <div class="report-metrics-grid">
              <div class="metric-card">
                <span class="metric-label">CONFIDENCE SCORE</span>
                <span id="metric-confidence" class="metric-value">94.8%</span>
                <div class="metric-progress-track">
                  <div id="metric-bar" class="metric-progress-fill"></div>
                </div>
              </div>

              <div class="metric-card">
                <span class="metric-label">L1 DISTANCE</span>
                <span id="metric-distance" class="metric-value">0.142</span>
                <p class="metric-note">Threshold: &lt; 0.45</p>
              </div>

              <div class="metric-card">
                <span class="metric-label">STROKE CORRELATION</span>
                <span id="metric-stroke" class="metric-value">HIGH (98%)</span>
                <p class="metric-note">Curvature &amp; loop matches</p>
              </div>
            </div>

            <div class="report-footer-actions">
              <button id="btn-print-report" class="preset-btn">
                <span class="material-symbols-outlined">print</span> Print Report
              </button>
              <button id="btn-retest" class="preset-btn preset-btn--yellow">
                <span class="material-symbols-outlined">refresh</span> Run Another Check
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer__copy">© 2024 SIGNVERIFY AI — ALL RIGHTS RESERVED</div>
        <div class="footer__links">
          <a href="/" class="footer__link" data-route="/">Home</a>
          <a href="/#features" class="footer__link" data-route="/">Features</a>
          <a href="/#stats" class="footer__link" data-route="/">Model API</a>
          <a href="#" class="footer__link">Privacy</a>
        </div>
      </footer>
    </div>
  `;

  // Attach all interactive logic
  attachVerifyLogic(container);
}

function attachVerifyLogic(container: HTMLElement): void {
  const dropzoneRef = container.querySelector<HTMLElement>('#dropzone-ref')!;
  const dropzoneTarget = container.querySelector<HTMLElement>('#dropzone-target')!;
  const fileRef = container.querySelector<HTMLInputElement>('#file-ref')!;
  const fileTarget = container.querySelector<HTMLInputElement>('#file-target')!;

  const placeholderRef = container.querySelector<HTMLElement>('#placeholder-ref')!;
  const previewBoxRef = container.querySelector<HTMLElement>('#preview-box-ref')!;
  const imgPreviewRef = container.querySelector<HTMLImageElement>('#img-preview-ref')!;
  const refFilename = container.querySelector<HTMLElement>('#ref-filename')!;
  const btnRemoveRef = container.querySelector<HTMLButtonElement>('#btn-remove-ref')!;
  const refStatusBadge = container.querySelector<HTMLElement>('#ref-status-badge')!;

  const placeholderTarget = container.querySelector<HTMLElement>('#placeholder-target')!;
  const previewBoxTarget = container.querySelector<HTMLElement>('#preview-box-target')!;
  const imgPreviewTarget = container.querySelector<HTMLImageElement>('#img-preview-target')!;
  const targetFilename = container.querySelector<HTMLElement>('#target-filename')!;
  const btnRemoveTarget = container.querySelector<HTMLButtonElement>('#btn-remove-target')!;
  const targetStatusBadge = container.querySelector<HTMLElement>('#target-status-badge')!;
  const scanLineTarget = container.querySelector<HTMLElement>('#scan-line-target')!;

  const btnRunVerify = container.querySelector<HTMLButtonElement>('#btn-run-verify')!;
  const resultContainer = container.querySelector<HTMLElement>('#result-container')!;
  const verdictPill = container.querySelector<HTMLElement>('#verdict-pill')!;
  const metricConfidence = container.querySelector<HTMLElement>('#metric-confidence')!;
  const metricBar = container.querySelector<HTMLElement>('#metric-bar')!;
  const metricDistance = container.querySelector<HTMLElement>('#metric-distance')!;
  const metricStroke = container.querySelector<HTMLElement>('#metric-stroke')!;
  const btnRetest = container.querySelector<HTMLButtonElement>('#btn-retest')!;
  const btnPrint = container.querySelector<HTMLButtonElement>('#btn-print-report')!;

  const btnLoadMatch = container.querySelector<HTMLButtonElement>('#btn-load-match')!;
  const btnLoadForgery = container.querySelector<HTMLButtonElement>('#btn-load-forgery')!;
  const btnClearAll = container.querySelector<HTMLButtonElement>('#btn-clear-all')!;
  const btnNewAnalysis = container.querySelector<HTMLButtonElement>('#btn-new-analysis')!;

  let currentRefSrc = '';
  let currentTargetSrc = '';
  let currentMode: 'genuine' | 'forged' = 'forged';

  // Dropzone click triggers
  dropzoneRef.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('#btn-remove-ref')) return;
    if (!currentRefSrc) fileRef.click();
  });

  dropzoneTarget.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('#btn-remove-target')) return;
    if (!currentTargetSrc) fileTarget.click();
  });

  // File pickers
  fileRef.addEventListener('change', (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setRefImage(evt.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  fileTarget.addEventListener('change', (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setTargetImage(evt.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Drag & drop
  const setupDragAndDrop = (dropzone: HTMLElement, onDropFile: (file: File) => void) => {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onDropFile(file);
      }
    });
  };

  setupDragAndDrop(dropzoneRef, (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setRefImage(evt.target.result as string, file.name);
    };
    reader.readAsDataURL(file);
  });

  setupDragAndDrop(dropzoneTarget, (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setTargetImage(evt.target.result as string, file.name);
    };
    reader.readAsDataURL(file);
  });

  function setRefImage(src: string, name = 'reference_signature.png') {
    currentRefSrc = src;
    imgPreviewRef.src = src;
    refFilename.textContent = name;
    placeholderRef.classList.add('hidden');
    previewBoxRef.classList.remove('hidden');
    refStatusBadge.classList.remove('hidden');
    resultContainer.classList.add('hidden');
  }

  function removeRefImage(e?: Event) {
    if (e) e.stopPropagation();
    currentRefSrc = '';
    imgPreviewRef.src = '';
    fileRef.value = '';
    placeholderRef.classList.remove('hidden');
    previewBoxRef.classList.add('hidden');
    refStatusBadge.classList.add('hidden');
    resultContainer.classList.add('hidden');
  }

  function setTargetImage(src: string, name = 'target_signature.png') {
    currentTargetSrc = src;
    imgPreviewTarget.src = src;
    targetFilename.textContent = name;
    placeholderTarget.classList.add('hidden');
    previewBoxTarget.classList.remove('hidden');
    targetStatusBadge.classList.remove('hidden');
    resultContainer.classList.add('hidden');
  }

  function removeTargetImage(e?: Event) {
    if (e) e.stopPropagation();
    currentTargetSrc = '';
    imgPreviewTarget.src = '';
    fileTarget.value = '';
    placeholderTarget.classList.remove('hidden');
    previewBoxTarget.classList.add('hidden');
    targetStatusBadge.classList.add('hidden');
    resultContainer.classList.add('hidden');
  }

  btnRemoveRef.addEventListener('click', removeRefImage);
  btnRemoveTarget.addEventListener('click', removeTargetImage);

  // Preset Buttons
  btnLoadMatch.addEventListener('click', () => {
    setRefImage('/sig1.png', 'authentic_ref_meelah.png');
    setTargetImage('/sig1.png', 'secondary_check_meelah.png');
    currentMode = 'genuine';
  });

  btnLoadForgery.addEventListener('click', () => {
    setRefImage('/sig1.png', 'authentic_ref_meelah.png');
    setTargetImage('/sig2.png', 'questionable_scan_lee.png');
    currentMode = 'forged';
  });

  function clearAll() {
    removeRefImage();
    removeTargetImage();
    resultContainer.classList.add('hidden');
  }

  btnClearAll.addEventListener('click', clearAll);
  btnNewAnalysis.addEventListener('click', () => {
    clearAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnRetest.addEventListener('click', () => {
    resultContainer.classList.add('hidden');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  });

  btnPrint?.addEventListener('click', () => window.print());

  // Run Verification inference simulation
  btnRunVerify.addEventListener('click', () => {
    if (!currentRefSrc || !currentTargetSrc) {
      setRefImage('/sig1.png', 'sample_ref_sig1.png');
      setTargetImage('/sig2.png', 'sample_target_sig2.png');
      currentMode = 'forged';
    }

    scanLineTarget.classList.remove('hidden');
    btnRunVerify.disabled = true;
    btnRunVerify.innerHTML = `
      <span class="material-symbols-outlined spin-icon">progress_activity</span>
      NEURAL INFERENCE...
    `;

    setTimeout(() => {
      scanLineTarget.classList.add('hidden');
      btnRunVerify.disabled = false;
      btnRunVerify.innerHTML = `
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">bolt</span>
        RUN VERIFICATION
      `;

      const isMatch = (currentRefSrc === currentTargetSrc) || currentMode === 'genuine';

      if (isMatch) {
        verdictPill.textContent = 'GENUINE MATCH';
        verdictPill.className = 'verdict-pill verdict-pill--genuine';
        metricConfidence.textContent = '96.4%';
        metricConfidence.style.color = '#15803d';
        metricBar.style.width = '96.4%';
        metricBar.style.backgroundColor = '#16a34a';
        metricDistance.textContent = '0.082';
        metricStroke.textContent = 'STRONG (97%)';
      } else {
        verdictPill.textContent = 'FORGED / MISMATCH';
        verdictPill.className = 'verdict-pill verdict-pill--forged';
        metricConfidence.textContent = '31.2%';
        metricConfidence.style.color = '#dc2626';
        metricBar.style.width = '31.2%';
        metricBar.style.backgroundColor = '#dc2626';
        metricDistance.textContent = '0.864';
        metricStroke.textContent = 'DIVERGENT (22%)';
      }

      resultContainer.classList.remove('hidden');
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1200);
  });

  // Prepopulate with default pair for instant preview
  setRefImage('/sig1.png', 'ref_sig_2023.jpg');
  setTargetImage('/sig2.png', 'scanned_doc_sig.png');
  currentMode = 'forged';

  // Mode toggles
  const tabCompare = container.querySelector<HTMLElement>('#tab-compare');
  const tabExtract = container.querySelector<HTMLElement>('#tab-extract');
  tabCompare?.addEventListener('click', () => {
    tabCompare.classList.add('active');
    tabExtract?.classList.remove('active');
  });
  tabExtract?.addEventListener('click', () => {
    navigateTo('/batch');
  });
}
