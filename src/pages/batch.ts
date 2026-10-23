/**
 * batch.ts
 * Batch Document Extraction page component in TypeScript.
 */

import { navigateTo } from '../router';

export function renderBatch(container: HTMLElement): void {
  window.scrollTo({ top: 0, behavior: 'instant' });

  container.innerHTML = `
    <div class="batch-page-wrapper">
      <!-- TopNavBar — same structure as verify page -->
      <header class="verify-header">
        <div class="verify-header__left">
          <a href="/" class="verify-header__brand" data-route="/">
            <span class="material-symbols-outlined verify-header__icon">verified_user</span>
            SureSign
          </a>
          <nav class="verify-header__nav">
            <a class="verify-header__link" href="/verify" data-route="/verify">Verify</a>
            <a class="verify-header__link active" href="/batch" data-route="/batch">Batch Mode</a>
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
      <main class="batch-main-container">
        <!-- Sidebar — same structure as verify page -->
        <aside class="verify-sidebar">
          <div class="verify-sidebar__header">
            <h2 class="verify-sidebar__title">
              <span class="material-symbols-outlined">tune</span>
              Admin Panel
            </h2>
            <p class="verify-sidebar__node">NODE // #01-ACTIVE</p>
          </div>

          <nav class="verify-sidebar__nav">
            <button class="sidebar-tab-btn" data-tab="overview">
              <span class="material-symbols-outlined">dashboard</span>
              Overview
            </button>
            <button class="sidebar-tab-btn active" data-tab="history">
              <span class="material-symbols-outlined">history</span>
              History
            </button>
            <button class="sidebar-tab-btn" data-tab="settings">
              <span class="material-symbols-outlined">settings</span>
              Settings
            </button>
            <button class="sidebar-tab-btn" data-tab="export">
              <span class="material-symbols-outlined">ios_share</span>
              Export
            </button>
          </nav>

          <button id="btn-batch-new" class="verify-btn-new">
            <span class="material-symbols-outlined">add</span>
            New Batch
          </button>
        </aside>

        <!-- Main Canvas Area -->
        <div class="batch-canvas">
          <!-- Page Header -->
          <div class="batch-canvas__header">
            <div>
              <h1 class="batch-canvas__title">Batch Extraction</h1>
              <p class="batch-canvas__desc">
                Drop scanned documents below to automatically identify, extract, and verify multiple signatures simultaneously using our neo-processing pipeline.
              </p>
            </div>
          </div>

          <!-- Document Upload Drop Zone -->
          <section class="batch-upload-section">
            <div id="batch-dropzone" class="batch-dashed-upload group">
              <input type="file" id="batch-file-input" accept=".pdf,image/*" class="hidden-input" />
              <div class="batch-upload-box group-hover:bg-yellow">
                <span class="material-symbols-outlined batch-upload-icon">document_scanner</span>
                <h2 class="batch-upload-heading">Drop Scanned Document</h2>
                <p class="batch-upload-sub font-mono">JPG, PNG, PDF // MAX 50MB</p>
              </div>
            </div>
          </section>

          <!-- Preprocessing Pipeline Strip -->
          <section class="pipeline-section">
            <div class="pipeline-tag">Live Pipeline</div>
            <h3 class="pipeline-title">Preprocessing Preview</h3>
            
            <div class="pipeline-steps-row">
              <!-- Step 1: Raw Input -->
              <div class="pipeline-step">
                <div class="pipeline-thumb-box">
                  <div class="pipeline-doc-preview pipeline-doc--raw">
                    <div class="doc-skeleton-line doc-line--w70"></div>
                    <div class="doc-skeleton-line doc-line--w90"></div>
                    <div class="doc-skeleton-line doc-line--w60"></div>
                    <img src="/sig1.png" class="pipeline-sig-faint" alt="Signature preview" />
                    <div class="doc-skeleton-line doc-line--w80"></div>
                    <img src="/sig2.png" class="pipeline-sig-faint pipeline-sig--right" alt="Signature preview" />
                  </div>
                </div>
                <div class="pipeline-step-badge">ORIGINAL</div>
                <div class="pipeline-step-sub font-mono">RAW INPUT</div>
              </div>

              <span class="material-symbols-outlined pipeline-arrow">arrow_forward</span>

              <!-- Step 2: Grayscale -->
              <div class="pipeline-step">
                <div class="pipeline-thumb-box">
                  <div class="pipeline-doc-preview pipeline-doc--gray">
                    <div class="doc-skeleton-line doc-line--w70"></div>
                    <div class="doc-skeleton-line doc-line--w90"></div>
                    <div class="doc-skeleton-line doc-line--w60"></div>
                    <img src="/sig1.png" class="pipeline-sig-faint" alt="Signature grayscale" />
                    <div class="doc-skeleton-line doc-line--w80"></div>
                    <img src="/sig2.png" class="pipeline-sig-faint pipeline-sig--right" alt="Signature grayscale" />
                  </div>
                </div>
                <div class="pipeline-step-badge">GRAYSCALE</div>
                <div class="pipeline-step-sub font-mono">LUMA MAP</div>
              </div>

              <span class="material-symbols-outlined pipeline-arrow">arrow_forward</span>

              <!-- Step 3: Gaussian Blur -->
              <div class="pipeline-step">
                <div class="pipeline-thumb-box">
                  <div class="pipeline-doc-preview pipeline-doc--blur">
                    <div class="doc-skeleton-line doc-line--w70"></div>
                    <div class="doc-skeleton-line doc-line--w90"></div>
                    <div class="doc-skeleton-line doc-line--w60"></div>
                    <img src="/sig1.png" class="pipeline-sig-faint" alt="Signature blur" />
                    <div class="doc-skeleton-line doc-line--w80"></div>
                    <img src="/sig2.png" class="pipeline-sig-faint pipeline-sig--right" alt="Signature blur" />
                  </div>
                </div>
                <div class="pipeline-step-badge">GAUSSIAN BLUR</div>
                <div class="pipeline-step-sub font-mono">NOISE REDUCTION</div>
              </div>

              <span class="material-symbols-outlined pipeline-arrow">arrow_forward</span>

              <!-- Step 4: Adaptive Threshold -->
              <div class="pipeline-step">
                <div class="pipeline-thumb-box">
                  <div class="pipeline-doc-preview pipeline-doc--binary">
                    <div class="doc-skeleton-line doc-line--w70"></div>
                    <div class="doc-skeleton-line doc-line--w90"></div>
                    <div class="doc-skeleton-line doc-line--w60"></div>
                    <img src="/sig1.png" class="pipeline-sig-faint" alt="Signature thresholded" />
                    <div class="doc-skeleton-line doc-line--w80"></div>
                    <img src="/sig2.png" class="pipeline-sig-faint pipeline-sig--right" alt="Signature thresholded" />
                  </div>
                </div>
                <div class="pipeline-step-badge pipeline-step-badge--accent">ADAPTIVE THRESHOLD</div>
                <div class="pipeline-step-sub font-mono">B/W BINARY</div>
              </div>
            </div>
          </section>

          <!-- Extracted Entities Results -->
          <section class="entities-section">
            <div class="entities-header">
              <h3 class="entities-title">Extracted Entities</h3>
              <div id="entities-count-badge" class="entities-count-badge font-mono">
                4 FOUND
              </div>
            </div>

            <div class="entities-grid">
              <!-- Card 1 -->
              <div class="entity-card" data-id="1">
                <div class="entity-card__header">
                  <span class="entity-card__name font-mono">Signature 1</span>
                  <input type="checkbox" class="brutal-checkbox" checked id="check-sig-1" />
                </div>
                <div class="entity-card__preview">
                  <img src="/sig1.png" alt="Signature 1" class="entity-sig-img" />
                </div>
                <div class="entity-card__footer">
                  <span class="font-mono text-xs">CONFIDENCE: 98%</span>
                  <span class="material-symbols-outlined text-yellow text-sm">verified</span>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="entity-card" data-id="2">
                <div class="entity-card__header">
                  <span class="entity-card__name font-mono">Signature 2</span>
                  <input type="checkbox" class="brutal-checkbox" checked id="check-sig-2" />
                </div>
                <div class="entity-card__preview">
                  <img src="/sig2.png" alt="Signature 2" class="entity-sig-img" />
                </div>
                <div class="entity-card__footer">
                  <span class="font-mono text-xs">CONFIDENCE: 94%</span>
                  <span class="material-symbols-outlined text-yellow text-sm">verified</span>
                </div>
              </div>

              <!-- Card 3 (Low Confidence / Flagged) -->
              <div class="entity-card entity-card--flagged" data-id="3">
                <div class="entity-card__header entity-card__header--pink">
                  <span class="entity-card__name font-mono">Signature 3</span>
                  <input type="checkbox" class="brutal-checkbox" id="check-sig-3" />
                </div>
                <div class="entity-card__preview">
                  <img src="/sig3.png" alt="Signature 3" class="entity-sig-img opacity-60" />
                  <div class="stamp-low-conf font-mono">LOW CONF.</div>
                </div>
                <div class="entity-card__footer">
                  <span class="font-mono text-xs text-pink">CONFIDENCE: 42%</span>
                  <span class="material-symbols-outlined text-red text-sm">warning</span>
                </div>
              </div>

              <!-- Card 4 -->
              <div class="entity-card" data-id="4">
                <div class="entity-card__header">
                  <span class="entity-card__name font-mono">Signature 4</span>
                  <input type="checkbox" class="brutal-checkbox" checked id="check-sig-4" />
                </div>
                <div class="entity-card__preview">
                  <img src="/sig4.png" alt="Signature 4" class="entity-sig-img" />
                </div>
                <div class="entity-card__footer">
                  <span class="font-mono text-xs">CONFIDENCE: 99%</span>
                  <span class="material-symbols-outlined text-yellow text-sm">verified</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="entities-action-row">
              <button id="btn-compare-selected" class="btn-compare-selected">
                <span>Compare Selected</span>
                <span class="material-symbols-outlined">arrow_forward_ios</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer verify-footer">
        <div class="footer__copy">© 2024 SURESIGN — ALL RIGHTS RESERVED</div>
        <div class="footer__links">
          <a href="/" class="footer__link" data-route="/">Home</a>
          <a href="/verify" class="footer__link" data-route="/verify">Verify</a>
          <a href="/#features" class="footer__link" data-route="/">Features</a>
          <a href="/#stats" class="footer__link" data-route="/">API Docs</a>
        </div>
      </footer>
    </div>
  `;

  attachBatchInteractions(container);
}

