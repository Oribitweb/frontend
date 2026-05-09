// ===== API Base URL =====
const API_BASE = 'http://localhost:8000';

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
const themeToggleGlobal = document.getElementById('themeToggle');
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
function updateThemeLabel(theme) { 
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}
const savedTheme = localStorage.getItem('orbit-theme') || 'dark';
setTheme(savedTheme);

if (themeToggleGlobal) {
    themeToggleGlobal.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

// ===== Sidebar Toggle =====
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar--collapsed');
    });
}

// ===== Show More Channels =====
const showMoreBtn = document.getElementById('showMoreChannels');
const hiddenChannels = document.querySelectorAll('.hidden-channel');
let channelsExpanded = false;
if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
        channelsExpanded = !channelsExpanded;
        hiddenChannels.forEach(ch => ch.style.display = channelsExpanded ? 'flex' : 'none');
        showMoreBtn.textContent = channelsExpanded ? 'Show less' : 'Show more';
    });
}

// ===== Build Profile Dropdown Based on Login State =====
function buildDropdown() {
    if (!profileDropdown) return;

    // Clear existing content
    profileDropdown.innerHTML = '';

    if (currentUser) {
        // ----- Logged in menu -----
        // Your Orbiter (user info)
        const yourOrbiter = createDropdownItem(
            'user-info-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none"/></svg>',
            `Your Orbiter (${escapeHtml(currentUser.username)})`
        );
        yourOrbiter.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast(`Welcome ${currentUser.username}! This is your Orbit.`);
            // می‌توانید به صفحه پروفایل هدایت کنید: window.location.href = 'profile.php';
        });
        profileDropdown.appendChild(yourOrbiter);

        // Settings
        const settingsItem = createDropdownItem(
            'settings-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
            'Settings'
        );
        settingsItem.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast('Settings page coming soon.');
        });
        profileDropdown.appendChild(settingsItem);

        // Separator
        profileDropdown.appendChild(createSeparator());

        // My Videos
        const myVideos = createDropdownItem(
            'myvideos-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="8 9 12 12 8 15"/><line x1="16" y1="9" x2="16" y2="15"/></svg>',
            'My Videos'
        );
        myVideos.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast('Your video library will appear here.');
        });
        profileDropdown.appendChild(myVideos);

        // Live Streaming
        const liveStreaming = createDropdownItem(
            'live-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 4V2M8 6L6 4M16 6l2-2M12 20v2M4 12H2M6 16l-2 2M18 16l2 2M20 12h2"/><circle cx="12" cy="12" r="3"/></svg>',
            'Live Streaming'
        );
        liveStreaming.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast('Go live feature is under development.');
        });
        profileDropdown.appendChild(liveStreaming);

        // Orbiter Studio
        const orbiterStudio = createDropdownItem(
            'studio-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 7v10M7 12h10"/></svg>',
            'Orbiter Studio'
        );
        orbiterStudio.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast('Orbiter Studio dashboard coming soon.');
        });
        profileDropdown.appendChild(orbiterStudio);

        // Separator
        profileDropdown.appendChild(createSeparator());

        // Advertisement
        const advertisement = createDropdownItem(
            'ad-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 13h10M12 7v10"/></svg>',
            'Advertisement'
        );
        advertisement.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            showToast('Ad monetization panel will be available soon.');
        });
        profileDropdown.appendChild(advertisement);

        // Separator
        profileDropdown.appendChild(createSeparator());

        // Log out
        const logoutItem = createDropdownItem(
            'logout-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
            'Log out'
        );
        logoutItem.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            logoutUser();
        });
        profileDropdown.appendChild(logoutItem);

        // Separator
        profileDropdown.appendChild(createSeparator());

        // Theme toggle (always present)
        const themeItem = createThemeToggleItem();
        profileDropdown.appendChild(themeItem);

    } else {
        // ----- Logged out menu -----
        const loginItem = createDropdownItem(
            'login-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
            'Log In'
        );
        loginItem.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            openPopup(loginPopup);
        });
        profileDropdown.appendChild(loginItem);

        const signupItem = createDropdownItem(
            'signup-item',
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
            'Sign Up'
        );
        signupItem.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.remove('active');
            openPopup(signupPopup);
        });
        profileDropdown.appendChild(signupItem);

        profileDropdown.appendChild(createSeparator());

        const themeItem = createThemeToggleItem();
        profileDropdown.appendChild(themeItem);
    }
}

