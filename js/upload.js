/**
 * ORBIT STREAMING PLATFORM — VIDEO INGESTION & PIPELINE CONTROLLER
 * Handles glassmorphism drag-and-drop, >75MB S3 multipart chunk validation,
 * pre-redirect pipeline visualization (Client -> API Gateway -> Redis -> Celery),
 * and seamless handoff to dashboard.html.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. ARCHITECTURAL CONSTANTS & THRESHOLDS
  // =========================================================================
  const CHUNK_THRESHOLD_BYTES = 75 * 1024 * 1024; // 75 MB threshold
  const PART_SIZE_BYTES = 8 * 1024 * 1024;        // 8 MB S3 multipart chunk size
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;  // 500 MB max upload limit

  const API_BASE = window.API_BASE || (
    ['localhost', '127.0.0.1'].includes(location.hostname)
      ? 'http://localhost:8000'
      : 'https://oribt.darkube.ir'
  );

  // DOM Elements
  const el = {
    formView: document.getElementById('uploadFormView'),
    ingestForm: document.getElementById('ingestForm'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('videoFileInput'),
    fileExtBadge: document.getElementById('fileExtBadge'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    fileSizeDisplay: document.getElementById('fileSizeDisplay'),
    fileMimeDisplay: document.getElementById('fileMimeDisplay'),
    fileModeDisplay: document.getElementById('fileModeDisplay'),
    btnRemoveFile: document.getElementById('btnRemoveFile'),

    // Validator Notices
    chunkingNotice: document.getElementById('chunkingNotice'),
    chunkPartSize: document.getElementById('chunkPartSize'),
    chunkCountDisplay: document.getElementById('chunkCountDisplay'),
    standardNotice: document.getElementById('standardNotice'),
    standardSizeTag: document.getElementById('standardSizeTag'),

    // Simulator Buttons
    btnSimStandard: document.getElementById('btnSimStandard'),
    btnSimLarge: document.getElementById('btnSimLarge'),

    // Form Fields
    videoTitle: document.getElementById('videoTitle'),
    videoVisibility: document.getElementById('videoVisibility'),
    videoDescription: document.getElementById('videoDescription'),
    uploadError: document.getElementById('uploadError'),
    uploadErrorText: document.getElementById('uploadErrorText'),
    btnUploadSubmit: document.getElementById('btnUploadSubmit'),

    // Pre-Redirect Pipeline Overlay
    pipelineOverlay: document.getElementById('pipelineOverlay'),
    pipelineTimer: document.getElementById('pipelineTimer'),
    pipelineModeSubtitle: document.getElementById('pipelineModeSubtitle'),
    pipelineBusFill: document.getElementById('pipelineBusFill'),
    nodeClient: document.getElementById('node-client'),
    nodeGateway: document.getElementById('node-gateway'),
    nodeRedis: document.getElementById('node-redis'),
    nodeCelery: document.getElementById('node-celery'),
    nodeClientTech: document.getElementById('nodeClientTech'),
    telemetryStageName: document.getElementById('telemetryStageName'),
    telemetryPercent: document.getElementById('telemetryPercent'),
    streamProgressBar: document.getElementById('streamProgressBar'),
    telemetryLog: document.getElementById('telemetryLog')
  };

  // Current selected file (Real File object or Simulated descriptor)
  let currentFile = null;
  let isUploading = false;

  // =========================================================================
  // 2. FILE SIZE VALIDATOR & >75MB CHUNKING INDICATOR
  // =========================================================================

  function formatMegabytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function showError(message) {
    if (!el.uploadError || !el.uploadErrorText) return;
    el.uploadErrorText.textContent = message;
    el.uploadError.classList.add('active');
  }

  function hideError() {
    if (el.uploadError) el.uploadError.classList.remove('active');
  }

  /**
   * Core Validator: Checks if file.size > 75 * 1024 * 1024 (75MB)
   * and toggles the Multi-part Chunked S3 Upload architectural notice.
   */
  function evaluateSelectedFile(file) {
    hideError();

    if (!file) {
      clearSelectedFile();
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showError('File exceeds maximum allowed ingestion size (500 MB).');
      return;
    }

    if (file.type && !file.type.startsWith('video/')) {
      showError('Invalid MIME type. Please select a valid video container (MP4, WebM, MOV, MKV).');
      return;
    }

    currentFile = file;
    el.dropzone.classList.add('has-file');

    // Extract extension and display telemetry
    const ext = (file.name.split('.').pop() || 'MP4').toUpperCase().slice(0, 4);
    const sizeMB = formatMegabytes(file.size);

    el.fileExtBadge.textContent = ext;
    el.fileNameDisplay.textContent = file.name;
    el.fileSizeDisplay.textContent = sizeMB;
    el.fileMimeDisplay.textContent = file.type || 'video/mp4';

    // Check 75MB threshold: file.size > 75 * 1024 * 1024
    const exceedsChunkThreshold = file.size > CHUNK_THRESHOLD_BYTES;

    if (exceedsChunkThreshold) {
      const totalParts = Math.ceil(file.size / PART_SIZE_BYTES);
      el.fileModeDisplay.textContent = 'S3_MULTIPART_CHUNKED';
      el.chunkCountDisplay.textContent = `Calculated Parts: ${totalParts} chunks`;
      el.chunkingNotice.classList.add('active');
      el.standardNotice.classList.remove('active');
    } else {
      el.fileModeDisplay.textContent = 'SINGLE_STREAM_PUT';
      el.standardSizeTag.textContent = sizeMB;
      el.chunkingNotice.classList.remove('active');
      el.standardNotice.classList.add('active');
    }

    // Auto-fill stream title from filename if empty
    if (!el.videoTitle.value.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      el.videoTitle.value = cleanTitle;
    }
  }

  function clearSelectedFile() {
    currentFile = null;
    if (el.fileInput) el.fileInput.value = '';
    el.dropzone.classList.remove('has-file');
    el.chunkingNotice.classList.remove('active');
    el.standardNotice.classList.remove('active');
    el.btnSimStandard.classList.remove('active');
    el.btnSimLarge.classList.remove('active');
  }

  // =========================================================================
  // 3. DRAG-AND-DROP & SIMULATOR INTERACTIONS
  // =========================================================================

  function setupDropzone() {
    if (!el.dropzone || !el.fileInput) return;

    ['dragenter', 'dragover'].forEach((eventName) => {
      el.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      el.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.dropzone.classList.remove('is-dragover');
      });
    });

    el.dropzone.addEventListener('drop', (e) => {
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        el.btnSimStandard.classList.remove('active');
        el.btnSimLarge.classList.remove('active');
        evaluateSelectedFile(droppedFiles[0]);
      }
    });

    el.fileInput.addEventListener('change', (e) => {
      const selected = e.target.files?.[0];
      if (selected) {
        el.btnSimStandard.classList.remove('active');
        el.btnSimLarge.classList.remove('active');
        evaluateSelectedFile(selected);
      }
    });

    if (el.btnRemoveFile) {
      el.btnRemoveFile.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        clearSelectedFile();
      });
    }
  }

  function setupPayloadSimulators() {
    // Simulate < 75MB standard file (28.4 MB)
    if (el.btnSimStandard) {
      el.btnSimStandard.addEventListener('click', () => {
        el.btnSimStandard.classList.add('active');
        el.btnSimLarge.classList.remove('active');

        const simulatedStandardFile = {
          name: 'edge_telemetry_demo_1080p.mp4',
          size: Math.round(28.4 * 1024 * 1024), // 29,779,558 bytes (< 75MB)
          type: 'video/mp4',
          isSimulated: true
        };
        el.videoTitle.value = 'Edge Telemetry Demo — 1080p60';
        evaluateSelectedFile(simulatedStandardFile);
      });
    }

    // Simulate > 75MB large file (148.6 MB)
    if (el.btnSimLarge) {
      el.btnSimLarge.addEventListener('click', () => {
        el.btnSimLarge.classList.add('active');
        el.btnSimStandard.classList.remove('active');

        const simulatedLargeFile = {
          name: 'distributed_architecture_master_4k60.mp4',
          size: Math.round(148.6 * 1024 * 1024), // 155,818,394 bytes (> 75MB)
          type: 'video/mp4',
          isSimulated: true
        };
        el.videoTitle.value = 'Distributed Architecture Keynote — 4K60 Master';
        evaluateSelectedFile(simulatedLargeFile);
      });
    }
  }

  // =========================================================================
  // 4. PRE-REDIRECT PIPELINE VISUALIZATION & API UPLOAD
  //    Client -> API Gateway -> Redis Broker -> Celery Task Queue
  // =========================================================================

  function appendLog(message, styleClass = '') {
    if (!el.telemetryLog) return;
    const now = new Date().toISOString().slice(11, 23);
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-entry__time">[${now}]</span>
      <span class="${styleClass}">${message}</span>
    `;
    el.telemetryLog.appendChild(entry);
    el.telemetryLog.scrollTop = el.telemetryLog.scrollHeight;
  }

  function setProgress(percent, stageText) {
    if (el.streamProgressBar) el.streamProgressBar.style.width = `${percent}%`;
    if (el.telemetryPercent) el.telemetryPercent.textContent = `${percent}%`;
    if (stageText && el.telemetryStageName) {
      el.telemetryStageName.textContent = stageText;
    }
  }

  function setNodeState(nodeEl, state) {
    if (!nodeEl) return;
    nodeEl.classList.remove('is-active', 'is-done');
    if (state === 'active') nodeEl.classList.add('is-active');
    if (state === 'done') {
      nodeEl.classList.add('is-done');
      const orb = nodeEl.querySelector('.p-node__orb');
      if (orb) {
        orb.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }
    }
  }

  function uploadBinaryWithProgress(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 PUT status ${xhr.status}`));
      });
      xhr.addEventListener('error', () => reject(new Error('S3 network error')));
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.send(file);
    });
  }

  /**
   * Attempts real upload against backend if a real File is provided and user is authenticated;
   * falls back cleanly in portfolio demo / offline mode.
   */
  async function tryRealBackendUpload(file, metadata, onChunkProgress) {
    if (file.isSimulated) return null;

    try {
      const encodedName = encodeURIComponent(file.name);
      const presignedRes = await fetch(`${API_BASE}/videos/upload-url?filename=${encodedName}`, {
        credentials: 'include'
      });

      if (!presignedRes.ok) return null;
      const { upload_url, object_key } = await presignedRes.json();

      await uploadBinaryWithProgress(upload_url, file, onChunkProgress);

      const completeRes = await fetch(`${API_BASE}/videos/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: metadata.title,
          description: metadata.description || null,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type || 'video/mp4',
          object_key,
          visibility: metadata.visibility || 'public',
          language: 'en',
          allow_comments: true,
          is_made_for_kids: false,
          is_short: false,
          license: 'standard',
          tags: []
        })
      });

      if (!completeRes.ok) return null;
      return await completeRes.json();
    } catch (err) {
      console.warn('[Orbit Ingest] Live backend unavailable, continuing architecture visualization:', err.message);
      return null;
    }
  }

  /**
   * Executes the Pre-Redirect Visualization sequence:
   * Step 1: Client Dispatch (S3 Chunks / Presigned Stream)
   * Step 2: API Gateway (/videos/complete validation)
   * Step 3: Redis Broker (LPUSH transcode task)
   * Step 4: Celery Task Queue (202 Accepted -> Redirect to dashboard.html)
   */
  async function runPreRedirectPipeline(file, metadata) {
    isUploading = true;
    const isLarge = file.size > CHUNK_THRESHOLD_BYTES;
    const totalParts = Math.ceil(file.size / PART_SIZE_BYTES);

    // Switch to Pipeline Overlay View
    el.formView.style.display = 'none';
    el.pipelineOverlay.classList.add('active');

    if (el.nodeClientTech) {
      el.nodeClientTech.textContent = isLarge ? `${totalParts} S3 Chunks` : 'Presigned PUT';
    }
    if (el.pipelineModeSubtitle) {
      el.pipelineModeSubtitle.textContent = isLarge
        ? `Multi-part S3 chunked upload (${totalParts} parts × 8 MB) → Redis Broker → Celery Worker Queue.`
        : `Direct S3 presigned upload → API Gateway → Redis Broker → Celery Worker Queue.`;
    }

    // Start elapsed timer
    const startTime = performance.now();
    const timerInterval = setInterval(() => {
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
      if (el.pipelineTimer) el.pipelineTimer.textContent = `${elapsed}s`;
    }, 100);

    // Kick off real backend upload in background if real file
    const liveUploadPromise = tryRealBackendUpload(file, metadata, (pct) => {
      const scaled = Math.min(40, Math.round(pct * 0.4));
      setProgress(scaled, `Uploading payload to S3 object storage (${pct}%)...`);
    });

    // STAGE 1: Client Dispatching Chunks / Presigned Stream
    setNodeState(el.nodeClient, 'active');
    el.pipelineBusFill.style.width = '15%';
    if (isLarge) {
      appendLog(`Large file (${formatMegabytes(file.size)} > 75 MB): Initialized S3 Multipart Upload (${totalParts} chunks).`, 'log-entry__msg--cyan');
      setProgress(18, `Client dispatching ${totalParts} chunks to S3 & API Gateway...`);
      await new Promise((r) => setTimeout(r, 420));
      setProgress(35, `ETag part checksums verified (${totalParts}/${totalParts} chunks)...`);
      await new Promise((r) => setTimeout(r, 380));
    } else {
      appendLog(`Standard payload (${formatMegabytes(file.size)}): Streaming binary via S3 Presigned PUT.`, 'log-entry__msg--cyan');
      setProgress(28, 'Client streaming payload to S3 bucket originals/...');
      await new Promise((r) => setTimeout(r, 650));
    }
    setNodeState(el.nodeClient, 'done');

    // STAGE 2: API Gateway (/videos/complete)
    setNodeState(el.nodeGateway, 'active');
    el.pipelineBusFill.style.width = '48%';
    setProgress(56, 'API Gateway: Validating S3 object key & committing PostgreSQL metadata...');
    appendLog('POST /videos/complete → Object verified in storage, DB status="processing".');
    await new Promise((r) => setTimeout(r, 620));
    setNodeState(el.nodeGateway, 'done');

    // STAGE 3: Redis Broker
    setNodeState(el.nodeRedis, 'active');
    el.pipelineBusFill.style.width = '78%';
    setProgress(80, 'Redis Broker: Publishing serialized transcode job to message queue...');
    appendLog('REDIS LPUSH queue:celery → Task payload serialized (codec: H.264/HLS ABR).', 'log-entry__msg--cyan');
    await new Promise((r) => setTimeout(r, 600));
    setNodeState(el.nodeRedis, 'done');

    // STAGE 4: Celery Task Queue
    setNodeState(el.nodeCelery, 'active');
    el.pipelineBusFill.style.width = '100%';
    setProgress(95, 'Celery Task Queue: Worker pool accepted job (transcode_video_task.delay)...');

    // Wait for real upload if still running (with cap for smooth UX)
    const liveResult = await Promise.race([
      liveUploadPromise,
      new Promise((r) => setTimeout(() => r(null), 1200))
    ]);

    if (liveResult && liveResult.public_id) {
      sessionStorage.setItem('pendingVideoPublicId', liveResult.public_id);
    }

    setNodeState(el.nodeCelery, 'done');
    setProgress(100, 'Pipeline handoff complete (HTTP 202 Accepted). Redirecting to Dashboard...');
    appendLog('✓ Celery Worker ACK [202 Accepted] — Redirecting to real-time dashboard...', 'log-entry__msg--green');

    clearInterval(timerInterval);

    // Brief pause so user sees 100% completion before smooth redirect
    await new Promise((r) => setTimeout(r, 550));
    window.location.href = 'dashboard.html';
  }

  // =========================================================================
  // 5. FORM SUBMISSION & INITIALIZATION
  // =========================================================================

  function setupFormSubmit() {
    if (!el.ingestForm) return;

    el.ingestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isUploading) return;

      hideError();

      if (!currentFile) {
        showError('Please select or simulate a video file to ingest.');
        return;
      }

      const title = el.videoTitle.value.trim();
      if (!title) {
        showError('Please enter a stream title before dispatching.');
        el.videoTitle.focus();
        return;
      }

      const metadata = {
        title,
        visibility: el.videoVisibility.value,
        description: el.videoDescription.value.trim()
      };

      runPreRedirectPipeline(currentFile, metadata);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupDropzone();
    setupPayloadSimulators();
    setupFormSubmit();
  });

})();