function attachBatchInteractions(container: HTMLElement): void {
  const dropzone = container.querySelector<HTMLElement>('#batch-dropzone')!;
  const fileInput = container.querySelector<HTMLInputElement>('#batch-file-input')!;
  const checkboxes = container.querySelectorAll<HTMLInputElement>('.brutal-checkbox');
  const countBadge = container.querySelector<HTMLElement>('#entities-count-badge')!;
  const btnCompareSelected = container.querySelector<HTMLButtonElement>('#btn-compare-selected')!;
  const btnNew = container.querySelector<HTMLButtonElement>('#btn-batch-new')!;

  const entitiesGrid = container.querySelector<HTMLElement>('.entities-grid')!;

  // Click dropzone to trigger input
  dropzone.addEventListener('click', () => fileInput.click());

  // Drag & drop highlight
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processDocument(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      processDocument(fileInput.files[0]);
    }
  });

  async function processDocument(file: File) {
    countBadge.textContent = 'EXTRACTING VIA OPENCV...';
    countBadge.style.backgroundColor = '#FF3D68';
    countBadge.style.color = '#fff';

    try {
      const fd = new FormData();
      fd.append('document_file', file);

      const resp = await fetch('/api/extract', {
        method: 'POST',
        body: fd
      });

      if (!resp.ok) {
        throw new Error(`Extraction HTTP ${resp.status}`);
      }

      const json = await resp.json();

      if (json.signatures && json.signatures.length > 0) {
        countBadge.textContent = `${json.signatures.length} FOUND (${json.freehand_count} FREEHAND, ${json.boxed_count} BOXED)`;
        entitiesGrid.innerHTML = json.signatures.map((sig: any, index: number) => `
          <div class="entity-card" data-id="${sig.id}">
            <div class="entity-card__header ${sig.type === 'boxed' ? 'entity-card__header--pink' : ''}">
              <span class="entity-card__name font-mono">${sig.type.toUpperCase()} #${index + 1}</span>
              <input type="checkbox" class="brutal-checkbox" checked id="check-${sig.id}" data-b64="${sig.image_base64}" />
            </div>
            <div class="entity-card__preview">
              <img src="${sig.image_base64}" alt="${sig.id}" class="entity-sig-img" />
            </div>
            <div class="entity-card__footer">
              <span class="font-mono text-xs">DIM: ${sig.bbox.width}x${sig.bbox.height}px</span>
              <span class="material-symbols-outlined text-yellow text-sm">verified</span>
            </div>
          </div>
        `).join('');

        // Reattach listeners
        reattachCheckboxes();
      } else {
        countBadge.textContent = '0 SIGNATURES DETECTED';
        entitiesGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 2.5rem; background: #fff; border: 2px dashed #000; text-align: center;">
            <span class="material-symbols-outlined" style="font-size: 3rem; color: #dc2626;">search_off</span>
            <p style="font-family: var(--ff-mono); font-size: 1.1rem; font-weight: 700; margin-top: 0.5rem;">NO SIGNATURES IDENTIFIED IN THIS REGION</p>
            <p style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">Try uploading a clearer scan or full page document.</p>
          </div>
        `;
      }
    } catch (err) {
      console.warn('Document extraction fallback:', err);
      countBadge.textContent = '4 FOUND // SIMULATED';
    } finally {
      countBadge.style.backgroundColor = '#FFE234';
      countBadge.style.color = '#1c1c16';
    }
  }

  function reattachCheckboxes() {
    const activeCheckboxes = container.querySelectorAll<HTMLInputElement>('.brutal-checkbox');
    activeCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        let checked = 0;
        activeCheckboxes.forEach(c => { if (c.checked) checked++; });
        countBadge.textContent = `${checked} SELECTED / ${activeCheckboxes.length} TOTAL`;
      });
    });
  }

  // Update selected count initially
  function updateCount() {
    let checkedCount = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });
    countBadge.textContent = `${checkedCount} SELECTED / 4 FOUND`;
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', updateCount);
  });

  // Action button - takes selected signature to verify page
  btnCompareSelected.addEventListener('click', () => {
    btnCompareSelected.innerHTML = `
      <span class="material-symbols-outlined spin-icon">progress_activity</span>
      <span>LOADING TO VERIFY...</span>
    `;

    const checked = container.querySelector<HTMLInputElement>('.brutal-checkbox:checked');
    if (checked && checked.dataset.b64) {
      sessionStorage.setItem('suresign_target_preview', checked.dataset.b64);
    }

    setTimeout(() => {
      navigateTo('/verify');
    }, 350);
  });

  // New Analysis button resets selection
  btnNew.addEventListener('click', () => {
    fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  updateCount();
}
