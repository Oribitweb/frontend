// core.js – Shared functions across all pages

// ===== Config =====
// Strip trailing slashes so we never request ".../​/users/me"
const API_BASE = String(window.API_BASE || '').replace(/\/+$/, '');
let currentUser = null;
const html = document.documentElement;

// ===== Debug logging (set to false when finished) =====
const DEBUG = true;
const dbg = (...args) => {
    if (DEBUG) console.log('%c[auth]', 'color:#0a0;font-weight:bold', ...args);
};
dbg('API_BASE =', JSON.stringify(API_BASE));
// NOTE: access_token / refresh_token are HttpOnly, so JavaScript can never read them.
// The browser attaches them automatically. Check the real "Cookie:" request header
// in DevTools -> Network -> (request) -> Headers, and log tokens on the backend.

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
(function () {
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

// Preserve the original fetch so we can call it directly
const originalFetch = window.fetch;

// Refresh state (centralised queue)
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];   // pending requests that hit 401

function processQueue(error) {
    const queue = failedQueue;
    failedQueue = [];
    dbg('processQueue: error =', error ? error.message : null, '| queued requests =', queue.length);

    queue.forEach(({ resolve, reject, url, options }) => {
        if (error) {
            reject(error);
        } else {
            // Retry via originalFetch so the interceptor can't loop
            originalFetch(url, options)
                .then(res => {
                    dbg('RETRY', options.method || 'GET', url, '→', res.status,
                        '| redirected:', res.redirected, '| final url:', res.url);
                    resolve(res);
                })
                .catch(reject);
        }
    });
}

/**
 * Perform a token refresh. Only one refresh can be in flight at a time.
 */
function refreshToken() {
    if (isRefreshing) return refreshPromise;

    isRefreshing = true;
    dbg('REFRESH starting');

    refreshPromise = originalFetch(`${API_BASE}/refresh`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(async res => {
            dbg('REFRESH response:', res.status, '| redirected:', res.redirected, '| final url:', res.url);
            if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
            // The backend sets the new cookie; body is optional
            return res.json().catch(() => ({}));
        })
        .then(data => {
            processQueue(null);
            return data;
        })
        .catch(err => {
            processQueue(err);
            throw err;
        })
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
}

// Endpoints that must NOT trigger refresh-and-retry on 401
// (a wrong password returns 401 and should surface as an error, not a refresh)
const AUTH_PATH_RE = /\/(login|register|refresh|logout)\/?(\?.*)?$/;

/**
 * Override global fetch:
 *  - always sends credentials
 *  - on 401 (non-auth endpoints) refreshes the token once and retries
 */
window.fetch = async function (url, options = {}) {
    const method = options.method || 'GET';
    const fetchOptions = { ...options, credentials: 'include' };

    // Auth endpoints and explicit bypass: no refresh logic
    if (AUTH_PATH_RE.test(String(url)) || options.__bypassInterceptor) {
        const r = await originalFetch(url, fetchOptions);
        dbg('AUTH CALL', method, url, '→', r.status, '| redirected:', r.redirected, '| final url:', r.url);
        return r;
    }

    const res = await originalFetch(url, fetchOptions);
    dbg('REQUEST', method, url, '→', res.status, '| redirected:', res.redirected, '| final url:', res.url);

    if (res.status !== 401) return res;

    // 401 → queue this request, then make sure a refresh is running
    dbg('401 received, queueing + refreshing for', url);
    return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, url, options: fetchOptions });
        refreshToken().catch(err => dbg('REFRESH FAILED:', err.message));
    });
};

// =============================================
//  END OF AUTH UPDATE
// =============================================

// ===== Login / Register / Logout =====
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
        const res = await fetch(`${API_BASE}/users/me`, { credentials: 'include' });
        dbg('fetchCurrentUser →', res.status);
        if (res.ok) {
            const user = await res.json();
            dbg('fetchCurrentUser user:', user);
            currentUser = user;
            window.currentUser = user;
        } else {
            dbg('fetchCurrentUser body:', await res.text().catch(() => ''));
            currentUser = null;
            window.currentUser = null;
        }
    } catch (err) {
        // Expected for visitors who are not logged in (refresh fails too)
        dbg('fetchCurrentUser error:', err && err.message);
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