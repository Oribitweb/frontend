// core.js – Shared functions across all pages
const API_BASE = 'http://localhost:8000';
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

// ===== Auth Functions =====
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
    if (window.updateUserDropdown) window.updateUserDropdown();
    showToast('Logged out successfully');
}

async function fetchCurrentUser() {
    try {
        const res = await authorizedFetch(`${API_BASE}/users/me`);
        if (res.ok) {
            currentUser = await res.json();
        } else {
            currentUser = null;
        }
    } catch (err) {
        currentUser = null;
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