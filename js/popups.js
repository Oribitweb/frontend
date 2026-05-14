// popups.js – Handles popup forms and UI interactions
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

    // ===== Auth Forms (Login, Signup, Forgot) – بدون تغییر =====
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

    // ===== Helper: upload with progress (XMLHttpRequest) =====
    function uploadWithProgress(url, formData, totalSize, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / totalSize) * 100);
                    onProgress(percent, event.loaded, totalSize);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ ok: true, response: xhr });
                } else {
                    reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
            xhr.open('POST', url);
            xhr.send(formData);
        });
    }

    // ===== Upload Video (Real Implementation) =====
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Check login
            if (!window.currentUser) {
                window.showToast('Please log in to upload videos.');
                window.openPopupById('loginPopup');
                return;
            }

            // 2. Gather metadata
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

            // Audience -> is_made_for_kids
            const audienceRadio = document.querySelector('input[name="audience"]:checked');
            let is_made_for_kids = false;
            if (audienceRadio) {
                if (audienceRadio.value === 'kids') is_made_for_kids = true;
                else if (audienceRadio.value === 'not-kids') is_made_for_kids = false;
                // 'not-sure' -> false as default
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
                // 'hold' still allows comments but holds for review – we set true
                else allow_comments = true;
            }

            // Tags (array of strings)
            const tagsList = tags; // already managed by tag system

            // Video file
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

            // Show progress container
            const progressContainer = document.getElementById('progressContainer');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            if (progressContainer) progressContainer.style.display = 'flex';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = '0%';

            // Disable submit button during upload
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                // STEP 1: Request presigned URL
                const metadata = {
                    title,
                    description: description || null,
                    visibility,
                    duration_seconds: null,
                    is_short: false,
                    is_made_for_kids,
                    allow_comments,
                    language,
                    license,
                    scheduled_at,
                    category_id,
                    tags: tagsList
                };

                const presignedResponse = await window.authorizedFetch(`${API_BASE}/videos/upload-request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(metadata)
                });

                if (!presignedResponse.ok) {
                    let errorData;
                    try { errorData = await presignedResponse.json(); } catch(e) {}
                    throw new Error(errorData?.detail || `Failed to get upload URL (${presignedResponse.status})`);
                }

                const presignedData = await presignedResponse.json();
                console.log('Presigned data:', presignedData);

                // STEP 2: Upload directly to S3 with progress
                const formData = new FormData();
                for (const [key, value] of Object.entries(presignedData.upload_fields)) {
                    formData.append(key, value);
                }
                formData.append('file', videoFile, videoFile.name);

                await uploadWithProgress(
                    presignedData.upload_url,
                    formData,
                    videoFile.size,
                    (percent, loaded, total) => {
                        if (progressFill) progressFill.style.width = percent + '%';
                        if (progressText) {
                            const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
                            const totalMB = (total / (1024 * 1024)).toFixed(1);
                            progressText.textContent = `${percent}% (${loadedMB}MB / ${totalMB}MB)`;
                        }
                    }
                );

                // STEP 3: Confirm upload complete
                const completeResponse = await window.authorizedFetch(`${API_BASE}/videos/${presignedData.video_id}/upload-complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!completeResponse.ok) {
                    let errorData;
                    try { errorData = await completeResponse.json(); } catch(e) {}
                    throw new Error(errorData?.detail || `Confirmation failed (${completeResponse.status})`);
                }

                const completeData = await completeResponse.json();
                window.showToast(`✅ Upload complete! Video ID: ${presignedData.video_id}`);
                window.closeAllPopups();
                uploadForm.reset();
                // reset description and tags
                if (descriptionDiv) descriptionDiv.innerHTML = '';
                if (document.getElementById('descCounter')) document.getElementById('descCounter').textContent = '0 / 5000';
                tags = [];
                renderTags();
                const videoFileNameSpan = document.getElementById('videoFileName');
                if (videoFileNameSpan) videoFileNameSpan.textContent = 'Click to select a video file';
                // Optionally reload page or refresh video list
                if (typeof window.fetchCurrentUser === 'function') window.fetchCurrentUser();
            } catch (err) {
                console.error('Upload error:', err);
                window.showToast(`Upload failed: ${err.message}`);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
            }
        });
    }

    // ===== Short Video Upload (similar, can be extended later) =====
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

    // ===== Description Editor (same as before) =====
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

    // ===== Thumbnail & Video Upload UI (mock selections, but keep for UX) =====
    const thumbUploadArea = document.getElementById('thumbUploadArea');
    const thumbUploadInput = document.getElementById('thumbUploadInput');
    if (thumbUploadArea) thumbUploadArea.addEventListener('click', () => thumbUploadInput.click());
    if (thumbUploadInput) thumbUploadInput.addEventListener('change', () => { if (thumbUploadInput.files[0]) window.showToast('Thumbnail selected.'); });
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
                // No mock progress – real upload will show progress later
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
})();