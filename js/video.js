// video.js – Merged HLS Player + All Page Features
(function() {
    'use strict';

    // ================================================================
    // 1. HLS Player Initialization
    // ================================================================
    if (typeof Hls === 'undefined') {
        console.error('HLS.js not loaded');
        // Optionally show an error to the user
        return;
    }

    const API_BASE = window.API_BASE_URL || 'http://localhost:8000';
    const WS_BASE = window.WS_BASE_URL || 'ws://localhost:8000';
    const video = document.getElementById('mainVideo');
    const VIDEO_ID = window.VIDEO_ID;

    // --- DOM references (player specific) ---
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const statusMessageDiv = document.getElementById('statusMessage');
    const videoTitle = document.getElementById('videoTitle');
    const videoDescription = document.getElementById('videoDescription');
    const videoViews = document.querySelector('.video-views');
    const videoUploadTime = document.querySelector('.video-upload-time');
    const videoChannel = document.getElementById('videoChannel');
    const channelName = document.querySelector('.channel-name');
    const channelSubs = document.querySelector('.channel-subs');
    const channelAvatar = document.querySelector('.channel-avatar');
    const descPreview = document.getElementById('descPreview');

    // Controls
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn?.querySelector('.play-icon');
    const pauseIcon = playBtn?.querySelector('.pause-icon');
    const progressTrack = document.getElementById('progressTrack');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressLoaded = document.getElementById('progressLoaded');
    const progressThumb = document.getElementById('progressThumb');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volOnIcon = volumeBtn?.querySelector('.vol-on');
    const volOffIcon = volumeBtn?.querySelector('.vol-off');
    const mutedIndicator = document.getElementById('mutedIndicator');
    const pipBtn = document.getElementById('pipBtn');
    const theaterBtn = document.getElementById('theaterBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const playerWrapper = document.getElementById('playerWrapper');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const qualityButtons = document.getElementById('qualityButtons');
    const ambientCanvas = document.getElementById('ambientCanvas');
    const ambientCtx = ambientCanvas?.getContext('2d');

    // --- Player state ---
    let hlsInstance = null;
    let videoMetadata = null;
    let spriteTiles = [];
    let spriteSheetImage = null;
    let thumbnailPreview = null;

    // --- Hero state management ---
    function setHeroState(state) {
        if (!heroPlayBtn) return;
        heroPlayBtn.classList.remove('loading', 'hidden');
        heroPlayBtn.style.display = 'flex';
        
        switch (state) {
            case 'loading':
                heroPlayBtn.classList.add('loading');
                break;
            case 'paused':
                // default shows play icon
                break;
            case 'playing':
                heroPlayBtn.classList.add('hidden');
                break;
            case 'hidden':
                heroPlayBtn.style.display = 'none';
                break;
        }
    }

    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.paused) video.play().catch(() => {});
        });
    }

    // --- Helper: toast (fallback if global function missing) ---
    if (typeof window.showToast !== 'function') {
        window.showToast = function(msg) {
            const t = document.createElement('div');
            t.className = 'toast';
            t.textContent = msg;
            Object.assign(t.style, {
                position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 24px',
                borderRadius: '8px', zIndex: '9999', fontSize: '14px', transition: 'opacity 0.3s'
            });
            document.body.appendChild(t);
            setTimeout(() => t.style.opacity = '0', 1800);
            setTimeout(() => t.remove(), 2200);
        };
    }

    // --- Helper: Format relative time ---
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
        
        return 'Just now';
    }

    // --- Format duration ---
    function formatDuration(totalSeconds) {
        if (!totalSeconds) return '';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // --- Format views ---
    function formatViews(views) {
        if (!views && views !== 0) return '0 views';
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M views';
        }
        if (views >= 1000) {
            return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K views';
        }
        return views + ' view' + (views !== 1 ? 's' : '');
    }

    // --- Update UI with metadata ---
    function updateVideoInfo(metadata) {
        // Title
        if (videoTitle) {
            videoTitle.textContent = metadata.title || 'Untitled Video';
        }
        
        // Description
        if (videoDescription) {
            videoDescription.textContent = metadata.description || 'No description available.';
        }
        
        // Description preview (with hashtags)
        if (descPreview) {
            descPreview.innerHTML = `<p>${(metadata.description || 'No description available.').replace(/#[\w\u0600-\u06FF]+/g, m => `<span class="hashtag">${m}</span>`)}</p>`;
        }
        
        // Views and upload time
        if (videoViews) {
            videoViews.textContent = formatViews(metadata.views || 0);
        }
        
        if (videoUploadTime) {
            if (metadata.published_at || metadata.created_at) {
                const dateToShow = metadata.published_at || metadata.created_at;
                videoUploadTime.textContent = timeAgo(dateToShow);
            }
        }
        
        // Channel info
        if (channelName) {
            const channelNameText = channelName.childNodes[0];
            if (channelNameText && channelNameText.nodeType === 3) {
                channelNameText.textContent = metadata.channel_name || 'Channel';
            } else {
                channelName.innerHTML = (metadata.channel_name || 'Channel') + ' ' + channelName.innerHTML.replace(/^[^<]*/, '');
            }
        }
        
        if (channelSubs && metadata.channel_id) {
            channelSubs.textContent = '123K subscribers';
        }
        
        if (channelAvatar && metadata.channel_name) {
            channelAvatar.textContent = metadata.channel_name.substring(0, 2).toUpperCase();
        }
        
        if (videoChannel && metadata.channel_id) {
            videoChannel.innerHTML = `<span>Channel #${metadata.channel_id}</span>`;
        }
        
        // Video thumbnail/poster
        if (metadata.thumbnail_url) {
            video.poster = metadata.thumbnail_url;
        }
        
        // Update page title
        if (metadata.title) {
            document.title = `${metadata.title} - ORBIT`;
        }
        
        console.log('Video metadata loaded:', metadata);
    }

    // --- Fetch video metadata ---
    async function fetchVideoMetadata() {
        try {
            const url = `${API_BASE}/videos/${VIDEO_ID}`;
            console.log('Fetching video metadata from:', url);
            
            const res = await fetch(url, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            
            const data = await res.json();
            videoMetadata = data;
            
            // Update all UI elements with metadata
            updateVideoInfo(data);
            
            return data;
        } catch (err) {
            console.error('Failed to fetch video metadata:', err);
            window.showToast(`Error loading video info: ${err.message}`);
            if (videoTitle) videoTitle.textContent = `Video #${VIDEO_ID}`;
            if (videoDescription) videoDescription.textContent = 'Unable to load video description.';
            if (descPreview) descPreview.innerHTML = '<p>Unable to load video description.</p>';
            return null;
        }
    }

    // --- Refresh metadata (for WebSocket updates) ---
    async function refreshMetadata() {
        console.log('Refreshing video metadata...');
        const metadata = await fetchVideoMetadata();
        if (metadata) {
            videoMetadata = metadata;
        }
        return metadata;
    }

    // --- Sprite VTT parsing & preview ---
    async function loadSpriteData(metadata) {
        if (!metadata.sprite_vtt_url || !metadata.sprite_url) return;
        try {
            const vttRes = await fetch(metadata.sprite_vtt_url);
            const vttText = await vttRes.text();
            parseVTT(vttText, metadata.sprite_url);
        } catch (err) {
            console.error('Failed to load sprite VTT:', err);
        }
    }

    function parseVTT(vttContent, spriteSheetUrl) {
        const lines = vttContent.split('\n');
        const tileRegex = /sprites\.jpg#xywh=(\d+),(\d+),(\d+),(\d+)/;
        let currentStart = 0, currentEnd = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('-->')) {
                const times = line.split(' --> ');
                currentStart = parseVTTTime(times[0]);
                currentEnd = parseVTTTime(times[1]);
            } else if (line.includes('sprites.jpg#xywh=')) {
                const match = line.match(tileRegex);
                if (match) {
                    spriteTiles.push({
                        start: currentStart,
                        end: currentEnd,
                        x: parseInt(match[1]),
                        y: parseInt(match[2]),
                        width: parseInt(match[3]),
                        height: parseInt(match[4])
                    });
                }
            }
        }

        spriteSheetImage = new Image();
        spriteSheetImage.crossOrigin = 'Anonymous';
        spriteSheetImage.src = spriteSheetUrl;
        spriteSheetImage.onload = () => console.log('Sprite sheet loaded');
    }

    function parseVTTTime(timestamp) {
        const parts = timestamp.split(':');
        let seconds = 0;
        if (parts.length === 3) {
            seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        } else if (parts.length === 2) {
            seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        } else {
            seconds = parseFloat(parts[0]);
        }
        return seconds;
    }

    function createThumbnailPreview() {
        const preview = document.createElement('div');
        preview.className = 'sprite-thumbnail-preview';
        preview.style.cssText = `
            position: absolute; display: none; pointer-events: none; z-index: 100;
            background: rgba(0,0,0,0.9); border: 2px solid var(--sprite-border, rgba(255,255,255,0.25));
            border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); transition: opacity 0.1s ease;
        `;
        const img = document.createElement('img');
        img.style.cssText = `display: block; width: 200px; height: 112px; object-fit: cover; border-radius: 10px;`;
        const timeOverlay = document.createElement('div');
        timeOverlay.className = 'sprite-time-overlay';
        timeOverlay.style.cssText = `
            position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8);
            color: #fff; font-size: 13px; padding: 2px 6px; border-radius: 4px;
            font-family: 'Roboto', sans-serif; letter-spacing: 0.2px; white-space: nowrap;
        `;
        preview.appendChild(img);
        preview.appendChild(timeOverlay);
        playerWrapper.appendChild(preview);
        return { preview, img, timeOverlay };
    }

    function showThumbnailAtTime(seconds, relativeX) {
        if (!spriteSheetImage || !spriteTiles.length || !progressTrack || !playerWrapper) return;
        const tile = spriteTiles.find(t => seconds >= t.start && seconds <= t.end);
        if (!tile) { hideThumbnail(); return; }
        if (!thumbnailPreview) thumbnailPreview = createThumbnailPreview();

        const { preview, img, timeOverlay } = thumbnailPreview;
        const canvas = document.createElement('canvas');
        canvas.width = tile.width;
        canvas.height = tile.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(spriteSheetImage, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.width, tile.height);
        img.src = canvas.toDataURL();
        timeOverlay.textContent = fmtTime(seconds);

        const wrapperRect = playerWrapper.getBoundingClientRect();
        const trackRect = progressTrack.getBoundingClientRect();
        const gap = 8;
        const previewHeight = 112 + 8 + 2;
        const previewWidth  = 200 + 8 + 2;
        const trackTopRel = trackRect.top - wrapperRect.top;
        const trackBottomRel = trackRect.bottom - wrapperRect.top;

        let topPos = trackTopRel - previewHeight - gap;
        if (topPos < 0) topPos = trackBottomRel + gap;
        const edgeMargin = 8;
        let leftPos = relativeX - previewWidth / 2;
        leftPos = Math.max(edgeMargin, Math.min(leftPos, wrapperRect.width - previewWidth - edgeMargin));

        preview.style.left = leftPos + 'px';
        preview.style.top = topPos + 'px';
        preview.style.display = 'block';
    }

    function hideThumbnail() {
        if (thumbnailPreview) thumbnailPreview.preview.style.display = 'none';
    }

    // --- Load HLS stream ---
    async function loadHLSStream() {
        try {
            const signedUrlEndpoint = `${API_BASE}/videos/${VIDEO_ID}/signed-url`;
            const res = await fetch(signedUrlEndpoint, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { signed_url: manifestUrl } = await res.json();

            if (Hls.isSupported()) {
                hlsInstance = new Hls({
                    debug: false,
                    enableWorker: true,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60
                });
                hlsInstance.loadSource(manifestUrl);
                hlsInstance.attachMedia(video);

                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    setHeroState('paused'); // Changed from 'playing' to 'paused'
                    setupQualityButtons();
                    // Removed video.play() call
                });

                hlsInstance.on(Hls.Events.LEVEL_SWITCHED, () => syncQualityUI());

                hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                setHeroState('loading');
                                hlsInstance.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hlsInstance.recoverMediaError();
                                break;
                            default:
                                hlsInstance.destroy();
                                setHeroState('hidden');
                                window.showToast('Video playback error');
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = manifestUrl;
                video.addEventListener('loadedmetadata', () => {
                    setHeroState('paused'); // Changed from 'playing' to 'paused'
                    // Removed video.play() call
                });
            } else {
                window.showToast('HLS not supported in this browser');
                setHeroState('hidden');
            }
        } catch (err) {
            console.error('Failed to get signed URL:', err);
            window.showToast(`Error: ${err.message}`);
            setHeroState('hidden');
        }
    }
    // --- Quality buttons (dynamic from HLS manifest) ---
    function setupQualityButtons() {
        if (!qualityButtons || !hlsInstance) return;
        qualityButtons.innerHTML = '';

        const autoBtn = document.createElement('button');
        autoBtn.dataset.level = '-1';
        autoBtn.textContent = 'Auto';
        autoBtn.onclick = () => {
            if (hlsInstance) hlsInstance.nextLevel = -1;
            syncQualityUI();
            settingsMenu?.classList.remove('active');
        };
        qualityButtons.appendChild(autoBtn);

        hlsInstance.levels.forEach((level, idx) => {
            const btn = document.createElement('button');
            btn.dataset.level = idx;
            let label = null;
            if (level.height && level.height > 0) label = level.height + 'p';
            else if (level.attrs?.RESOLUTION) {
                const parts = level.attrs.RESOLUTION.split('x');
                if (parts.length === 2) label = parseInt(parts[1], 10) + 'p';
            }
            if (!label && level.bitrate) {
                if (level.bitrate < 800000) label = '360p';
                else if (level.bitrate < 2000000) label = '480p';
                else if (level.bitrate < 4000000) label = '720p';
                else if (level.bitrate < 8000000) label = '1080p';
                else label = '4K';
            }
            if (!label) label = 'Quality ' + (idx + 1);
            btn.textContent = label;
            btn.onclick = () => {
                if (hlsInstance) hlsInstance.nextLevel = idx;
                syncQualityUI();
                settingsMenu?.classList.remove('active');
            };
            qualityButtons.appendChild(btn);
        });
        syncQualityUI();
    }

    function syncQualityUI() {
        if (!qualityButtons || !hlsInstance) return;
        qualityButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        if (hlsInstance.autoLevelEnabled) {
            const autoBtn = qualityButtons.querySelector('button[data-level="-1"]');
            if (autoBtn) autoBtn.classList.add('active');
        } else {
            const current = hlsInstance.currentLevel;
            const match = qualityButtons.querySelector(`button[data-level="${current}"]`);
            if (match) match.classList.add('active');
        }
    }

    // --- WebSocket for processing updates ---
    let ws = null;
    let wsReconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    function tryConnectWebSocket() {
        if (ws && ws.readyState === WebSocket.OPEN) return;
        
        fetch(`${API_BASE}/ws-token`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to get WS token');
                return res.json();
            })
            .then(({ token }) => {
                ws = new WebSocket(`${WS_BASE}/ws/video/${VIDEO_ID}`);
                
                ws.onopen = () => {
                    console.log('WebSocket connected');
                    wsReconnectAttempts = 0;
                    ws.send(JSON.stringify({ type: 'auth', token }));
                };
                
                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        console.log('WebSocket message:', msg);
                        
                        switch (msg.type) {
                            case 'video.ready':
                                window.showToast('Video is now ready!');
                                refreshMetadata().then(() => {
                                    if (videoMetadata && videoMetadata.status === 'ready') {
                                        showStatusMessage('ready');
                                        setHeroState('loading');
                                        loadHLSStream();
                                    }
                                });
                                break;
                                
                            case 'video.processing':
                                showStatusMessage('processing');
                                break;
                                
                            case 'video.error':
                                showStatusMessage('failed', msg.error);
                                setHeroState('hidden');
                                break;
                                
                            case 'video.updated':
                                refreshMetadata();
                                break;
                        }
                    } catch (err) {
                        console.error('Error handling WS message:', err);
                    }
                };
                
                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
                
                ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    
                    if (videoMetadata && videoMetadata.status === 'processing' && wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        wsReconnectAttempts++;
                        const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
                        console.log(`Reconnecting in ${delay/1000}s (attempt ${wsReconnectAttempts})`);
                        setTimeout(tryConnectWebSocket, delay);
                    }
                };
            })
            .catch(err => {
                console.warn('WebSocket init failed:', err);
                if (videoMetadata && videoMetadata.status === 'processing' && wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    wsReconnectAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
                    setTimeout(tryConnectWebSocket, delay);
                }
            });
    }

    function showStatusMessage(status, errorMsg = null) {
        if (!statusMessageDiv) return;
        if (status === 'processing') {
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.innerHTML = `<div class="status-processing"><div class="spinner-small"></div><p>Processing video, please wait...</p></div>`;
            video.style.display = 'none';
        } else if (status === 'failed') {
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.innerHTML = `<div class="status-failed"><p>Error: ${errorMsg || 'Transcoding failed'}</p></div>`;
            video.style.display = 'none';
        } else {
            statusMessageDiv.style.display = 'none';
            video.style.display = 'block';
        }
    }

    // --- Format time ---
    function fmtTime(s) {
        if (!isFinite(s) || isNaN(s)) return '0:00';
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60);
        return h ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
    }

    // --- Click on player wrapper to toggle play/pause ---
    if (playerWrapper) {
        playerWrapper.addEventListener('click', (e) => {
            if (e.target.closest('.custom-controls') || e.target.closest('.hero-play-btn')) return;
            if (video.paused) video.play();
            else video.pause();
        });
    }

    // Replace the existing progressTrack event listeners with this block:

    // --- Progress bar: drag to seek, hover thumbnail, click to seek ---
    let hoverTimeout;
    let isDragging = false;

    // Mouse down on progress track or thumb - start dragging
    progressTrack.addEventListener('mousedown', (e) => {
        if (!video.duration || !isFinite(video.duration)) return;
        
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        
        // Seek immediately on mousedown
        seekToPosition(e);
        
        // Add global event listeners for dragging
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    });

    // Touch events for mobile
    progressTrack.addEventListener('touchstart', (e) => {
        if (!video.duration || !isFinite(video.duration)) return;
        
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        
        // Seek immediately on touch
        seekToPosition(e.touches[0]);
        
        document.addEventListener('touchmove', handleTouchDrag, { passive: false });
        document.addEventListener('touchend', stopTouchDrag);
    });

    function seekToPosition(e) {
        const rect = progressTrack.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : e.clientX;
        const percent = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
        const seekTime = percent * video.duration;
        
        // Update video time
        video.currentTime = seekTime;
        
        // Update progress bar UI
        updateProgressUI(percent);
    }

    function updateProgressUI(percent) {
        const progressPercent = percent * 100;
        if (progressCurrent) progressCurrent.style.width = progressPercent + '%';
        if (progressThumb) progressThumb.style.left = progressPercent + '%';
        if (timeDisplay) {
            const currentTime = percent * video.duration;
            timeDisplay.textContent = fmtTime(currentTime) + ' / ' + fmtTime(video.duration);
        }
    }

    function handleDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        seekToPosition(e);
        
        // Update thumbnail during drag
        if (video.duration && isFinite(video.duration)) {
            const rect = progressTrack.getBoundingClientRect();
            const percent = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
            const time = percent * video.duration;
            
            if (playerWrapper) {
                const wrapperRect = playerWrapper.getBoundingClientRect();
                const relativeX = e.clientX - wrapperRect.left;
                showThumbnailAtTime(time, relativeX);
            }
        }
    }

    function handleTouchDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        seekToPosition(e.touches[0]);
        
        // Update thumbnail during touch drag
        if (video.duration && isFinite(video.duration)) {
            const rect = progressTrack.getBoundingClientRect();
            const percent = Math.max(0, Math.min((e.touches[0].clientX - rect.left) / rect.width, 1));
            const time = percent * video.duration;
            
            if (playerWrapper) {
                const wrapperRect = playerWrapper.getBoundingClientRect();
                const relativeX = e.touches[0].clientX - wrapperRect.left;
                showThumbnailAtTime(time, relativeX);
            }
        }
    }

    function stopDrag() {
        isDragging = false;
        hideThumbnail();
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    function stopTouchDrag() {
        isDragging = false;
        hideThumbnail();
        document.removeEventListener('touchmove', handleTouchDrag);
        document.removeEventListener('touchend', stopTouchDrag);
    }

    // Hover thumbnail preview (separate from drag)
    progressTrack.addEventListener('mousemove', (e) => {
        if (isDragging) return; // Don't interfere with dragging
        
        if (!video.duration || !isFinite(video.duration)) return;
        
        const rect = progressTrack.getBoundingClientRect();
        const percent = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const time = percent * video.duration;
        
        // Show thumbnail preview
        if (playerWrapper) {
            const wrapperRect = playerWrapper.getBoundingClientRect();
            const relativeX = e.clientX - wrapperRect.left;
            showThumbnailAtTime(time, relativeX);
        }
        
        if (hoverTimeout) clearTimeout(hoverTimeout);
    });

    progressTrack.addEventListener('mouseleave', () => {
        if (isDragging) return; // Don't hide thumbnail while dragging
        hideThumbnail();
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    });

    // Click to seek (for non-drag clicks)
    progressTrack.addEventListener('click', (e) => {
        if (!video.duration || !isFinite(video.duration)) return;
        if (isDragging) return; // Already handled by drag
        
        e.stopPropagation();
        
        const rect = progressTrack.getBoundingClientRect();
        const percent = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        const seekTime = percent * video.duration;
        
        video.currentTime = seekTime;
        updateProgressUI(percent);
        
        // Auto-play if paused
        
        // if (video.paused) {
        //     video.play().catch(() => {});
        // }
    });
    // --- Volume controls ---
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            video.volume = parseFloat(volumeSlider.value);
            video.muted = false;
            updateVolIcon();
        });
    }
    if (volumeBtn) volumeBtn.addEventListener('click', () => { video.muted = !video.muted; updateVolIcon(); });
    if (mutedIndicator) mutedIndicator.addEventListener('click', () => {
        video.muted = false; video.volume = 1; if(volumeSlider) volumeSlider.value=1; updateVolIcon();
    });

    function updateVolIcon() {
        if (!volOnIcon || !volOffIcon || !mutedIndicator) return;
        const muted = video.muted || video.volume === 0;
        volOnIcon.style.display = muted ? 'none' : 'block';
        volOffIcon.style.display = muted ? 'block' : 'none';
        mutedIndicator.style.display = muted ? 'flex' : 'none';
    }

    // --- Other UI ---
    if (playBtn) playBtn.addEventListener('click', () => video.paused ? video.play() : video.pause());
    video.addEventListener('play', () => {
        if(playIcon) playIcon.style.display='none';
        if(pauseIcon) pauseIcon.style.display='block';
        setHeroState('playing');
    });
    video.addEventListener('pause', () => {
        if(playIcon) playIcon.style.display='block';
        if(pauseIcon) pauseIcon.style.display='none';
        if (!hlsInstance || hlsInstance.state !== 'loading') setHeroState('paused');
    });
    video.addEventListener('ended', () => setHeroState('paused'));

    video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (progressCurrent) progressCurrent.style.width = percent + '%';
        if (progressThumb) progressThumb.style.left = percent + '%';
        if (timeDisplay) timeDisplay.textContent = fmtTime(video.currentTime) + ' / ' + fmtTime(video.duration);
        if (video.buffered.length && progressLoaded && video.duration) {
            const bufferedEnd = video.buffered.end(video.buffered.length-1);
            progressLoaded.style.width = (bufferedEnd / video.duration) * 100 + '%';
        }
    });

    if (pipBtn) pipBtn.addEventListener('click', async () => {
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
        } catch(e) {}
    });
    if (theaterBtn && playerWrapper) theaterBtn.addEventListener('click', () => playerWrapper.classList.toggle('theater'));
    if (fullscreenBtn && playerWrapper) fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else playerWrapper.requestFullscreen().catch(()=>{});
    });

    // --- Timeline & Controls Auto-Hide/Show Behavior ---
    const controlsBar = document.getElementById('customControls');
    const progressContainer = document.getElementById('progressContainer');
    let controlsHideTimer;
    let isMouseOverVideo = false;

    // Create shadow overlays dynamically
    function createShadowOverlays() {
        if (!playerWrapper) return;
        
        // Remove existing overlays if any
        const existingOverlays = playerWrapper.querySelectorAll('.shadow-overlay');
        existingOverlays.forEach(overlay => overlay.remove());
        
        // Create top shadow overlay
        const topOverlay = document.createElement('div');
        topOverlay.className = 'shadow-overlay shadow-overlay-top';
        
        // Create bottom shadow overlay
        const bottomOverlay = document.createElement('div');
        bottomOverlay.className = 'shadow-overlay shadow-overlay-bottom';
        
        // Insert overlays into player wrapper
        playerWrapper.appendChild(topOverlay);
        playerWrapper.appendChild(bottomOverlay);
    }

    // Initialize shadow overlays
    createShadowOverlays();

    // Get references to shadow overlays
    const shadowOverlays = {
        top: playerWrapper?.querySelector('.shadow-overlay-top'),
        bottom: playerWrapper?.querySelector('.shadow-overlay-bottom')
    };

    function showControls() {
        if (controlsBar) {
            controlsBar.classList.remove('controls-hidden');
        }
        if (progressContainer) {
            progressContainer.style.opacity = '1';
        }
        if (playerWrapper) {
            playerWrapper.style.cursor = '';
        }
        
        // Show shadow overlays
        if (shadowOverlays.top) {
            shadowOverlays.top.classList.remove('shadow-overlay-hidden');
        }
        if (shadowOverlays.bottom) {
            shadowOverlays.bottom.classList.remove('shadow-overlay-hidden');
        }
        
        clearTimeout(controlsHideTimer);
    }

    function hideControls() {
        // Don't hide if video is paused
        if (video.paused) return;
        
        if (controlsBar) {
            controlsBar.classList.add('controls-hidden');
        }
        if (progressContainer) {
            progressContainer.style.opacity = '0';
        }
        
        // Hide shadow overlays
        if (shadowOverlays.top) {
            shadowOverlays.top.classList.add('shadow-overlay-hidden');
        }
        if (shadowOverlays.bottom) {
            shadowOverlays.bottom.classList.add('shadow-overlay-hidden');
        }
        
        // Hide cursor in fullscreen mode
        if (document.fullscreenElement === playerWrapper) {
            if (playerWrapper) {
                playerWrapper.style.cursor = 'none';
            }
        }
    }

    function resetControlsTimer() {
        clearTimeout(controlsHideTimer);
        
        // Only set timer if video is playing (not paused)
        if (!video.paused) {
            controlsHideTimer = setTimeout(hideControls, 3000);
        }
    }

    // Show controls on mouse movement within video container
    if (playerWrapper) {
        playerWrapper.addEventListener('mousemove', () => {
            showControls();
            resetControlsTimer();
        });
        
        // Hide controls when mouse leaves the video area
        playerWrapper.addEventListener('mouseleave', () => {
            isMouseOverVideo = false;
            if (!video.paused) {
                controlsHideTimer = setTimeout(hideControls, 1000); // Faster hide when mouse leaves
            }
        });
        
        // Show controls when mouse enters
        playerWrapper.addEventListener('mouseenter', () => {
            isMouseOverVideo = true;
            showControls();
            resetControlsTimer();
        });
    }

    // Handle play/pause events for controls visibility
    video.addEventListener('play', () => {
        // Start the auto-hide timer when video starts playing
        resetControlsTimer();
    });

    video.addEventListener('pause', () => {
        // Always show controls when paused
        showControls();
        // Clear any pending hide timer
        clearTimeout(controlsHideTimer);
    });

    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            // Exited fullscreen
            showControls();
            clearTimeout(controlsHideTimer);
            if (playerWrapper) {
                playerWrapper.style.cursor = '';
            }
        } else if (document.fullscreenElement === playerWrapper) {
            // Entered fullscreen
            showControls();
            resetControlsTimer();
        }
    });
    // --- Keyboard shortcuts ---
    document.addEventListener('keydown', e => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        switch(e.code) {
            case 'Space': case 'KeyK': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
            case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration||0, video.currentTime+5); break;
            case 'ArrowLeft':  e.preventDefault(); video.currentTime = Math.max(0, video.currentTime-5); break;
            case 'ArrowUp':    e.preventDefault(); video.volume = Math.min(1, video.volume+0.1); if(volumeSlider) volumeSlider.value=video.volume; updateVolIcon(); break;
            case 'ArrowDown':  e.preventDefault(); video.volume = Math.max(0, video.volume-0.1); if(volumeSlider) volumeSlider.value=video.volume; updateVolIcon(); break;
            case 'KeyM':       e.preventDefault(); video.muted = !video.muted; updateVolIcon(); break;
            case 'KeyF':       e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : playerWrapper?.requestFullscreen(); break;
        }
    });

    // --- Ambient canvas ---
    if (ambientCanvas && ambientCtx) {
        function drawAmbient() {
            if (video.paused || video.ended) return;
            try { ambientCtx.drawImage(video, 0, 0, ambientCanvas.width, ambientCanvas.height); requestAnimationFrame(drawAmbient); } catch(e){}
        }
        video.addEventListener('play', () => {
            ambientCanvas.width = Math.max(video.videoWidth/4, 100);
            ambientCanvas.height = Math.max(video.videoHeight/4, 56);
            drawAmbient();
        });
    }

    // --- Kick off player ---
    async function initPlayer() {
        const metadata = await fetchVideoMetadata();
        if (!metadata) {
            setHeroState('hidden');
            return;
        }
        await loadSpriteData(metadata);

        if (metadata.status === 'ready') {
            if (metadata.thumbnail_url) video.poster = metadata.thumbnail_url;
            showStatusMessage('ready');
            setHeroState('loading');
            loadHLSStream();
        } else if (metadata.status === 'processing') {
            showStatusMessage('processing');
            setHeroState('loading');
            tryConnectWebSocket();
        } else if (metadata.status === 'failed') {
            showStatusMessage('failed', metadata.processing_error || 'Transcoding error');
            setHeroState('hidden');
        } else {
            showStatusMessage('failed', 'Unknown video state');
            setHeroState('hidden');
        }
    }
    initPlayer();


    // ================================================================
    // 2. Original Page Features (like, subscribe, comments, share, etc.)
    //    All variables from original video.js that are not player‑related
    //    are kept below, without duplicating player controls.
    // ================================================================

    // Grab additional DOM elements used by the page features
    const subscribeBtn = document.getElementById('subscribeBtn');
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    const showDescBtn = document.getElementById('showDescBtn');
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortLabel = document.getElementById('sortLabel');
    const relatedList = document.getElementById('relatedList');
    const unsubscribePopup = document.getElementById('unsubscribePopup');
    const sharePopup = document.getElementById('sharePopup');
    const commentInput = document.getElementById('commentInput');
    const sendCommentBtn = document.getElementById('sendCommentBtn');
    const commentList = document.getElementById('commentList');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiMenu = document.getElementById('emojiMenu');
    const charCounter = document.getElementById('charCounter');
    const shareBtn = document.getElementById('shareBtn');
    const saveBtn = document.getElementById('saveBtn');
    const adBannerContainer = document.getElementById('adBannerContainer');
    const adCloseBtn = document.getElementById('adCloseBtn');
    const shareUrlInput = document.getElementById('shareUrlInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareReddit = document.getElementById('shareReddit');
    const shareCopyBtn = document.getElementById('shareCopyBtn');
    const unsubscribeConfirm = document.getElementById('confirmUnsubscribe');

    // Emoji list (static)
    const emojiList = ['happy.png','sad.png','shocked.png','like.png','dislike.png','thank.png','angry.png','stupid.png','ok.png','iran.png'];

    // ===== Like / Dislike =====
    let liked = false, disliked = false;
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (!liked) {
                liked = true; disliked = false;
                likeBtn.classList.add('liked'); dislikeBtn.classList.remove('disliked');
                likeCountSpan.textContent = '124K';
            } else {
                liked = false;
                likeBtn.classList.remove('liked');
                likeCountSpan.textContent = '123K';
            }
        });
    }
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
            if (!disliked) {
                disliked = true; liked = false;
                dislikeBtn.classList.add('disliked'); likeBtn.classList.remove('liked');
                likeCountSpan.textContent = '122K';
            } else {
                disliked = false;
                dislikeBtn.classList.remove('disliked');
                likeCountSpan.textContent = '123K';
            }
        });
    }

    // ===== Subscribe & Notification =====
    let subscribed = false;
    let notificationOn = true;
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            if (!subscribed) {
                subscribed = true;
                subscribeBtn.textContent = 'Subscribed';
                subscribeBtn.classList.add('subscribed');
                notificationBellBtn.style.display = 'flex';
                notificationOn = true;
                notificationBellBtn.classList.remove('active');
                window.showToast('Subscribed! 🎉');
            } else {
                if (typeof window.openPopup === 'function') {
                    window.openPopup(unsubscribePopup);
                }
            }
        });
    }
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', () => {
            notificationOn = !notificationOn;
            if (notificationOn) {
                notificationBellBtn.classList.remove('active');
                window.showToast('Notifications turned on');
            } else {
                notificationBellBtn.classList.add('active');
                window.showToast('Notifications turned off');
            }
        });
    }
    if (unsubscribeConfirm) {
        unsubscribeConfirm.addEventListener('click', () => {
            subscribed = false;
            subscribeBtn.textContent = 'Subscribe';
            subscribeBtn.classList.remove('subscribed');
            notificationBellBtn.style.display = 'none';
            if (typeof window.closeAllPopups === 'function') window.closeAllPopups();
            window.showToast('Unsubscribed');
        });
    }

    // ===== Save Button =====
    let saved = false;
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!saved) {
                saved = true;
                saveBtn.classList.add('saved');
                window.showToast('Saved to library');
            } else {
                saved = false;
                saveBtn.classList.remove('saved');
            }
        });
    }

    // ===== Share =====
    const currentUrl = window.location.href.split('?')[0];
    if (shareUrlInput) shareUrlInput.value = currentUrl;
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => window.showToast('Link copied!'));
    }
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (shareUrlInput) shareUrlInput.value = currentUrl;
            if (typeof window.openPopup === 'function') window.openPopup(sharePopup);
        });
    }
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => copyToClipboard(shareUrlInput.value));
    if (shareCopyBtn) shareCopyBtn.addEventListener('click', () => copyToClipboard(currentUrl));
    if (shareTwitter) {
        shareTwitter.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Check this video!')}`, '_blank');
        });
    }
    if (shareFacebook) {
        shareFacebook.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        });
    }
    if (shareReddit) {
        shareReddit.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}`, '_blank');
        });
    }

    // ===== Ad Banner Close =====
    if (adCloseBtn) {
        adCloseBtn.addEventListener('click', () => {
            adBannerContainer.style.display = 'none';
            window.showToast('Ad closed');
        });
    }

    // ===== Description Toggle =====
    if (showDescBtn && descPreview) {
        showDescBtn.addEventListener('click', () => {
            descPreview.classList.toggle('expanded');
            showDescBtn.textContent = descPreview.classList.contains('expanded') ? 'Show less' : 'Show more';
        });
    }

    // ===== Hashtag Highlighting =====
    function highlightHashtags(el) {
        if (!el) return;
        el.innerHTML = el.innerText.replace(/#[\w\u0600-\u06FF]+/g, m => `<span class="hashtag">${m}</span>`);
    }
    if (descPreview) highlightHashtags(descPreview);

    // ===== Sort =====
    if (sortBtn && sortDropdown) {
        sortBtn.addEventListener('click', () => sortDropdown.classList.toggle('active'));
        sortDropdown.querySelectorAll('button').forEach(b => {
            b.addEventListener('click', () => {
                sortLabel.textContent = b.dataset.sort === 'top' ? 'Top comments' : 'Newest first';
                sortDropdown.classList.remove('active');
            });
        });
        document.addEventListener('click', (e) => { if (!sortDropdown.contains(e.target) && e.target !== sortBtn) sortDropdown.classList.remove('active'); });
    }

    // ===== Emoji Replacement =====
    function replaceEmojis(text) {
        return text.replace(/:([a-zA-Z]+):/g, (match, name) => {
            const filename = name + '.png';
            if (emojiList.includes(filename)) {
                return `<img src="assets/emoji/${filename}" alt="${name}" class="emoji-inline">`;
            }
            return match;
        });
    }

    // ===== Comment Character Counter =====
    if (commentInput && charCounter) {
        commentInput.addEventListener('input', () => {
            const len = commentInput.value.length;
            charCounter.textContent = `${len} / 400`;
            charCounter.style.color = len >= 400 ? '#ff4444' : 'var(--text-secondary)';
        });
    }

    // ===== Emoji Menu =====
    if (emojiMenu) {
        emojiList.forEach(filename => {
            const img = document.createElement('img');
            img.src = `assets/emoji/${filename}`;
            img.alt = filename.split('.')[0];
            img.title = img.alt;
            img.addEventListener('click', () => {
                commentInput.value += `:${img.alt}:`;
                emojiMenu.classList.remove('active');
                commentInput.dispatchEvent(new Event('input'));
                commentInput.focus();
            });
            emojiMenu.appendChild(img);
        });
    }
    if (emojiBtn) {
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiMenu.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if (emojiMenu && !emojiMenu.contains(e.target) && e.target !== emojiBtn) emojiMenu.classList.remove('active');
    });

    // ===== Send Comment with verification badge =====
    function addComment(author, time, text, verified = false) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.setAttribute('data-comment-id', Date.now());
        const formattedText = replaceEmojis(text);
        const verifiedBadge = verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>` : '';
        div.innerHTML = `
            <div class="comment-avatar">${author[0]}</div>
            <div class="comment-body">
                <div class="comment-author">${author}${verifiedBadge} <span class="comment-time">${time}</span></div>
                <p>${formattedText}</p>
                <div class="comment-actions-row">
                    <button class="comment-action-btn like-comment-btn">👍<span>0</span></button>
                    <button class="comment-action-btn">👎</button>
                    <button class="comment-action-btn reply-toggle-btn">Reply</button>
                </div>
                <div class="reply-form" style="display:none;">
                    <input type="text" class="reply-input" placeholder="Write a reply..." maxlength="400">
                    <button class="reply-send-btn">Reply</button>
                </div>
                <div class="reply-list"></div>
            </div>
        `;
        commentList.prepend(div);
        attachCommentListeners(div);
    }

    function attachCommentListeners(commentEl) {
        const toggleBtn = commentEl.querySelector('.reply-toggle-btn');
        const replyForm = commentEl.querySelector('.reply-form');
        const replyInput = commentEl.querySelector('.reply-input');
        const replySendBtn = commentEl.querySelector('.reply-send-btn');
        const replyList = commentEl.querySelector('.reply-list');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
            });
        }

        const sendReply = () => {
            const replyText = replyInput.value.trim();
            if (replyText) {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'comment';
                replyDiv.style.marginLeft = '20px';
                replyDiv.innerHTML = `
                    <div class="comment-avatar">U</div>
                    <div class="comment-body">
                        <div class="comment-author">You <span class="comment-time">Just now</span></div>
                        <p>${replaceEmojis(replyText)}</p>
                    </div>
                `;
                replyList.appendChild(replyDiv);
                replyInput.value = '';
                replyForm.style.display = 'none';
            }
        };

        if (replySendBtn) replySendBtn.addEventListener('click', sendReply);
        if (replyInput) replyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendReply(); });
    }

    function sendComment() {
        const text = commentInput.value.trim();
        if (!text) return;
        if (text.length > 400) {
            window.showToast('Comment too long (max 400 characters)');
            return;
        }
        addComment('You', 'Just now', text, true);
        commentInput.value = '';
        commentInput.dispatchEvent(new Event('input'));
    }

    if (sendCommentBtn) sendCommentBtn.addEventListener('click', sendComment);
    if (commentInput) commentInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } });

    // Attach listeners to existing static comments (if any)
    document.querySelectorAll('.comment').forEach(c => attachCommentListeners(c));

    // ===== Related Videos =====
    if (relatedList) {
        const relatedVideosData = Array.from({ length: 10 }, (_, i) => ({
            title: `Related Video ${i + 1}`,
            channel: `Channel ${i + 1}`,
            views: `${Math.floor(Math.random() * 500) + 10}K`,
            time: `${Math.floor(Math.random() * 4) + 1} days ago`
        }));
        relatedList.innerHTML = relatedVideosData.map(v => `
            <div class="related-card">
                <div class="related-thumb" style="background-image:url(assets/thumbnail.png)"></div>
                <div class="related-info">
                    <div class="title">${v.title}</div>
                    <div class="meta">${v.channel}</div>
                    <div class="meta">${v.views} views · ${v.time}</div>
                </div>
            </div>
        `).join('');
    }

})();