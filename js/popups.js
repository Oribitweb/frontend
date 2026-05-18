// popups.js – Handles popup forms and UI interactions (UPDATED WITH TABS)
(function() {
    const MAX_CHARS = 5000;
    const MAX_TAGS = 500;
    let tags = [];

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

    // ===== Switch between popups =====
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

    // ===== Helper: upload with progress (PUT method for presigned URLs) =====
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

    // ========== NEW TABS FUNCTIONALITY ==========
    let selectedGame = null;
    let cards = [];
    let endScreenElements = [];
    let selectedPlaylist = '';
    let adMarkers = [];
    let videoFileForPreview = null;

    // Helper to get game categories (from window.ORBIT_CATEGORIES or fallback)
    function getGameCategories() {
        if (window.ORBIT_CATEGORIES && Array.isArray(window.ORBIT_CATEGORIES)) {
            return window.ORBIT_CATEGORIES;
        }
        // Fallback static categories
        return [
            { name: "Counter Strike 2", viewers: 492 },
            { name: "PUBG MOBILE", viewers: 532 },
            { name: "Open Front", viewers: 0 },
            { name: "Dota 2", viewers: 81 },
            { name: "Minecraft", viewers: 6000.9 },
            { name: "Call of Duty Mobile", viewers: 9.5 },
            { name: "Just Chatting", viewers: 58.5 },
            { name: "FiveM", viewers: 1000.5 },
            { name: "Music", viewers: 0.5 },
            { name: "Science", viewers: 0.5 }
        ];
    }

    function renderGameList(filter = '') {
        const games = getGameCategories();
        const filtered = games.filter(g => g.name.toLowerCase().includes(filter.toLowerCase()));
        const gameListDiv = document.getElementById('gameList');
        if (!gameListDiv) return;
        gameListDiv.innerHTML = filtered.map(game => {
            const slug = game.name.toLowerCase().replace(/\s+/g, '');
            const thumbUrl = `assets/categories/${slug}.webp`;
            const isSelected = selectedGame === game.name;
            return `
                <div class="game-item" data-game="${escapeHtml(game.name)}" style="display: flex; align-items: center; gap: 12px; padding: 8px; margin-bottom: 6px; border-radius: 8px; background: ${isSelected ? 'var(--accent-glow)' : 'transparent'}; cursor: pointer; transition: background 0.2s;">
                    <img src="${thumbUrl}" alt="${escapeHtml(game.name)}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                    <span><strong>${escapeHtml(game.name)}</strong><br><small>${game.viewers} viewers</small></span>
                </div>
            `;
        }).join('');
        // attach click events
        document.querySelectorAll('.game-item').forEach(el => {
            el.addEventListener('click', () => {
                selectedGame = el.dataset.game;
                document.getElementById('selectedGameName').innerText = selectedGame;
                renderGameList(document.getElementById('gameSearchInput')?.value || '');
            });
        });
    }

    function toggleGameTab() {
        const categorySelect = document.getElementById('category');
        const gameTab = document.getElementById('tab-game');
        if (categorySelect && gameTab) {
            const isGaming = categorySelect.value === 'gaming';
            gameTab.style.display = isGaming ? 'block' : 'none';
            if (isGaming && !selectedGame) {
                const games = getGameCategories();
                if (games.length) selectedGame = games[0].name;
                document.getElementById('selectedGameName').innerText = selectedGame || 'None';
                renderGameList();
            }
        }
    }

    // Cards & End Screen
    function renderCards() {
        const container = document.getElementById('cardsList');
        if (!container) return;
        container.innerHTML = cards.map((card, idx) => `
            <div class="card-item" style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); border-radius: 8px; padding: 8px 12px; margin-bottom: 8px;">
                <span><strong>${card.type === 'subscribe' ? 'Subscribe' : card.type === 'video' ? 'Recommended Video' : 'Channel Link'}</strong> @ ${card.timestamp}s</span>
                <button type="button" class="remove-card" data-index="${idx}" style="background: none; border: none; color: #ff4444; cursor: pointer;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `);
        document.querySelectorAll('.remove-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                cards.splice(idx, 1);
                renderCards();
            });
        });
    }

    function renderEndScreen() {
        const container = document.getElementById('endScreenElements');
        if (!container) return;
        container.innerHTML = endScreenElements.map((el, idx) => `
            <div class="endscreen-item" style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); border-radius: 8px; padding: 8px 12px; margin-bottom: 8px;">
                <span>${el.type === 'subscribe' ? 'Subscribe' : el.type === 'video' ? 'Best for viewer video' : 'Playlist'}</span>
                <button type="button" class="remove-endscreen" data-index="${idx}" style="background: none; border: none; color: #ff4444; cursor: pointer;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `);
        document.querySelectorAll('.remove-endscreen').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                endScreenElements.splice(idx, 1);
                renderEndScreen();
            });
        });
    }

    // Playlist
    function updatePlaylistInfo() {
        const select = document.getElementById('playlistSelect');
        const newName = document.getElementById('newPlaylistName');
        if (select && newName) {
            const final = select.value ? select.options[select.selectedIndex]?.text : (newName.value.trim() || 'None');
            document.getElementById('finalPlaylistName').innerText = final;
        }
    }

    // Ad timeline
    function initAdPreview() {
        const videoInput = document.getElementById('videoFileInput');
        const adVideo = document.getElementById('adPreviewVideo');
        if (videoInput && adVideo) {
            videoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('video/')) {
                    videoFileForPreview = file;
                    const url = URL.createObjectURL(file);
                    adVideo.src = url;
                    adVideo.load();
                    adVideo.onloadedmetadata = () => {
                        const duration = adVideo.duration;
                        document.getElementById('adDuration').innerText = formatTime(duration);
                    };
                }
            });
        }
        const timelineTrack = document.querySelector('.ad-timeline-track');
        if (timelineTrack) {
            timelineTrack.addEventListener('click', (e) => {
                if (!adVideo || !adVideo.duration) return;
                const rect = timelineTrack.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const time = percent * adVideo.duration;
                adVideo.currentTime = time;
            });
        }
        adVideo?.addEventListener('timeupdate', () => {
            if (adVideo.duration) {
                const percent = (adVideo.currentTime / adVideo.duration) * 100;
                document.querySelector('.ad-progress-fill').style.width = percent + '%';
            }
        });
    }

    function renderAdMarkers() {
        const markersDiv = document.getElementById('adMarkers');
        const listDiv = document.getElementById('adMarkersList');
        if (!markersDiv) return;
        markersDiv.innerHTML = '';
        listDiv.innerHTML = '';
        adMarkers.forEach((time, idx) => {
            const percent = (time / (document.getElementById('adPreviewVideo')?.duration || 1)) * 100;
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `calc(${percent}% - 3px)`;
            marker.style.top = '-4px';
            marker.style.width = '6px';
            marker.style.height = '14px';
            marker.style.background = '#ff9800';
            marker.style.borderRadius = '2px';
            marker.style.cursor = 'pointer';
            marker.title = `Ad at ${formatTime(time)}`;
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Remove this ad marker?')) {
                    adMarkers.splice(idx, 1);
                    renderAdMarkers();
                }
            });
            markersDiv.appendChild(marker);

            const listItem = document.createElement('div');
            listItem.style.background = 'var(--hover-bg)';
            listItem.style.padding = '4px 12px';
            listItem.style.borderRadius = '16px';
            listItem.style.display = 'inline-flex';
            listItem.style.alignItems = 'center';
            listItem.style.gap = '8px';
            listItem.innerHTML = `📍 ${formatTime(time)} <button data-idx="${idx}" style="background:none;border:none;color:#ff4444;cursor:pointer;">✖</button>`;
            listDiv.appendChild(listItem);
        });
        document.querySelectorAll('#adMarkersList button').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                adMarkers.splice(idx, 1);
                renderAdMarkers();
            });
        });
    }

    function formatTime(sec) {
        if (!sec) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // Tab switching
    function initUploadTabs() {
        const tabBtns = document.querySelectorAll('.upload-tab-btn');
        const panes = document.querySelectorAll('.upload-tab-pane');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                panes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(`tab-${targetTab}`).classList.add('active');
                if (targetTab === 'game') toggleGameTab();
                if (targetTab === 'ads') initAdPreview();
            });
        });
    }

    // ===== MAIN UPLOAD FORM SUBMIT =====
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
            let is_made_for_kids = audienceRadio && audienceRadio.value === 'kids';
            const language = document.getElementById('language')?.value || 'en';
            const categorySelect = document.getElementById('category');
            const category_id = categorySelect ? parseInt(categorySelect.value) || null : null;
            const licenseRadio = document.querySelector('input[name="license"]:checked');
            const license = licenseRadio ? licenseRadio.value : 'standard';
            const commentsRadio = document.querySelector('input[name="comments"]:checked');
            let allow_comments = commentsRadio ? commentsRadio.value === 'allow' : true;
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
            const thumbInput = document.getElementById('thumbUploadInput');
            const thumbnailFile = thumbInput?.files[0] || null;

            // Additional data from new tabs
            const gameData = (categorySelect.value === 'gaming') ? selectedGame : null;
            const cardsData = cards;
            const endScreenData = endScreenElements;
            const playlistData = selectedPlaylist || document.getElementById('newPlaylistName')?.value.trim() || null;
            const adMarkersData = adMarkers;

            console.log('Upload with extra data:', { gameData, cardsData, endScreenData, playlistData, adMarkersData });

            const progressContainer = document.getElementById('progressContainer');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            if (progressContainer) progressContainer.style.display = 'flex';
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            let upload_url = null, object_key = null;
            try {
                const filenameEncoded = encodeURIComponent(videoFile.name);
                const presignedResponse = await window.authorizedFetch(`${API_BASE}/videos/upload-url?filename=${filenameEncoded}`);
                if (!presignedResponse.ok) throw new Error(`Presign failed: ${presignedResponse.status}`);
                const data = await presignedResponse.json();
                upload_url = data.upload_url;
                object_key = data.object_key;

                await uploadFileWithProgress(upload_url, videoFile, (percent, loaded, total) => {
                    if (progressFill) progressFill.style.width = percent + '%';
                    if (progressText) {
                        const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
                        const totalMB = (total / (1024 * 1024)).toFixed(1);
                        progressText.textContent = `${percent}% (${loadedMB}MB / ${totalMB}MB)`;
                    }
                });

                let thumbnail_key = null;
                if (thumbnailFile) {
                    const thumbResp = await window.authorizedFetch(`${API_BASE}/videos/thumbnail-upload-url?filename=${encodeURIComponent(thumbnailFile.name)}&content_type=${encodeURIComponent(thumbnailFile.type || 'image/jpeg')}`);
                    if (thumbResp.ok) {
                        const thumbData = await thumbResp.json();
                        await uploadFileWithProgress(thumbData.upload_url, thumbnailFile);
                        thumbnail_key = thumbData.object_key;
                    }
                }

                const completePayload = {
                    title, description: description || null, original_filename: videoFile.name,
                    file_size: videoFile.size, mime_type: videoFile.type, object_key, visibility,
                    category_id, language, allow_comments, is_made_for_kids, is_short: false,
                    scheduled_at, license, tags: tagsList, thumbnail_key,
                    // extra fields (will be ignored by backend but stored for future)
                    extra_game: gameData, extra_cards: cardsData, extra_endscreen: endScreenData,
                    extra_playlist: playlistData, extra_ad_markers: adMarkersData
                };

                const completeResponse = await window.authorizedFetch(`${API_BASE}/videos/complete`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(completePayload)
                });
                if (!completeResponse.ok) throw new Error(`Confirmation failed: ${completeResponse.status}`);
                window.showToast(`✅ Upload complete! Transcoding started.`);
                window.closeAllPopups();
                uploadForm.reset();
                if (descriptionDiv) descriptionDiv.innerHTML = '';
                if (document.getElementById('descCounter')) document.getElementById('descCounter').textContent = '0 / 5000';
                tags = [];
                renderTags();
                const videoFileNameSpan = document.getElementById('videoFileName');
                if (videoFileNameSpan) videoFileNameSpan.textContent = 'Click to select a video file';
                // reset new tabs data
                selectedGame = null;
                cards = [];
                endScreenElements = [];
                selectedPlaylist = '';
                adMarkers = [];
                renderCards();
                renderEndScreen();
                renderAdMarkers();
                if (window.fetchCurrentUser) window.fetchCurrentUser();
            } catch (err) {
                console.error(err);
                window.showToast(`Upload failed: ${err.message}`);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (progressContainer) progressContainer.style.display = 'none';
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

    // ===== Thumbnail & Video UI interactions =====
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

    // ===== Avatar Preview in Signup =====
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

    // ===== Initialize new tabs functionality =====
    function initNewTabs() {
        initUploadTabs();
        const categoryEl = document.getElementById('category');
        if (categoryEl) {
            categoryEl.addEventListener('change', toggleGameTab);
            toggleGameTab();
        }
        const gameSearch = document.getElementById('gameSearchInput');
        if (gameSearch) gameSearch.addEventListener('input', (e) => renderGameList(e.target.value));

        // Cards
        const addCardBtn = document.getElementById('addCardBtn');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', () => {
                const type = document.getElementById('cardTypeSelect').value;
                const timestamp = parseInt(document.getElementById('cardTimestamp').value);
                if (isNaN(timestamp)) {
                    window.showToast('Please enter a valid timestamp');
                    return;
                }
                cards.push({ type, timestamp });
                renderCards();
                document.getElementById('cardTimestamp').value = '';
            });
        }
        const addEndScreenBtn = document.getElementById('addEndScreenBtn');
        if (addEndScreenBtn) {
            addEndScreenBtn.addEventListener('click', () => {
                const type = document.getElementById('endScreenTypeSelect').value;
                endScreenElements.push({ type });
                renderEndScreen();
            });
        }

        // Playlist
        const playlistSelect = document.getElementById('playlistSelect');
        const newPlaylistName = document.getElementById('newPlaylistName');
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        if (playlistSelect) playlistSelect.addEventListener('change', () => {
            selectedPlaylist = playlistSelect.value;
            updatePlaylistInfo();
        });
        if (newPlaylistName) newPlaylistName.addEventListener('input', updatePlaylistInfo);
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => {
                const name = newPlaylistName.value.trim();
                if (name) {
                    const option = document.createElement('option');
                    option.value = name.toLowerCase().replace(/\s/g, '_');
                    option.textContent = name;
                    playlistSelect.appendChild(option);
                    playlistSelect.value = option.value;
                    selectedPlaylist = option.value;
                    updatePlaylistInfo();
                    newPlaylistName.value = '';
                    window.showToast(`Playlist "${name}" created`);
                }
            });
        }

        // Ad markers
        const addAdBtn = document.getElementById('addAdMarkerBtn');
        if (addAdBtn) {
            addAdBtn.addEventListener('click', () => {
                let time = parseFloat(document.getElementById('adTimestamp').value);
                const videoEl = document.getElementById('adPreviewVideo');
                if (isNaN(time) && videoEl && videoEl.currentTime) {
                    time = videoEl.currentTime;
                }
                if (isNaN(time) || time < 0) {
                    window.showToast('Enter a valid time (seconds)');
                    return;
                }
                if (videoEl && time > videoEl.duration) {
                    window.showToast('Time exceeds video duration');
                    return;
                }
                adMarkers.push(time);
                adMarkers.sort((a,b) => a-b);
                renderAdMarkers();
                document.getElementById('adTimestamp').value = '';
            });
        }
        renderCards();
        renderEndScreen();
        renderAdMarkers();
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNewTabs);
    } else {
        initNewTabs();
    }
})();