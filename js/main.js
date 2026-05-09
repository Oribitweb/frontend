// ===== API Base URL =====
const API_BASE = 'http://localhost:8000'; // <-- آدرس بک‌اند خود را تغییر دهید

// ===== DOM Elements =====
const body = document.body;
const html = document.documentElement;
const overlay = document.getElementById('overlay');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const createBtn = document.getElementById('createBtn');
const createDropdown = document.getElementById('createDropdown');
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const forgotPopup = document.getElementById('forgotPopup');
const uploadPopup = document.getElementById('uploadPopup');
const shortPopup = document.getElementById('shortPopup');
const postPopup = document.getElementById('postPopup');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const videoGrid = document.getElementById('videoGrid');
const toastContainer = document.getElementById('toastContainer');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
let currentPopup = null;
let currentUser = null;

// ===== Theme =====
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('orbit-theme', theme);
    updateThemeLabel(theme);
}
function updateThemeLabel(theme) { themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'; }
const savedTheme = localStorage.getItem('orbit-theme') || 'dark';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// ===== Sidebar Toggle =====
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--collapsed');
});

// ===== Show More Channels =====
const showMoreBtn = document.getElementById('showMoreChannels');
const hiddenChannels = document.querySelectorAll('.hidden-channel');
let channelsExpanded = false;
showMoreBtn.addEventListener('click', () => {
    channelsExpanded = !channelsExpanded;
    hiddenChannels.forEach(ch => ch.style.display = channelsExpanded ? 'flex' : 'none');
    showMoreBtn.textContent = channelsExpanded ? 'Show less' : 'Show more';
});

// ===== Dropdown Initialization (بدون innerHTML) =====
function initProfileDropdown() {
    if (!profileDropdown) return;
    if (profileDropdown.children.length === 0) {
        const userInfo = document.createElement('div');
        userInfo.className = 'dropdown-item user-info';
        userInfo.style.display = 'none';
        const loginItem = document.createElement('div');
        loginItem.className = 'dropdown-item login-item';
        loginItem.textContent = 'Log In';
        const signupItem = document.createElement('div');
        signupItem.className = 'dropdown-item signup-item';
        signupItem.textContent = 'Sign Up';
        const logoutItem = document.createElement('div');
        logoutItem.className = 'dropdown-item logout-item';
        logoutItem.textContent = 'Logout';
        logoutItem.style.display = 'none';
        profileDropdown.append(userInfo, loginItem, signupItem, logoutItem);
    }
    // attach events once
    const loginItem = profileDropdown.querySelector('.login-item');
    const signupItem = profileDropdown.querySelector('.signup-item');
    const logoutItem = profileDropdown.querySelector('.logout-item');
    if (loginItem) {
        loginItem.replaceWith(loginItem.cloneNode(true));
        profileDropdown.querySelector('.login-item').addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            openPopup(loginPopup);
        });
    }
    if (signupItem) {
        signupItem.replaceWith(signupItem.cloneNode(true));
        profileDropdown.querySelector('.signup-item').addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            openPopup(signupPopup);
        });
    }
    if (logoutItem) {
        logoutItem.replaceWith(logoutItem.cloneNode(true));
        profileDropdown.querySelector('.logout-item').addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            logoutUser();
        });
    }
}

function updateProfileDropdownState() {
    if (!profileDropdown) return;
    const userInfo = profileDropdown.querySelector('.user-info');
    const loginItem = profileDropdown.querySelector('.login-item');
    const signupItem = profileDropdown.querySelector('.signup-item');
    const logoutItem = profileDropdown.querySelector('.logout-item');
    if (currentUser) {
        if (userInfo) { userInfo.textContent = currentUser.username; userInfo.style.display = 'block'; }
        if (loginItem) loginItem.style.display = 'none';
        if (signupItem) signupItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'block';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (loginItem) loginItem.style.display = 'block';
        if (signupItem) signupItem.style.display = 'block';
        if (logoutItem) logoutItem.style.display = 'none';
    }
}

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
    createDropdown.classList.remove('active');
});
createBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    createDropdown.classList.toggle('active');
    profileDropdown.classList.remove('active');
});
document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && e.target !== profileBtn) profileDropdown.classList.remove('active');
    if (!createDropdown.contains(e.target) && e.target !== createBtn) createDropdown.classList.remove('active');
});

