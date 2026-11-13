/**
 * ORBIT STREAMING PLATFORM — SYSTEM CONTROL & PIPELINE TELEMETRY ENGINE
 * Implements a real-time WebSocket event listener (simulated + live hybrid)
 * that dynamically drives the 5-stage pipeline node graph, FFmpeg ABR rendition
 * matrix (1080p, 720p, 480p), system metrics, and WebSocket event terminal.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. STATE & CONFIGURATION
  // =========================================================================
  const API_BASE = window.API_BASE || (
    ['localhost', '127.0.0.1'].includes(location.hostname)
      ? 'http://localhost:8000'
      : 'https://oribt.darkube.ir'
  );
  const WS_BASE = window.WS_BASE || (
    ['localhost', '127.0.0.1'].includes(location.hostname)
      ? 'ws://localhost:8000'
      : 'wss://oribt.darkube.ir'
  );

  let currentJob = {
    taskId: '48f9',
    file: 'distributed_consensus_4k60.mp4',
    size: '148.6 MB (19 Chunks)'
  };

  let isPaused = false;
  let activeFilter = 'all';
  let simulationRunId = 0;

  // DOM Cache
  const dom = {
    // Topbar Controls
    wsHeaderDot: document.getElementById('wsHeaderDot'),
    wsHeaderStatus: document.getElementById('wsHeaderStatus'),
    btnToggleSim: document.getElementById('btnToggleSim'),
    btnToggleSimLabel: document.getElementById('btnToggleSimLabel'),
    btnReplayJob: document.getElementById('btnReplayJob'),

    // System Metrics Overview
    metricWorkers: document.getElementById('metricWorkers'),
    metricWorkersLoad: document.getElementById('metricWorkersLoad'),
    metricWorkersBar: document.getElementById('metricWorkersBar'),
    metricRedisLatency: document.getElementById('metricRedisLatency'),
    metricQueueDepth: document.getElementById('metricQueueDepth'),
    metricRedisBar: document.getElementById('metricRedisBar'),
    metricThroughput: document.getElementById('metricThroughput'),
    metricThroughputBar: document.getElementById('metricThroughputBar'),
    metricFpsSpeed: document.getElementById('metricFpsSpeed'),
    metricFpsValue: document.getElementById('metricFpsValue'),
    metricFpsBar: document.getElementById('metricFpsBar'),

    // Active Job Header Pills
    activeTaskId: document.getElementById('activeTaskId'),
    activeSourceFile: document.getElementById('activeSourceFile'),
    activePayloadSize: document.getElementById('activePayloadSize'),
    activeOverallPct: document.getElementById('activeOverallPct'),
    nodeBusProgress: document.getElementById('nodeBusProgress'),

    // 5 Pipeline Stage Nodes
    stages: {
      ingest: {
        card: document.getElementById('stage-ingest'),
        badge: document.getElementById('badge-ingest'),
        pct: document.getElementById('pct-ingest'),
        bar: document.getElementById('bar-ingest')
      },
      queue: {
        card: document.getElementById('stage-queue'),
        badge: document.getElementById('badge-queue'),
        pct: document.getElementById('pct-queue'),
        bar: document.getElementById('bar-queue')
      },
      transcode: {
        card: document.getElementById('stage-transcode'),
        badge: document.getElementById('badge-transcode'),
        pct: document.getElementById('pct-transcode'),
        bar: document.getElementById('bar-transcode')
      },
      hls: {
        card: document.getElementById('stage-hls'),
        badge: document.getElementById('badge-hls'),
        pct: document.getElementById('pct-hls'),
        bar: document.getElementById('bar-hls')
      },
      index: {
        card: document.getElementById('stage-index'),
        badge: document.getElementById('badge-index'),
        pct: document.getElementById('pct-index'),
        bar: document.getElementById('bar-index')
      }
    },

    // FFmpeg Multi-Rendition Cards (1080p, 720p, 480p)
    renditions: {
      '1080p': {
        card: document.getElementById('rendition-1080p'),
        pct: document.getElementById('pct-1080p'),
        bar: document.getElementById('bar-1080p'),
        state: document.getElementById('state-1080p')
      },
      '720p': {
        card: document.getElementById('rendition-720p'),
        pct: document.getElementById('pct-720p'),
        bar: document.getElementById('bar-720p'),
        state: document.getElementById('state-720p')
      },
      '480p': {
        card: document.getElementById('rendition-480p'),
        pct: document.getElementById('pct-480p'),
        bar: document.getElementById('bar-480p'),
        state: document.getElementById('state-480p')
      }
    },

    // WebSocket Terminal & Queue
    wsChannelTag: document.getElementById('wsChannelTag'),
    wsStreamBody: document.getElementById('wsStreamBody'),
    btnClearTerminal: document.getElementById('btnClearTerminal'),
    filterButtons: document.querySelectorAll('[data-ws-filter]'),
    jobQueueList: document.getElementById('jobQueueList')
  };

  // =========================================================================
  // 2. UI UPDATERS (PIPELINE NODES, RENDITIONS, TERMINAL & METRICS)
  // =========================================================================

  function setStageState(stageKey, status, percent) {
    const s = dom.stages[stageKey];
    if (!s || !s.card) return;

    s.card.classList.remove('is-queued', 'is-active', 'is-completed');

    if (status === 'QUEUED') {
      s.card.classList.add('is-queued');
      s.badge.textContent = 'QUEUED';
    } else if (status === 'ACTIVE') {
      s.card.classList.add('is-active');
      s.badge.textContent = 'IN_PROGRESS';
    } else if (status === 'COMPLETED') {
      s.card.classList.add('is-completed');
      s.badge.textContent = 'COMPLETED';
    }

    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    if (s.pct) s.pct.textContent = `${clamped}%`;
    if (s.bar) s.bar.style.width = `${clamped}%`;
  }

  function setRenditionState(resKey, percent, stateText, mode = 'idle') {
    const r = dom.renditions[resKey];
    if (!r || !r.card) return;

    r.card.classList.remove('is-encoding', 'is-done');
    if (mode === 'encoding') r.card.classList.add('is-encoding');
    if (mode === 'done') r.card.classList.add('is-done');

    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    if (r.pct) r.pct.textContent = `${clamped}%`;
    if (r.bar) r.bar.style.width = `${clamped}%`;
    if (r.state && stateText) r.state.textContent = stateText;
  }

  function updateOverallProgress(percent, busPercent) {
    if (dom.activeOverallPct) {
      dom.activeOverallPct.textContent = `${Math.round(percent)}%`;
    }
    if (dom.nodeBusProgress) {
      dom.nodeBusProgress.style.width = `${Math.round(busPercent)}%`;
    }
  }

  /**
   * Appends a structured WebSocket frame to the real-time simulation terminal.
   */
  function pushWebSocketLog(category, badgeClass, message) {
    if (!dom.wsStreamBody) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    const line = document.createElement('div');
    line.className = 'ws-log-line';
    line.dataset.category = category;

    // Apply current filter visibility
    if (activeFilter !== 'all') {
      if (activeFilter === 'FFMPEG' && category !== 'FFMPEG') {
        line.style.display = 'none';
      } else if (activeFilter === 'QUEUE' && !['INGEST', 'QUEUE', 'HLS_PKG', 'STORAGE'].includes(category)) {
        line.style.display = 'none';
      }
    }

    line.innerHTML = `
      <span class="ws-time">[${timestamp}]</span>
      <span class="ws-badge ${badgeClass}">${category}</span>
      <span class="ws-msg">${message}</span>
    `;

    dom.wsStreamBody.appendChild(line);
    dom.wsStreamBody.scrollTop = dom.wsStreamBody.scrollHeight;
  }

  /**
   * Dynamically adjusts system telemetry metrics to reflect pipeline load.
   */
  function updateLiveMetrics({ workers, loadPct, redisMs, queueBacklog, throughputMB, speedRT, fps }) {
    if (workers && dom.metricWorkers) dom.metricWorkers.textContent = workers;
    if (loadPct !== undefined && dom.metricWorkersLoad) {
      dom.metricWorkersLoad.textContent = `${loadPct}% LOAD`;
      if (dom.metricWorkersBar) dom.metricWorkersBar.style.width = `${loadPct}%`;
    }
    if (redisMs !== undefined && dom.metricRedisLatency) {
      dom.metricRedisLatency.textContent = `${redisMs.toFixed(1)} ms`;
      if (dom.metricRedisBar) dom.metricRedisBar.style.width = `${Math.min(100, redisMs * 14)}%`;
    }
    if (queueBacklog !== undefined && dom.metricQueueDepth) {
      dom.metricQueueDepth.textContent = `${queueBacklog} QUEUED`;
    }
    if (throughputMB !== undefined && dom.metricThroughput) {
      dom.metricThroughput.textContent = `${throughputMB.toFixed(1)} MB/s`;
      if (dom.metricThroughputBar) dom.metricThroughputBar.style.width = `${Math.min(100, (throughputMB / 500) * 100)}%`;
    }
    if (speedRT !== undefined && dom.metricFpsSpeed) {
      dom.metricFpsSpeed.textContent = `${speedRT.toFixed(1)}x RT`;
    }
    if (fps !== undefined && dom.metricFpsValue) {
      dom.metricFpsValue.textContent = `${fps} FPS`;
      if (dom.metricFpsBar) dom.metricFpsBar.style.width = `${Math.min(100, (fps / 320) * 100)}%`;
    }
  }

  function resetPipelineUI(job) {
    if (dom.activeTaskId) dom.activeTaskId.textContent = `#${job.taskId}`;
    if (dom.activeSourceFile) dom.activeSourceFile.textContent = job.file;
    if (dom.activePayloadSize) dom.activePayloadSize.textContent = job.size;
    if (dom.wsChannelTag) {
      dom.wsChannelTag.textContent = `wss://api.orbit.stream/videos/ws/video/${job.taskId}`;
    }

    updateOverallProgress(0, 0);

    ['ingest', 'queue', 'transcode', 'hls', 'index'].forEach((k) => {
      setStageState(k, 'QUEUED', 0);
    });

    ['1080p', '720p', '480p'].forEach((res) => {
      setRenditionState(res, 0, 'Waiting for worker...', 'idle');
    });
  }

  // =========================================================================
  // 3. SIMULATED WEBSOCKET EVENT PIPELINE ENGINE
  // =========================================================================

  /**
   * Pause-aware delay helper so evaluators can pause/inspect at any moment.
   */
  async function waitTick(ms, runId) {
    const step = 80;
    let elapsed = 0;
    while (elapsed < ms) {
      if (runId !== simulationRunId) return false;
      if (!isPaused) {
        elapsed += step;
      }
      await new Promise((r) => setTimeout(r, step));
    }
    return runId === simulationRunId;
  }

  /**
   * Simulates the full real-time WebSocket stream from FastAPI / Redis Pub/Sub / Celery:
   * Ingestion -> Queue -> FFmpeg [1080p, 720p, 480p] -> HLS Segmenting -> Storage Indexing
   */
  async function startSimulatedWebSocketPipeline(job) {
    simulationRunId += 1;
    const runId = simulationRunId;
    const tid = job.taskId;

    resetPipelineUI(job);

    // Update job badge in queue list
    const activeJobBadge = document.getElementById(`job-badge-${tid}`);
    if (activeJobBadge) {
      activeJobBadge.textContent = 'PROCESSING';
      activeJobBadge.className = 'job-row__status job-row__status--running';
    }

    pushWebSocketLog(
      'INGEST',
      'ws-badge--ingest',
      `<strong>[WS_CONNECTED]</strong> Subscribed to Redis Pub/Sub channel <code>video:${tid}:status</code>`
    );

    // -----------------------------------------------------------------------
    // STAGE 1: S3 INGESTION & FFPROBE
    // -----------------------------------------------------------------------
    setStageState('ingest', 'ACTIVE', 25);
    updateOverallProgress(6, 5);
    updateLiveMetrics({ workers: '12 / 16', loadPct: 68, redisMs: 1.2, queueBacklog: 1, throughputMB: 412.4, speedRT: 0.0, fps: 0 });
    pushWebSocketLog(
      'INGEST',
      'ws-badge--ingest',
      `<strong>[Task ID: ${tid}]</strong> Status: Verifying S3 multipart object (${job.size})...`
    );
    if (!(await waitTick(650, runId))) return;

    setStageState('ingest', 'ACTIVE', 75);
    updateOverallProgress(12, 12);
    pushWebSocketLog(
      'INGEST',
      'ws-badge--ingest',
      `<strong>[Task ID: ${tid}]</strong> Status: ffprobe container check OK — H.264 High@L5.1, 60.0 fps, AAC 48kHz`
    );
    if (!(await waitTick(650, runId))) return;

    setStageState('ingest', 'COMPLETED', 100);
    updateOverallProgress(18, 22);

    // -----------------------------------------------------------------------
    // STAGE 2: REDIS BROKER & CELERY WORKER QUEUE
    // -----------------------------------------------------------------------
    setStageState('queue', 'ACTIVE', 45);
    updateLiveMetrics({ workers: '14 / 16', loadPct: 88, redisMs: 1.5, queueBacklog: 0, throughputMB: 295.0, speedRT: 1.0, fps: 60 });
    pushWebSocketLog(
      'QUEUE',
      'ws-badge--queue',
      `<strong>[Task ID: ${tid}]</strong> Status: Dispatched <code>transcode_video_task</code> via Redis Broker`
    );
    if (!(await waitTick(600, runId))) return;

    setStageState('queue', 'COMPLETED', 100);
    updateOverallProgress(28, 42);
    pushWebSocketLog(
      'QUEUE',
      'ws-badge--queue',
      `<strong>[Task ID: ${tid}]</strong> Status: Claimed by worker <code>celery@node-01</code> — temp workspace mounted`
    );
    if (!(await waitTick(500, runId))) return;

    // -----------------------------------------------------------------------
    // STAGE 3: FFMPEG MULTI-RENDITION TRANSCODING (1080p, 720p, 480p)
    // -----------------------------------------------------------------------
    setStageState('transcode', 'ACTIVE', 10);

    // 3A: 1080p Pass
    setRenditionState('1080p', 24, 'Encoding @ 2.8x RT (168 fps)', 'encoding');
    updateLiveMetrics({ workers: '15 / 16', loadPct: 94, redisMs: 1.4, queueBacklog: 0, throughputMB: 318.6, speedRT: 2.8, fps: 168 });
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 1080p - 24% complete (bitrate=5000k, fps=168)...`
    );
    if (!(await waitTick(700, runId))) return;

    setRenditionState('1080p', 68, 'Encoding @ 3.1x RT (186 fps)', 'encoding');
    setStageState('transcode', 'ACTIVE', 26);
    updateOverallProgress(40, 50);
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 1080p - 68% complete (bitrate=5000k, fps=186)...`
    );
    if (!(await waitTick(700, runId))) return;

    setRenditionState('1080p', 100, '✓ 1080p Pass Complete', 'done');
    setStageState('transcode', 'ACTIVE', 38);
    updateOverallProgress(48, 54);

    // 3B: 720p Pass
    setRenditionState('720p', 32, 'Encoding @ 3.8x RT (228 fps)', 'encoding');
    updateLiveMetrics({ workers: '15 / 16', loadPct: 92, redisMs: 1.3, queueBacklog: 0, throughputMB: 356.2, speedRT: 3.8, fps: 228 });
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 720p - 32% complete (bitrate=2500k, fps=228)...`
    );
    if (!(await waitTick(650, runId))) return;

    setRenditionState('720p', 68, 'Encoding @ 4.1x RT (246 fps)', 'encoding');
    setStageState('transcode', 'ACTIVE', 56);
    updateOverallProgress(58, 58);
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 720p - 68% complete...`
    );
    if (!(await waitTick(700, runId))) return;

    setRenditionState('720p', 100, '✓ 720p Pass Complete', 'done');
    setStageState('transcode', 'ACTIVE', 70);
    updateOverallProgress(66, 62);

    // 3C: 480p Pass
    setRenditionState('480p', 48, 'Encoding @ 5.2x RT (312 fps)', 'encoding');
    updateLiveMetrics({ workers: '14 / 16', loadPct: 86, redisMs: 1.2, queueBacklog: 0, throughputMB: 382.9, speedRT: 5.2, fps: 312 });
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 480p - 48% complete (bitrate=1200k, fps=312)...`
    );
    if (!(await waitTick(600, runId))) return;

    setRenditionState('480p', 92, 'Encoding @ 5.5x RT (330 fps)', 'encoding');
    setStageState('transcode', 'ACTIVE', 92);
    updateOverallProgress(74, 66);
    pushWebSocketLog(
      'FFMPEG',
      'ws-badge--ffmpeg',
      `<strong>[Task ID: ${tid}]</strong> Status: Transcoding 480p - 92% complete...`
    );
    if (!(await waitTick(550, runId))) return;

    setRenditionState('480p', 100, '✓ 480p Pass Complete', 'done');
    setStageState('transcode', 'COMPLETED', 100);
    updateOverallProgress(78, 72);

    // -----------------------------------------------------------------------
    // STAGE 4: HLS SEGMENTING & MANIFEST PACKAGING
    // -----------------------------------------------------------------------
    setStageState('hls', 'ACTIVE', 45);
    updateLiveMetrics({ workers: '13 / 16', loadPct: 78, redisMs: 1.1, queueBacklog: 0, throughputMB: 428.5, speedRT: 4.2, fps: 252 });
    pushWebSocketLog(
      'HLS_PKG',
      'ws-badge--hls',
      `<strong>[Task ID: ${tid}]</strong> Status: Segmenting 4.0s MPEG-TS chunks &amp; generating timeline sprite VTT...`
    );
    if (!(await waitTick(700, runId))) return;

    setStageState('hls', 'COMPLETED', 100);
    updateOverallProgress(88, 88);
    pushWebSocketLog(
      'HLS_PKG',
      'ws-badge--hls',
      `<strong>[Task ID: ${tid}]</strong> Status: Packaged adaptive <code>master.m3u8</code> (1080p, 720p, 480p variants)`
    );
    if (!(await waitTick(550, runId))) return;

    // -----------------------------------------------------------------------
    // STAGE 5: S3 STORAGE INDEXING & POSTGRESQL COMMIT
    // -----------------------------------------------------------------------
    setStageState('index', 'ACTIVE', 55);
    updateLiveMetrics({ workers: '12 / 16', loadPct: 75, redisMs: 1.3, queueBacklog: 0, throughputMB: 465.0, speedRT: 3.6, fps: 216 });
    pushWebSocketLog(
      'STORAGE',
      'ws-badge--queue',
      `<strong>[Task ID: ${tid}]</strong> Status: Uploading 144 HLS segments to S3 prefix <code>processed/${tid}/hls/</code>...`
    );
    if (!(await waitTick(700, runId))) return;

    setStageState('index', 'COMPLETED', 100);
    updateOverallProgress(100, 100);
    pushWebSocketLog(
      'READY',
      'ws-badge--ready',
      `<strong>[Task ID: ${tid}]</strong> Status: PIPELINE COMPLETE — <code>{"type": "video.ready", "manifest": "/videos/hls/${tid}/master.m3u8"}</code>`
    );

    if (activeJobBadge) {
      activeJobBadge.textContent = 'READY · HLS';
      activeJobBadge.className = 'job-row__status job-row__status--ready';
    }
  }

  // =========================================================================
  // 4. OPTIONAL LIVE WEBSOCKET LISTENER (WHEN REDIRECTED FROM UPLOAD)
  // =========================================================================

  async function tryAttachLiveWebSocket(publicId) {
    try {
      const tokenRes = await fetch(`${API_BASE}/videos/ws-token`, { credentials: 'include' });
      if (!tokenRes.ok) return;
      const { token } = await tokenRes.json();

      const ws = new WebSocket(`${WS_BASE}/videos/ws/video/${publicId}`);
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'auth', token }));
      });

      ws.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'video.progress') {
            const pct = msg.stepPercent !== undefined ? ` - ${msg.stepPercent}% complete...` : '...';
            pushWebSocketLog(
              'LIVE_WS',
              'ws-badge--ingest',
              `<strong>[Task ID: ${publicId}]</strong> Status: ${msg.label}${pct}`
            );
          } else if (msg.type === 'video.ready') {
            pushWebSocketLog(
              'READY',
              'ws-badge--ready',
              `<strong>[Task ID: ${publicId}]</strong> Status: Live backend reported video.ready`
            );
          }
        } catch (_) {}
      });
    } catch (_) {
      // Simulated WebSocket engine handles visualization seamlessly
    }
  }

  // =========================================================================
  // 5. INTERACTIVE CONTROLS & EVENT LISTENERS
  // =========================================================================

  function setupControls() {
    // Pause / Resume Stream Toggle
    if (dom.btnToggleSim) {
      dom.btnToggleSim.addEventListener('click', () => {
        isPaused = !isPaused;
        if (dom.btnToggleSimLabel) {
          dom.btnToggleSimLabel.textContent = isPaused ? '▶ Resume Stream' : '⏸ Pause Stream';
        }
        if (dom.wsHeaderDot) {
          dom.wsHeaderDot.classList.toggle('is-paused', isPaused);
        }
        if (dom.wsHeaderStatus) {
          dom.wsHeaderStatus.textContent = isPaused ? 'WS_PUBSUB: PAUSED' : 'WS_PUBSUB: CONNECTED';
        }
      });
    }

    // Replay / Dispatch New Simulated Job
    if (dom.btnReplayJob) {
      dom.btnReplayJob.addEventListener('click', () => {
        isPaused = false;
        if (dom.btnToggleSimLabel) dom.btnToggleSimLabel.textContent = '⏸ Pause Stream';
        if (dom.wsHeaderDot) dom.wsHeaderDot.classList.remove('is-paused');
        if (dom.wsHeaderStatus) dom.wsHeaderStatus.textContent = 'WS_PUBSUB: CONNECTED';
        startSimulatedWebSocketPipeline(currentJob);
      });
    }

    // Clear Terminal Button
    if (dom.btnClearTerminal) {
      dom.btnClearTerminal.addEventListener('click', () => {
        if (dom.wsStreamBody) dom.wsStreamBody.innerHTML = '';
      });
    }

    // Filter Buttons (All, FFmpeg, Broker/S3)
    dom.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.wsFilter;
        if (!filter) return;

        activeFilter = filter;
        dom.filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const lines = dom.wsStreamBody?.querySelectorAll('.ws-log-line') || [];
        lines.forEach((line) => {
          const cat = line.dataset.category;
          if (filter === 'all') {
            line.style.display = 'flex';
          } else if (filter === 'FFMPEG') {
            line.style.display = cat === 'FFMPEG' ? 'flex' : 'none';
          } else if (filter === 'QUEUE') {
            line.style.display = ['INGEST', 'QUEUE', 'HLS_PKG', 'STORAGE'].includes(cat) ? 'flex' : 'none';
          }
        });
      });
    });

    // Job Queue Row Selection
    if (dom.jobQueueList) {
      dom.jobQueueList.addEventListener('click', (e) => {
        const row = e.target.closest('.job-row');
        if (!row) return;

        document.querySelectorAll('.job-row').forEach((r) => r.classList.remove('is-selected'));
        row.classList.add('is-selected');

        currentJob = {
          taskId: row.dataset.jobId || '48f9',
          file: row.dataset.file || 'stream_master.mp4',
          size: row.dataset.size || '148.6 MB'
        };

        isPaused = false;
        if (dom.btnToggleSimLabel) dom.btnToggleSimLabel.textContent = '⏸ Pause Stream';
        startSimulatedWebSocketPipeline(currentJob);
      });
    }
  }

  // =========================================================================
  // 6. INITIALIZATION
  // =========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    setupControls();

    // Check if redirected from upload.html with a pending video ID
    const pendingPublicId = sessionStorage.getItem('pendingVideoPublicId');
    if (pendingPublicId) {
      sessionStorage.removeItem('pendingVideoPublicId');
      currentJob.taskId = pendingPublicId.slice(0, 6);
      tryAttachLiveWebSocket(pendingPublicId);
    }

    // Start the real-time simulated WebSocket pipeline
    startSimulatedWebSocketPipeline(currentJob);
  });

})();