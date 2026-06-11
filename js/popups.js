// popups.js – Handles popup forms and UI interactions
// Includes WebSocket with first-message auth (works with HttpOnly cookies)
(function() {
    const MAX_CHARS = 5000;
    const MAX_TAGS = 500;
    let tags = [];
    
    let activeWebSocket = null;
    let uploadInProgress = false;
    let wsToken = null; // Cached WebSocket token
    let wsTokenExpiry = 0; // Timestamp when token expires

    // ===== Helper Functions =====
    function clearFormErrors(form) {
        form.querySelectorAll('.input-group__error').forEach(el => el.textContent = '');
    }
    function showFieldError(form, message, fieldId = null) {
        let target;
        if (fieldId) {
            const input = document.getElementById(fieldId);
            target = input?.closest('.input-group')?.querySelector('.input-group__error');
        } else {
            target = form.querySelector('.input-group__error');
        }
        if (target) target.textContent = message;
        else window.showToast(message);
    }
    
    function closeWebSocket() {
        if (activeWebSocket) {
            activeWebSocket.close();
            activeWebSocket = null;
        }
    }

    /**
     * Fetch a short-lived WebSocket token from the backend.
     * Works with HttpOnly cookies because the browser sends them automatically.
     */
    async function getWebSocketToken() {
        // Return cached token if still valid (with 30-second buffer)
        if (wsToken && Date.now() < wsTokenExpiry - 30000) {
            return wsToken;
        }
        
        try {
            const response = await window.fetch(`${API_BASE}/videos/ws-token`);
            
            if (!response.ok) {
                console.error('Failed to fetch WebSocket token:', response.status);
                return null;
            }
            
            const data = await response.json();
            wsToken = data.token;
            wsTokenExpiry = Date.now() + (data.expires_in * 1000);
            
            console.log('WebSocket token obtained (expires in', data.expires_in, 's)');
            return wsToken;
        } catch (err) {
            console.error('Error fetching WebSocket token:', err);
            return null;
        }
    }

    function showTopNotification(message, videoId) {
        const existing = document.getElementById('video-ready-notification');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'video-ready-notification';
        bar.innerHTML = `
            <div class="video-ready-notification-content">
                <span>✅ ${message}</span>
                <div class="notification-actions">
                    <a href="/video.php/${videoId}" class="btn btn-primary btn-sm">Watch Now</a>
                    <button class="btn-close-notification" aria-label="Close">✕</button>
                </div>
            </div>
        `;

        Object.assign(bar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            zIndex: '10000',
            background: '#2e7d32',
            color: 'white',
            padding: '12px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'slideDown 0.3s ease-out'
        });

        document.body.prepend(bar);

        const closeBtn = bar.querySelector('.btn-close-notification');
        closeBtn.addEventListener('click', () => {
            bar.style.animation = 'slideUp 0.3s ease-in';
            bar.addEventListener('animationend', () => bar.remove());
        });

        setTimeout(() => {
            if (bar.parentNode) {
                bar.style.animation = 'slideUp 0.3s ease-in';
                bar.addEventListener('animationend', () => bar.remove());
            }
        }, 30000);
    }

    function injectNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            @keyframes slideUp {
                from { transform: translateY(0); }
                to { transform: translateY(-100%); }
            }
            .video-ready-notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 1200px;
            }
            .notification-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .btn-close-notification {
                background: transparent;
                border: none;
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                padding: 0 5px;
            }
        `;
        document.head.appendChild(style);
    }

    injectNotificationStyles();

    // ===== WebSocket with First-Message Authentication =====
    async function connectToVideoStatus(videoId, onReady, onError) {
        closeWebSocket();

        // Fetch token from backend (works with HttpOnly cookies)
        const token = await getWebSocketToken();
        if (!token) {
            console.error('Failed to get WebSocket token');
            if (onError) onError('Not authenticated');
            return;
        }

        try {
            const apiUrl = new URL(API_BASE);
            const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${apiUrl.host}/videos/ws/video/${videoId}`;

            console.log('Connecting to WebSocket:', wsUrl);
            const ws = new WebSocket(wsUrl);
            activeWebSocket = ws;

            let authTimeout;
            let authenticated = false;

            ws.onopen = () => {
                console.log('WebSocket connected, sending auth...');
                
                // Send auth token as first message
                ws.send(JSON.stringify({
                    type: "auth",
                    token: token
                }));
                
                authTimeout = setTimeout(() => {
                    if (!authenticated) {
                        console.error('WebSocket authentication timeout');
                        ws.close();
                        if (onError) onError('Authentication timeout');
                    }
                }, 5000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message:', data);

                    if (data.type === 'auth_ok') {
                        clearTimeout(authTimeout);
                        authenticated = true;
                        console.log('WebSocket authenticated');
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = 'Processing video...';
                            statusElement.className = 'upload-status processing';
                        }
                        return;
                    }
                    
                    if (data.type === 'auth_error') {
                        clearTimeout(authTimeout);
                        console.error('WebSocket auth failed:', data.message);
                        ws.close();
                        if (onError) onError(data.message || 'Authentication failed');
                        return;
                    }

                    if (!authenticated) {
                        console.warn('Received message before auth, ignoring');
                        return;
                    }

                    if (data.type === 'video.ready' && data.videoId === videoId) {
                        console.log('Video ready!');
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = 'Video ready for playback!';
                            statusElement.className = 'upload-status success';
                        }
                        
                        closeWebSocket();
                        if (onReady) onReady(videoId);
                    } 
                    else if (data.type === 'video.error') {
                        console.error('Video error:', data.error);
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = `Processing failed: ${data.error}`;
                            statusElement.className = 'upload-status error';
                        }
                        
                        closeWebSocket();
                        window.showToast(`❌ Video processing failed: ${data.error}`);
                        if (onError) onError(data.error);
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                clearTimeout(authTimeout);
                
                const statusElement = document.getElementById('uploadStatus');
                if (statusElement) {
                    statusElement.textContent = 'Connection error';
                    statusElement.className = 'upload-status error';
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                clearTimeout(authTimeout);
                
                // Don't reconnect on auth failures or intentional closes
                if (event.code !== 1000 && event.code !== 1005 && event.code !== 4001 && activeWebSocket === ws) {
                    console.log('Unexpected close, reconnecting...');
                    setTimeout(() => {
                        if (activeWebSocket === ws) {
                            connectToVideoStatus(videoId, onReady, onError);
                        }
                    }, 3000);
                }
            };
        } catch (err) {
            console.error('Invalid API_BASE:', err);
            if (onError) onError('Invalid API configuration');
        }
    }
    
    function showUploadProgress(show, status = 'uploading') {
        const progressContainer = document.getElementById('progressContainer');
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (progressContainer) {
            progressContainer.style.display = show ? 'flex' : 'none';
        }
        
        if (uploadStatus) {
            if (show) {
                uploadStatus.style.display = 'block';
                uploadStatus.textContent = status === 'uploading' ? 'Uploading video...' : 'Processing video...';
                uploadStatus.className = `upload-status ${status}`;
            } else {
                uploadStatus.style.display = 'none';
            }
        }
    }

    // ===== Auth Forms =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors(loginForm);
            const username = document.getElementById('loginUsername')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            if (!username || !password) {
                showFieldError(loginForm, 'Please fill all fields');
                return;
            }
            try {
                await window.loginUser({ username, password });
                window.closeAllPopups();
                await window.fetchCurrentUser();
                if (!window.currentUser) {
                    window.showToast('Could not load user data, but you are logged in.');
                } else {
                    window.showToast(`Welcome back, ${window.currentUser.username}!`);
                }
            } catch (err) {
                const msg = err.message.includes('Invalid') ? 'Invalid username or password' : 'Login failed';
                showFieldError(loginForm, msg);
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors(signupForm);
            const username = document.getElementById('signupUsername')?.value.trim();
            const email = document.getElementById('signupEmail')?.value.trim();
            const password = document.getElementById('signupPassword')?.value;
            const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
            if (!username || !email || !password || !confirmPassword) {
                showFieldError(signupForm, 'All required fields must be filled');
                return;
            }
            if (password !== confirmPassword) {
                showFieldError(signupForm, 'Passwords do not match', 'signupPassword');
                return;
            }
            if (password.length < 6) {
                showFieldError(signupForm, 'Password must be at least 6 characters', 'signupPassword');
                return;
            }
            try {
                await window.registerUser({ username, email, password, confirm_password: confirmPassword });
                window.closeAllPopups();
                window.openPopupById('loginPopup');
                window.showToast('Account created! Please log in.');
            } catch (err) {
                let errorMsg = err.message;
                if (errorMsg.includes('Username already registered')) errorMsg = 'Username already exists';
                else if (errorMsg.includes('Email already registered')) errorMsg = 'Email already exists';
                showFieldError(signupForm, errorMsg);
            }
        });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail')?.value.trim();
            if (email) {
                window.showToast('If this email exists, you will receive a reset link (feature coming soon).');
                window.closeAllPopups();
                window.openPopupById('loginPopup');
            } else {
                showFieldError(forgotForm, 'Email is required');
            }
        });
    }

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        window.closeAllPopups();
        if (action === 'switchToSignup') window.openPopupById('signupPopup');
        else if (action === 'switchToLogin') window.openPopupById('loginPopup');
        else if (action === 'forgotPassword') window.openPopupById('forgotPopup');
        else if (action === 'backToLogin') window.openPopupById('loginPopup');
    });

    function uploadFileWithProgress(url, file, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent, event.loaded, event.total);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
        });
    }

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (uploadInProgress) {
                window.showToast('Upload already in progress...');
                return;
            }

            if (!window.currentUser) {
                window.showToast('Please log in to upload videos.');
                window.openPopupById('loginPopup');
                return;
            }

            const title = document.getElementById('videoTitle')?.value.trim();
            if (!title) {
                window.showToast('Please enter a video title.');
                return;
            }
            const descriptionDiv = document.getElementById('videoDescription');
            const description = descriptionDiv?.innerText || '';
            const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
            const visibility = visibilityRadio ? visibilityRadio.value : 'public';
            const scheduleInput = document.getElementById('schedule');
            let scheduled_at = scheduleInput?.value ? new Date(scheduleInput.value).toISOString() : null;

            const audienceRadio = document.querySelector('input[name="audience"]:checked');
            let is_made_for_kids = false;
            if (audienceRadio) {
                if (audienceRadio.value === 'kids') is_made_for_kids = true;
                else if (audienceRadio.value === 'not-kids') is_made_for_kids = false;
            }

            const language = document.getElementById('language')?.value || 'en';
            const categorySelect = document.getElementById('category');
            const category_id = categorySelect ? parseInt(categorySelect.value) || null : null;
            const licenseRadio = document.querySelector('input[name="license"]:checked');
            const license = licenseRadio ? licenseRadio.value : 'standard';
            const commentsRadio = document.querySelector('input[name="comments"]:checked');
            let allow_comments = true;
            if (commentsRadio) {
                if (commentsRadio.value === 'allow') allow_comments = true;
                else if (commentsRadio.value === 'hide') allow_comments = false;
                else allow_comments = true;
            }

            const tagsList = tags;

            const videoFileInput = document.getElementById('videoFileInput');
            const videoFile = videoFileInput?.files[0];
            if (!videoFile) {
                window.showToast('Please select a video file.');
                return;
            }
            if (videoFile.size > 500 * 1024 * 1024) {
                window.showToast('File too large. Max 500MB.');
                return;
            }
            if (!videoFile.type.startsWith('video/')) {
                window.showToast('File must be a video.');
                return;
            }

            const thumbInput = document.getElementById('thumbUploadInput');
            const thumbnailFile = thumbInput?.files[0] || null;

            const progressContainer = document.getElementById('progressContainer');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const uploadStatus = document.getElementById('uploadStatus');
            
            if (progressContainer) progressContainer.style.display = 'flex';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
            if (uploadStatus) {
                uploadStatus.style.display = 'block';
                uploadStatus.textContent = 'Preparing upload...';
                uploadStatus.className = 'upload-status uploading';
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            uploadInProgress = true;

            let upload_url = null;
            let object_key = null;

            try {
                const filenameEncoded = encodeURIComponent(videoFile.name);
                const presignedResponse = await window.fetch(
                    `${API_BASE}/videos/upload-url?filename=${filenameEncoded}`
                );

                if (!presignedResponse.ok) {
                    let errMsg = `Server error (${presignedResponse.status})`;
                    try {
                        const errorBody = await presignedResponse.json();
                        if (Array.isArray(errorBody.detail)) {
                            errMsg = errorBody.detail.map(e => e.msg).join('. ');
                        } else if (typeof errorBody.detail === 'string') {
                            errMsg = errorBody.detail;
                        }
                    } catch (_) {}
                    if (presignedResponse.status === 401) {
                        errMsg = 'You are not logged in. Please log in again.';
                    }
                    throw new Error(errMsg);
                }

                const data = await presignedResponse.json();
                upload_url = data.upload_url;
                object_key = data.object_key;
                console.log('Presigned URL obtained:', upload_url);

                if (uploadStatus) uploadStatus.textContent = 'Uploading video...';
                await uploadFileWithProgress(
                    upload_url,
                    videoFile,
                    (percent, loaded, total) => {
                        if (progressFill) progressFill.style.width = percent + '%';
                        if (progressText) {
                            const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
                            const totalMB = (total / (1024 * 1024)).toFixed(1);
                            progressText.textContent = `${percent}% (${loadedMB}MB / ${totalMB}MB)`;
                        }
                    }
                );

                let thumbnail_key = null;
                if (thumbnailFile) {
                    if (uploadStatus) uploadStatus.textContent = 'Uploading thumbnail...';
                    const thumbResp = await fetch(`${API_BASE}/videos/thumbnail-upload-url?filename=${encodeURIComponent(thumbnailFile.name)}&content_type=${encodeURIComponent(thumbnailFile.type || 'image/jpeg')}`);
                    if (thumbResp.ok) {
                        const thumbData = await thumbResp.json();
                        await uploadFileWithProgress(thumbData.upload_url, thumbnailFile);
                        thumbnail_key = thumbData.object_key;
                    } else {
                        console.warn('Thumbnail upload URL request failed');
                    }
                }

                if (uploadStatus) uploadStatus.textContent = 'Starting video processing...';
                const completePayload = {
                    title,
                    description: description || null,
                    original_filename: videoFile.name,
                    file_size: videoFile.size,
                    mime_type: videoFile.type,
                    object_key,
                    visibility,
                    category_id,
                    language,
                    allow_comments,
                    is_made_for_kids,
                    is_short: false,
                    scheduled_at,
                    license,
                    tags: tagsList,
                    thumbnail_key
                };

                const completeResponse = await fetch(`${API_BASE}/videos/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(completePayload)
                });

                if (!completeResponse.ok) {
                    let errData;
                    try { errData = await completeResponse.json(); } catch (_) { }
                    throw new Error(errData?.detail || `Confirmation failed (${completeResponse.status})`);
                }

                const completeData = await completeResponse.json();
                console.log('Upload complete, video ID:', completeData.video_id);
                
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
                
                window.showToast(`✅ Upload complete! Video ID: ${completeData.video_id} – Processing started.`);
                
                if (uploadStatus) {
                    uploadStatus.textContent = 'Processing video... This may take a few minutes.';
                    uploadStatus.className = 'upload-status processing';
                }
                
                // Connect to WebSocket for real-time updates
                connectToVideoStatus(
                    completeData.public_id,
                    async (videoId) => {
                        console.log('Video ready:', videoId);
                        
                        try {
                            const signedUrlResponse = await fetch(
                                `${API_BASE}/videos/${videoId}/signed-url`
                            );
                            if (signedUrlResponse.ok) {
                                const signedUrlData = await signedUrlResponse.json();
                                window.lastSignedUrl = signedUrlData.signed_url;
                            }
                        } catch (err) {
                            console.error('Error fetching signed URL:', err);
                        }
                        
                        showTopNotification('Your video is ready!', videoId);
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.innerHTML = `
                                <div class="processing-complete">
                                    <span>✅ Video ready!</span>
                                    <button onclick="window.location.href='/video.php/${videoId}'" class="btn btn-primary btn-sm">
                                        Watch Now
                                    </button>
                                </div>
                            `;
                            statusElement.className = 'upload-status success';
                        }
                        
                        uploadForm.reset();
                        if (descriptionDiv) descriptionDiv.innerHTML = '';
                        if (document.getElementById('descCounter')) document.getElementById('descCounter').textContent = '0 / 5000';
                        tags = [];
                        renderTags();
                        const videoFileNameSpan = document.getElementById('videoFileName');
                        if (videoFileNameSpan) videoFileNameSpan.textContent = 'Click to select a video file';
                        if (typeof window.fetchCurrentUser === 'function') window.fetchCurrentUser();
                        
                        uploadInProgress = false;
                        if (submitBtn) submitBtn.disabled = false;
                        
                        setTimeout(() => {
                            const statusEl = document.getElementById('uploadStatus');
                            if (statusEl) statusEl.style.display = 'none';
                        }, 10000);
                    },
                    (error) => {
                        console.error('Video failed:', error);
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = `Processing failed: ${error}`;
                            statusElement.className = 'upload-status error';
                        }
                        uploadInProgress = false;
                        if (submitBtn) submitBtn.disabled = false;
                    }
                );
                
            } catch (err) {
                console.error('Upload error:', err);
                window.showToast(`Upload failed: ${err.message}`);
                
                const statusElement = document.getElementById('uploadStatus');
                if (statusElement) {
                    statusElement.textContent = `Upload failed: ${err.message}`;
                    statusElement.className = 'upload-status error';
                }
                
                uploadInProgress = false;
                if (submitBtn) submitBtn.disabled = false;
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
            }
        });
    }

    // ===== Short Video Upload =====
    const shortForm = document.getElementById('shortForm');
    if (shortForm) {
        shortForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('shortTitle')?.value.trim();
            if (!title) { window.showToast('Please enter a title.'); return; }
            const shortFile = document.getElementById('shortFileInput');
            if (shortFile && shortFile.files.length === 0) { window.showToast('Please select a short video.'); return; }
            window.showToast('Short published! (backend integration coming soon)');
            window.closeAllPopups();
            shortForm.reset();
            const shortFileName = document.getElementById('shortFileName');
            if (shortFileName) shortFileName.textContent = 'Click to select a short video';
        });
    }

    // ===== Community Post Popup =====
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = document.getElementById('postContent')?.value.trim();
            if (!content) { window.showToast('Please write something.'); return; }
            window.showToast('Post published!');
            window.closeAllPopups();
            postForm.reset();
            const postImageName = document.getElementById('postImageName');
            if (postImageName) postImageName.textContent = 'Click to add an image';
        });
    }

    // ===== Description Editor =====
    const descDiv = document.getElementById('videoDescription');
    const descCounter = document.getElementById('descCounter');
    if (descDiv) {
        function getCursorOffset(container) {
            const sel = window.getSelection();
            if (sel.rangeCount === 0) return 0;
            const range = sel.getRangeAt(0).cloneRange();
            range.selectNodeContents(container);
            range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
            return range.toString().length;
        }
        function setCursorOffset(container, offset) {
            const sel = window.getSelection();
            const range = document.createRange();
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
            let node, currentPos = 0;
            while ((node = walker.nextNode())) {
                const len = node.textContent.length;
                if (currentPos + len >= offset) {
                    range.setStart(node, offset - currentPos);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return;
                }
                currentPos += len;
            }
            range.selectNodeContents(container);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        function highlightHashtagsInElement(el) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (/#[\w\u0600-\u06FF]+/g.test(node.textContent)) nodesToReplace.push(node);
            }
            nodesToReplace.forEach(textNode => {
                const fragment = document.createDocumentFragment();
                const text = textNode.textContent;
                const regex = /#[\w\u0600-\u06FF]+/g;
                let lastIdx = 0, match;
                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIdx) fragment.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
                    const span = document.createElement('span');
                    span.className = 'hashtag';
                    span.textContent = match[0];
                    fragment.appendChild(span);
                    lastIdx = regex.lastIndex;
                }
                if (lastIdx < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
                textNode.parentNode.replaceChild(fragment, textNode);
            });
        }
        function enforceMaxLength() {
            let text = descDiv.innerText;
            if (text.length > MAX_CHARS) {
                descDiv.innerText = text.substring(0, MAX_CHARS);
                setCursorOffset(descDiv, MAX_CHARS);
            }
            descCounter.textContent = `${descDiv.innerText.length} / ${MAX_CHARS}`;
        }
        descDiv.addEventListener('input', () => {
            const cursorPos = getCursorOffset(descDiv);
            enforceMaxLength();
            descDiv.querySelectorAll('.hashtag').forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
            highlightHashtagsInElement(descDiv);
            setCursorOffset(descDiv, cursorPos);
        });
    }

    // ===== Thumbnail & Video UI =====
    const thumbUploadArea = document.getElementById('thumbUploadArea');
    const thumbUploadInput = document.getElementById('thumbUploadInput');
    if (thumbUploadArea) thumbUploadArea.addEventListener('click', () => thumbUploadInput.click());
    if (thumbUploadInput) thumbUploadInput.addEventListener('change', () => {
        if (thumbUploadInput.files[0]) window.showToast('Thumbnail selected.');
    });
    const chooseFrameBtn = document.getElementById('chooseFrameBtn');
    if (chooseFrameBtn) chooseFrameBtn.addEventListener('click', () => window.showToast('Frame selection coming soon.'));

    const videoFileArea = document.getElementById('videoFileArea');
    const videoFileInput = document.getElementById('videoFileInput');
    const videoFileName = document.getElementById('videoFileName');
    if (videoFileArea) videoFileArea.addEventListener('click', () => videoFileInput.click());
    if (videoFileInput) {
        videoFileInput.addEventListener('change', () => {
            if (videoFileInput.files[0]) {
                videoFileName.textContent = videoFileInput.files[0].name;
            } else {
                videoFileName.textContent = 'Click to select a video file';
                const progressContainer = document.getElementById('progressContainer');
                if (progressContainer) progressContainer.style.display = 'none';
            }
        });
    }

    const shortFileArea = document.getElementById('shortFileArea');
    const shortFileInput = document.getElementById('shortFileInput');
    if (shortFileArea) shortFileArea.addEventListener('click', () => shortFileInput.click());
    if (shortFileInput) {
        shortFileInput.addEventListener('change', () => {
            const shortFileName = document.getElementById('shortFileName');
            if (shortFileName) shortFileName.textContent = shortFileInput.files[0] ? shortFileInput.files[0].name : 'Click to select a short video';
        });
    }

    const postImageArea = document.getElementById('postImageArea');
    const postImageInput = document.getElementById('postImageInput');
    if (postImageArea) postImageArea.addEventListener('click', () => postImageInput.click());
    if (postImageInput) {
        postImageInput.addEventListener('change', () => {
            const postImageName = document.getElementById('postImageName');
            if (postImageName) postImageName.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Click to add an image';
        });
    }

    // ===== Tags System =====
    const tagDisplay = document.getElementById('tagDisplay');
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagCounterSpan = document.getElementById('tagCounter');
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    function renderTags() {
        if (!tagDisplay) return;
        tagDisplay.innerHTML = tags.map((t, i) => `<span class="tag-chip">${escapeHtml(t)}<button type="button" data-index="${i}">×</button></span>`).join('');
        if (tagCounterSpan) tagCounterSpan.textContent = `${tags.length} / ${MAX_TAGS} tags`;
        document.querySelectorAll('.tag-chip button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                tags.splice(idx, 1);
                renderTags();
            });
        });
    }
    function addTag(text) {
        text = text.trim();
        if (text === '' || tags.includes(text) || tags.length >= MAX_TAGS) return;
        tags.push(text);
        renderTags();
        if (tagInput) tagInput.value = '';
    }
    if (tagInput && addTagBtn) {
        tagInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.value); } });
        addTagBtn.addEventListener('click', () => addTag(tagInput.value));
        tagInput.addEventListener('keyup', (e) => { if (e.key === ',') addTag(tagInput.value.replace(',', '')); });
    }

    // ===== Avatar Preview =====
    const avatarUploadArea = document.getElementById('avatarUpload');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarUploadArea) avatarUploadArea.addEventListener('click', () => avatarInput.click());
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && avatarPreview) {
                const reader = new FileReader();
                reader.onload = ev => avatarPreview.innerHTML = `<img src="${ev.target.result}">`;
                reader.readAsDataURL(file);
            }
        });
    }
    
    // ===== Cleanup =====
    window.addEventListener('beforeunload', () => {
        closeWebSocket();
    });
})();