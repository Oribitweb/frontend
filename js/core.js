// core.js – Shared functions across all pages
const API_BASE = window.API_BASE;
let currentUser = null;
const html = document.documentElement;

// ===== Helper =====
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

// ===== Toast =====
const toastContainer = document.getElementById('toastContainer');
function showToast(msg, duration = 3000) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

// ===== Theme =====
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('orbit-theme', theme);
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    if (window.updateUserDropdown) window.updateUserDropdown();
}

// Load saved theme
(function() {
    const saved = localStorage.getItem('orbit-theme') || 'dark';
    setTheme(saved);
})();

// ===== Popup Management =====
const overlay = document.getElementById('overlay');
let currentPopup = null;

function openPopup(popupElement) {
    closeAllPopups();
    if (!popupElement) return;
    popupElement.classList.add('active');
    if (overlay) overlay.classList.add('active');
    currentPopup = popupElement;
    document.body.style.overflow = 'hidden';
}

function closeAllPopups() {
    const allPopups = document.querySelectorAll('.popup.active');
    allPopups.forEach(p => p.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    currentPopup = null;
}

function openPopupById(id) {
    const el = document.getElementById(id);
    if (el) openPopup(el);
}

// Close popup with data-close buttons
document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
        const popup = closeBtn.closest('.popup');
        if (popup) {
            popup.classList.remove('active');
            closeAllPopups();
        }
    }
});

// Close with Esc
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentPopup) {
        closeAllPopups();
    }
});

// Close by clicking overlay
if (overlay) {
    overlay.addEventListener('click', closeAllPopups);
}

// =============================================
//  AUTH & TOKEN REFRESH – GLOBAL FETCH OVERRIDE
// =============================================

// Preserve the original fetch so we can call it directly for token refresh
const originalFetch = window.fetch;

// Refresh state (centralised queue)
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];   // holds pending requests that hit 401

function processQueue(error, token) {
    failedQueue.forEach(({ resolve, reject, url, options }) => {
        if (error) {
            reject(error);                     // refresh failed → reject all
        } else {
            // Retry with a marker so the interceptor knows it's a retry
            const retryOptions = { ...options, __retry: true };
            originalFetch(url, retryOptions)   // use original fetch to keep it simple
                .then(resolve, reject);
        }
    });
    failedQueue = [];
}

/**
 * Perform a token refresh. Only one refresh call can be in progress at a time.
 * Returns a promise that resolves when the refresh completes (or rejects on failure).
 */
async function refreshToken() {
    if (isRefreshing) return refreshPromise;

    isRefreshing = true;
    refreshPromise = originalFetch(`${API_BASE}/refresh`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) throw new Error('Refresh failed');
        return res.json();   // cookie is set by backend, we only need success signal
    })
    .then(data => {
        processQueue(null, data.access_token);
        return data;
    })
    .catch(err => {
        processQueue(err, null);
        // Optionally force logout here
        throw err;
    })
    .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
    });

    return refreshPromise;
}

/**
 * Override global fetch to intercept 401 responses.
 * Any request that gets a 401 (except the /refresh endpoint itself, and retries)
 * is automatically queued and retried after a successful token refresh.
 */
window.fetch = async function(url, options = {}) {
    // Bypass interceptor for /refresh calls (they use originalFetch anyway)
    if (url === `${API_BASE}/refresh` || options.__bypassInterceptor) {
        return originalFetch(url, options);
    }

    // Normal request – send with credentials
    const fetchOptions = { ...options, credentials: 'include' };
    const res = await originalFetch(url, fetchOptions);

    // If not 401, or if it's already a retry (to avoid infinite loops), return response
    if (res.status !== 401 || options.__retry) {
        return res;
    }

    // --- 401 detected, need to refresh ---
    // Start the refresh (no-op if already in progress)
    const refreshTask = refreshToken();

    // Queue this request to be retried after the refresh completes
    return new Promise((resolve, reject) => {
        failedQueue.push({
            resolve,
            reject,
            url,
            options: fetchOptions   // original options with credentials
        });
    });
};

// (End of global fetch override)

// =============================================
//  END OF AUTH UPDATE
// =============================================

// ===== Login / Register / Logout (unchanged) =====
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
    window.currentUser = null;
    if (window.updateUserDropdown) window.updateUserDropdown();
    showToast('Logged out successfully');
}

async function fetchCurrentUser() {
    try {
        const res = await fetch(`${API_BASE}/users/me`);
        if (res.ok) {
            const user = await res.json();
            currentUser = user;
            window.currentUser = user;
        } else {
            currentUser = null;
            window.currentUser = null;
        }
    } catch (err) {
        currentUser = null;
        window.currentUser = null;
    }
    if (window.updateUserDropdown) window.updateUserDropdown();
}

// ===== Sidebar & Dropdowns (shared) =====
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebar && sidebarToggle) {
        sidebar.classList.add('sidebar--collapsed');
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar--collapsed');
        });
    }
}

function initCreateDropdown() {
    const createBtn = document.getElementById('createBtn');
    const createDropdown = document.getElementById('createDropdown');
    if (!createBtn || !createDropdown) return;
    createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createDropdown.classList.toggle('active');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) profileDropdown.classList.remove('active');
    });
    document.addEventListener('click', (e) => {
        if (!createDropdown.contains(e.target)) {
            createDropdown.classList.remove('active');
        }
    });
}

function initShowMoreChannels() {
    const showMoreBtn = document.getElementById('showMoreChannels');
    const hiddenChannels = document.querySelectorAll('.sidebar__channel.hidden-channel');
    if (showMoreBtn && hiddenChannels.length) {
        let expanded = false;
        showMoreBtn.addEventListener('click', () => {
            expanded = !expanded;
            hiddenChannels.forEach(ch => ch.style.display = expanded ? 'flex' : 'none');
            showMoreBtn.textContent = expanded ? 'Show less' : 'Show more';
        });
    }
}

// ===== Expose to window =====
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.setTheme = setTheme;
window.openPopup = openPopup;
window.closeAllPopups = closeAllPopups;
window.openPopupById = openPopupById;
window.currentUser = currentUser;
window.fetchCurrentUser = fetchCurrentUser;
window.logoutUser = logoutUser;
window.loginUser = loginUser;
window.registerUser = registerUser;

// ===== Init on DOM ready =====
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentUser();
    initSidebar();
    initCreateDropdown();
    initShowMoreChannels();
});