// Helper to create a dropdown item with icon and text
function createDropdownItem(className, iconSvg, text) {
    const div = document.createElement('div');
    div.className = `dropdown__item ${className}`;
    div.innerHTML = `${iconSvg}<span>${escapeHtml(text)}</span>`;
    return div;
}

function createSeparator() {
    const hr = document.createElement('div');
    hr.className = 'dropdown__divider';
    return hr;
}

function createThemeToggleItem() {
    const container = document.createElement('div');
    container.className = 'dropdown__item dropdown__theme-toggle';
    container.id = 'themeToggle';  // برای سازگاری با رویداد موجود
    container.innerHTML = `
        <span class="dropdown__theme-icon-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </span>
        <span class="dropdown__theme-icon-light">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </span>
        <span id="themeLabel">${html.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    `;
    // attach theme toggle event
    const btn = container;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        // تحديث لیبل داخل همین دکمه
        const labelSpan = btn.querySelector('#themeLabel');
        if (labelSpan) labelSpan.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
    return container;
}

// Update profile avatar (first letter or default)
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

// Update whole UI after login/logout
function updateUIForUser() {
    buildDropdown();
    if (currentUser) {
        updateProfileAvatar(currentUser.username.charAt(0).toUpperCase());
    } else {
        updateProfileAvatar(null);
    }
}

// ===== Dropdown Toggle Events =====
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
        if (createDropdown) createDropdown.classList.remove('active');
    });
}
if (createBtn) {
    createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createDropdown.classList.toggle('active');
        if (profileDropdown) profileDropdown.classList.remove('active');
    });
}
document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileBtn) profileDropdown.classList.remove('active');
    if (createDropdown && !createDropdown.contains(e.target) && e.target !== createBtn) createDropdown.classList.remove('active');
});

// ===== API Functions (بدون تغییر) =====
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
    updateUIForUser();
    showToast('Logged out successfully');
    window.location.reload();
}
async function fetchCurrentUser() {
    try {
        const res = await authorizedFetch(`${API_BASE}/users/me`);
        if (res.ok) {
            currentUser = await res.json();
            updateUIForUser();
        } else {
            currentUser = null;
            updateUIForUser();
        }
    } catch (err) {
        currentUser = null;
        updateUIForUser();
    }
}

// ===== Popups (بدون تغییر) =====
function openPopup(popup) { closeAllPopups(); popup.classList.add('active'); overlay.classList.add('active'); currentPopup = popup; document.body.style.overflow = 'hidden'; }
function closeAllPopups() { [loginPopup, signupPopup, forgotPopup, uploadPopup, shortPopup, postPopup].forEach(p => p.classList.remove('active')); overlay.classList.remove('active'); document.body.style.overflow = ''; currentPopup = null; }
if (overlay) overlay.addEventListener('click', closeAllPopups);
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
        if (createDropdown) createDropdown.classList.remove('active');
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

// ===== Helper Functions (بدون تغییر) =====
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

// ===== Description Editor (بدون تغییر) =====
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

// ===== Thumbnail & Video Upload (بدون تغییر) =====
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

// ===== Tags (بدون تغییر) =====
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

// ===== Short Video (بدون تغییر) =====
const shortFileArea = document.getElementById('shortFileArea');
const shortFileInput = document.getElementById('shortFileInput');
const shortFileName = document.getElementById('shortFileName');
if (shortFileArea) shortFileArea.addEventListener('click', () => shortFileInput.click());
if (shortFileInput) {
    shortFileInput.addEventListener('change', () => {
        if (shortFileName) shortFileName.textContent = shortFileInput.files[0] ? shortFileInput.files[0].name : 'Click to select a short video';
    });
}

// ===== Post Image (بدون تغییر) =====
const postImageArea = document.getElementById('postImageArea');
const postImageInput = document.getElementById('postImageInput');
const postImageName = document.getElementById('postImageName');
if (postImageArea) postImageArea.addEventListener('click', () => postImageInput.click());
if (postImageInput) {
    postImageInput.addEventListener('change', () => {
        if (postImageName) postImageName.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Click to add an image';
    });
}

// ===== Form Submits (بدون تغییر) =====
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

// ===== Avatar Upload (بدون تغییر) =====
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

// ===== Toast (بدون تغییر) =====
function showToast(msg, duration=3000) {
    if (!toastContainer) return;
    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

// ===== Feed (بدون تغییر) =====
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

// ===== Start =====
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