// ===== API Functions =====
async function authorizedFetch(url, options = {}) {
    try {
        const res = await fetch(url, { ...options, credentials: 'include' });
        if (res.status === 401) {
            await refreshToken();
            const retryRes = await fetch(url, { ...options, credentials: 'include' });
            if (!retryRes.ok) throw new Error('Unauthorized after refresh');
            return retryRes;
        }
        return res;
    } catch (err) { throw err; }
}
async function refreshToken() {
    const res = await fetch(`${API_BASE}/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Refresh failed');
    return await res.json();
}
async function loginUser(credentials) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Login failed');
    }
    return await res.json();
}
async function registerUser(userData) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Registration failed');
    }
    return await res.json();
}
async function logoutUser() {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    currentUser = null;
    updateProfileDropdownState();
    updateProfileAvatar(null);
    showToast('Logged out successfully');
    window.location.reload();
}
async function fetchCurrentUser() {
    try {
        const res = await authorizedFetch(`${API_BASE}/users/me`);
        if (res.ok) {
            currentUser = await res.json();
            updateProfileDropdownState();
            updateProfileAvatar(currentUser.username.charAt(0).toUpperCase());
        } else {
            currentUser = null;
            updateProfileDropdownState();
            updateProfileAvatar(null);
        }
    } catch (err) {
        currentUser = null;
        updateProfileDropdownState();
        updateProfileAvatar(null);
    }
}

// ===== Popups =====
function openPopup(popup) { closeAllPopups(); popup.classList.add('active'); overlay.classList.add('active'); currentPopup = popup; document.body.style.overflow = 'hidden'; }
function closeAllPopups() { [loginPopup, signupPopup, forgotPopup, uploadPopup, shortPopup, postPopup].forEach(p => p.classList.remove('active')); overlay.classList.remove('active'); document.body.style.overflow = ''; currentPopup = null; }
overlay.addEventListener('click', closeAllPopups);
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        const popupId = btn.getAttribute('data-close');
        document.getElementById(popupId)?.classList.remove('active');
        overlay.classList.remove('active'); document.body.style.overflow = ''; currentPopup = null;
    });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && currentPopup) closeAllPopups(); });

document.querySelectorAll('#createDropdown [data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = el.getAttribute('data-action');
        createDropdown.classList.remove('active');
        if (action === 'uploadVideo') openPopup(uploadPopup);
        else if (action === 'uploadShort') openPopup(shortPopup);
        else if (action === 'newPost') openPopup(postPopup);
    });
});
document.querySelectorAll('[data-action="switchToSignup"]').forEach(btn => {
    btn.addEventListener('click', () => { closeAllPopups(); openPopup(signupPopup); });
});
document.querySelectorAll('[data-action="switchToLogin"]').forEach(btn => {
    btn.addEventListener('click', () => { closeAllPopups(); openPopup(loginPopup); });
});
document.querySelectorAll('[data-action="forgotPassword"]').forEach(btn => {
    btn.addEventListener('click', () => { closeAllPopups(); openPopup(forgotPopup); });
});
document.querySelectorAll('[data-action="backToLogin"]').forEach(btn => {
    btn.addEventListener('click', () => { closeAllPopups(); openPopup(loginPopup); });
});

// ===== Login Form =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors(loginForm);
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!username || !password) {
            showFieldError(loginForm, 'Please fill all fields');
            return;
        }
        try {
            await loginUser({ username, password });
            closeAllPopups();
            await fetchCurrentUser();
            showToast(`Welcome back, ${username}!`);
            window.location.reload();
        } catch (err) {
            const errorMsg = err.message.includes('Invalid') ? 'Invalid username or password' : 'Login failed';
            showFieldError(loginForm, errorMsg);
        }
    });
}

// ===== Signup Form =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors(signupForm);
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
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
            await registerUser({ username, email, password, confirm_password: confirmPassword });
            closeAllPopups();
            openPopup(loginPopup);
            showToast('Account created! Please log in.');
        } catch (err) {
            let errorMsg = err.message;
            if (errorMsg.includes('Username already registered')) errorMsg = 'Username already exists';
            else if (errorMsg.includes('Email already registered')) errorMsg = 'Email already exists';
            showFieldError(signupForm, errorMsg);
        }
    });
}

// ===== Forgot Form =====
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();
        if (email) {
            showToast('If this email exists, you will receive a reset link (feature coming soon).');
            closeAllPopups();
            openPopup(loginPopup);
        } else {
            showFieldError(forgotForm, 'Email is required');
        }
    });
}

// ===== Helper Functions =====
function clearFormErrors(form) {
    form.querySelectorAll('.input-group__error').forEach(el => el.textContent = '');
}
function showFieldError(form, message, fieldId = null) {
    let targetErrorSpan;
    if (fieldId) {
        const input = document.getElementById(fieldId);
        targetErrorSpan = input?.closest('.input-group')?.querySelector('.input-group__error');
    } else {
        targetErrorSpan = form.querySelector('.input-group__error');
    }
    if (targetErrorSpan) targetErrorSpan.textContent = message;
    else showToast(message);
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// ===== Description Editor =====
const descriptionDiv = document.getElementById('videoDescription');
const descCounter = document.getElementById('descCounter');
const MAX_CHARS = 5000;

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
    let text = descriptionDiv.innerText;
    if (text.length > MAX_CHARS) {
        descriptionDiv.innerText = text.substring(0, MAX_CHARS);
        setCursorOffset(descriptionDiv, MAX_CHARS);
    }
    descCounter.textContent = `${descriptionDiv.innerText.length} / ${MAX_CHARS}`;
}
if (descriptionDiv) {
    descriptionDiv.addEventListener('input', () => {
        const cursorPos = getCursorOffset(descriptionDiv);
        enforceMaxLength();
        descriptionDiv.querySelectorAll('.hashtag').forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
        highlightHashtagsInElement(descriptionDiv);
        setCursorOffset(descriptionDiv, cursorPos);
    });
}

// ===== Thumbnail & Video Upload =====
const thumbUploadArea = document.getElementById('thumbUploadArea');
const thumbUploadInput = document.getElementById('thumbUploadInput');
const chooseFrameBtn = document.getElementById('chooseFrameBtn');
const videoFileArea = document.getElementById('videoFileArea');
const videoFileInput = document.getElementById('videoFileInput');
const videoFileName = document.getElementById('videoFileName');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

if (thumbUploadArea) thumbUploadArea.addEventListener('click', () => thumbUploadInput.click());
if (thumbUploadInput) thumbUploadInput.addEventListener('change', () => { if (thumbUploadInput.files[0]) showToast('Thumbnail selected.'); });
if (chooseFrameBtn) chooseFrameBtn.addEventListener('click', () => showToast('Frame selection simulated.'));
if (videoFileArea) videoFileArea.addEventListener('click', () => videoFileInput.click());
if (videoFileInput) {
    videoFileInput.addEventListener('change', () => {
        if (videoFileInput.files[0]) {
            videoFileName.textContent = videoFileInput.files[0].name;
            if (progressContainer) progressContainer.style.display = 'flex';
            let prog = 0;
            const interval = setInterval(() => {
                prog += Math.floor(Math.random()*15)+5;
                if (prog >= 100) {
                    clearInterval(interval);
                    if (progressFill) progressFill.style.width = '100%';
                    if (progressText) progressText.textContent = '100%';
                    showToast('File ready.');
                } else {
                    if (progressFill) progressFill.style.width = prog+'%';
                    if (progressText) progressText.textContent = prog+'%';
                }
            }, 300);
        } else {
            videoFileName.textContent = 'Click to select a video file';
            if (progressContainer) progressContainer.style.display = 'none';
        }
    });
}

// ===== Tags =====
const tagDisplay = document.getElementById('tagDisplay');
const tagInput = document.getElementById('tagInput');
const addTagBtn = document.getElementById('addTagBtn');
const tagCounterSpan = document.getElementById('tagCounter');
let tags = [];
const MAX_TAGS = 500;

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

// ===== Short Video =====
const shortFileArea = document.getElementById('shortFileArea');
const shortFileInput = document.getElementById('shortFileInput');
const shortFileName = document.getElementById('shortFileName');
if (shortFileArea) shortFileArea.addEventListener('click', () => shortFileInput.click());
if (shortFileInput) {
    shortFileInput.addEventListener('change', () => {
        if (shortFileName) shortFileName.textContent = shortFileInput.files[0] ? shortFileInput.files[0].name : 'Click to select a short video';
    });
}

// ===== Post Image =====
const postImageArea = document.getElementById('postImageArea');
const postImageInput = document.getElementById('postImageInput');
const postImageName = document.getElementById('postImageName');
if (postImageArea) postImageArea.addEventListener('click', () => postImageInput.click());
if (postImageInput) {
    postImageInput.addEventListener('change', () => {
        if (postImageName) postImageName.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Click to add an image';
    });
}

// ===== Form Submits =====
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('videoTitle').value.trim();
        if (!title) { showToast('Please enter a video title.'); return; }
        if (videoFileInput && videoFileInput.files.length === 0) { showToast('Please select a video file.'); return; }
        showToast('Upload started!');
        closeAllPopups();
        uploadForm.reset();
        if (descriptionDiv) { descriptionDiv.innerHTML = ''; descCounter.textContent = '0 / 5000'; }
        if (videoFileName) videoFileName.textContent = 'Click to select a video file';
        if (progressContainer) progressContainer.style.display = 'none';
        tags = []; renderTags();
    });
}
const shortForm = document.getElementById('shortForm');
if (shortForm) {
    shortForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('shortTitle').value.trim();
        if (!title) { showToast('Please enter a title.'); return; }
        if (shortFileInput && shortFileInput.files.length === 0) { showToast('Please select a short video.'); return; }
        showToast('Short published!');
        closeAllPopups();
        shortForm.reset();
        if (shortFileName) shortFileName.textContent = 'Click to select a short video';
    });
}
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = document.getElementById('postContent').value.trim();
        if (!content) { showToast('Please write something.'); return; }
        showToast('Post published!');
        closeAllPopups();
        postForm.reset();
        if (postImageName) postImageName.textContent = 'Click to add an image';
    });
}

// ===== Avatar Upload =====
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const avatarUploadArea = document.getElementById('avatarUpload');
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

// ===== Toast =====
function showToast(msg, duration=3000) {
    if (!toastContainer) return;
    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

// ===== Feed =====
function generateLongVideo(num, isTrend = false) {
    return { type: 'video', title: `Video Title ${num}`, channel: `Channel Name ${num}`, views: '0', time: 'Now', duration: '10:00', isTrend };
}
function generateShort(num) {
    return { type: 'short', title: `Short ${num}`, channel: `Channel Name ${num}`, views: '0' };
}
function generatePost(num) {
    return { type: 'post', author: `Channel Name ${num}`, time: 'Now', content: `Community post content #${num}.`, image: null };
}
const feedData = [];
feedData.push(generateLongVideo(1, true));
for (let i = 2; i <= 5; i++) feedData.push(generateLongVideo(i));
for (let i = 6; i <= 10; i++) feedData.push(generateLongVideo(i));
for (let i = 1; i <= 5; i++) feedData.push(generateShort(i));
for (let i = 1; i <= 5; i++) feedData.push(generatePost(i));
for (let i = 11; i <= 25; i++) feedData.push(generateLongVideo(i));

function renderFeed() {
    if (!videoGrid) return;
    videoGrid.innerHTML = feedData.map(item => {
        if (item.type === 'video') {
            const trendClass = item.isTrend ? ' video-card--trend' : '';
            const trendBadge = item.isTrend ? '<span class="trend-badge">Most Trend</span>' : '';
            return `<article class="video-card${trendClass}">
                <div class="video-card__thumbnail"><div style="background:linear-gradient(135deg,#1a2a3a,#0f3a2b);height:100%"></div>${trendBadge}<span class="video-card__duration">${item.duration}</span></div>
                <div class="video-card__info"><div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div><div class="video-card__text"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.channel)}</p><p>${escapeHtml(item.views)} views · ${escapeHtml(item.time)}</p></div></div>
            </article>`;
        } else if (item.type === 'short') {
            return `<article class="video-card video-card--short"><div class="video-card__thumbnail"><div style="background:linear-gradient(135deg,#2a1a3a,#0f2a2b);height:100%"></div></div><div class="video-card__info"><div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div><div class="video-card__text"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.channel)}</p><p>${escapeHtml(item.views)} views</p></div></div></article>`;
        } else {
            return `<article class="post-card"><div class="post-card__header"><div class="post-card__avatar">${escapeHtml(item.author.charAt(0))}</div><div><div class="post-card__author">${escapeHtml(item.author)}</div><div class="post-card__time">${escapeHtml(item.time)}</div></div></div><div class="post-card__content">${escapeHtml(item.content)}</div></article>`;
        }
    }).join('');
}
renderFeed();

// ===== Category Pills =====
document.querySelectorAll('.category-pill').forEach(p => p.addEventListener('click', function() {
    document.querySelector('.category-pill--active')?.classList.remove('category-pill--active');
    this.classList.add('category-pill--active');
}));

// ===== Update Profile Avatar =====
function updateProfileAvatar(initial) {
    const container = document.getElementById('profileAvatar');
    if (container) {
        if (initial) {
            container.innerHTML = `<span style="font-weight:700;font-size:1rem;">${escapeHtml(initial)}</span>`;
        } else {
            container.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }
    }
}

// ===== Start =====
initProfileDropdown();
fetchCurrentUser();

// ===== Popup from URL =====
const urlParams = new URLSearchParams(window.location.search);
const popupParam = urlParams.get('popup');
if (popupParam) {
    window.addEventListener('DOMContentLoaded', () => {
        if (popupParam === 'login') openPopup(loginPopup);
        else if (popupParam === 'signup') openPopup(signupPopup);
        else if (popupParam === 'uploadVideo') openPopup(uploadPopup);
        else if (popupParam === 'uploadShort') openPopup(shortPopup);
        else if (popupParam === 'newPost') openPopup(postPopup);
        if (window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    });
}