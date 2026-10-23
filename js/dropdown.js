// dropdown.js – Dynamic profile dropdown
(function() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const html = document.documentElement;

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, (m) => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
    }

    function buildDropdownHTML() {
        const currentUser = window.currentUser;
        if (!currentUser) {
            return `
                <div class="dropdown__section">
                    <p class="dropdown__label">Account</p>
                    <button class="dropdown__item" id="dropdownLoginBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Log In
                    </button>
                    <button class="dropdown__item" id="dropdownSignupBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        Sign Up
                    </button>
                </div>
                <div class="dropdown__divider"></div>
                <div class="dropdown__section">
                    <p class="dropdown__label">Appearance</p>
                    <button class="dropdown__item dropdown__theme-toggle" id="dropdownThemeToggle">
                        <span class="dropdown__theme-icon-dark">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </span>
                        <span class="dropdown__theme-icon-light">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        </span>
                        <span id="themeLabel">${html.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="dropdown__section">
                    <p class="dropdown__label">Account</p>
                    <button class="dropdown__item" id="dropdownUserInfo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none"/>
                        </svg>
                        ${escapeHtml(currentUser.username)}
                    </button>
                    <button class="dropdown__item" id="dropdownSettingsBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Settings
                    </button>
                </div>
                <div class="dropdown__divider"></div>
                <div class="dropdown__section">
                    <p class="dropdown__label">Studio</p>
                    <button class="dropdown__item" id="dropdownMyVideosBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <polyline points="8 9 12 12 8 15"/>
                            <line x1="16" y1="9" x2="16" y2="15"/>
                        </svg>
                        My Videos
                    </button>
                    <button class="dropdown__item" id="dropdownLiveBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="8"/>
                            <path d="M12 4V2M8 6L6 4M16 6l2-2M12 20v2M4 12H2M6 16l-2 2M18 16l2 2M20 12h2"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Live Streaming
                    </button>
                    <button class="dropdown__item" id="dropdownStudioBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
                            <path d="M12 7v10M7 12h10"/>
                        </svg>
                        Orbiter Studio
                    </button>
                </div>
                <div class="dropdown__divider"></div>
                <div class="dropdown__section">
                    <button class="dropdown__item" id="dropdownAdBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="7" width="18" height="12" rx="2"/>
                            <path d="M7 13h10M12 7v10"/>
                        </svg>
                        Advertisement
                    </button>
                </div>
                <div class="dropdown__divider"></div>
                <div class="dropdown__section">
                    <button class="dropdown__item" id="dropdownLogoutBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Log out
                    </button>
                </div>
                <div class="dropdown__divider"></div>
                <div class="dropdown__section">
                    <p class="dropdown__label">Appearance</p>
                    <button class="dropdown__item dropdown__theme-toggle" id="dropdownThemeToggle">
                        <span class="dropdown__theme-icon-dark">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </span>
                        <span class="dropdown__theme-icon-light">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        </span>
                        <span>${html.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            `;
        }
    }

    function attachDropdownEvents() {
        const themeToggleBtn = document.getElementById('dropdownThemeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                window.setTheme(newTheme);
                renderDropdown();
            });
        }
        const loginBtn = document.getElementById('dropdownLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.openPopup(document.getElementById('loginPopup'));
            });
        }
        const signupBtn = document.getElementById('dropdownSignupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.openPopup(document.getElementById('signupPopup'));
            });
        }
        const logoutBtn = document.getElementById('dropdownLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.logoutUser();
            });
        }
        const settingsBtn = document.getElementById('dropdownSettingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.location.href = 'settings.html';
            });
        }
        const myVideosBtn = document.getElementById('dropdownMyVideosBtn');
        if (myVideosBtn) {
            myVideosBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.showToast('Your video library (coming soon)');
            });
        }
        const liveBtn = document.getElementById('dropdownLiveBtn');
        if (liveBtn) {
            liveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.showToast('Go live feature under development');
            });
        }
        const studioBtn = document.getElementById('dropdownStudioBtn');
        if (studioBtn) {
            studioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.showToast('Orbiter Studio dashboard coming soon');
            });
        }
        const adBtn = document.getElementById('dropdownAdBtn');
        if (adBtn) {
            adBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.showToast('Ad monetization panel will be available soon');
            });
        }
        const userInfoBtn = document.getElementById('dropdownUserInfo');
        if (userInfoBtn) {
            userInfoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('active');
                window.showToast(`Welcome ${window.currentUser?.username}!`);
            });
        }
    }

    function renderDropdown() {
        if (!profileDropdown) return;
        profileDropdown.innerHTML = buildDropdownHTML();
        attachDropdownEvents();
    }

    function initDropdownToggle() {
        if (!profileBtn || !profileDropdown) return;
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
            const createDropdown = document.getElementById('createDropdown');
            if (createDropdown) createDropdown.classList.remove('active');
        });
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    window.updateUserDropdown = function() {
        renderDropdown();
        const container = document.getElementById('profileAvatar');
        if (container && window.currentUser) {
            container.innerHTML = `<span style="font-weight:700;font-size:1rem;">${escapeHtml(window.currentUser.username.charAt(0).toUpperCase())}</span>`;
        } else if (container) {
            container.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }
    };

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initDropdownToggle();
                renderDropdown();
            });
        } else {
            initDropdownToggle();
            renderDropdown();
        }
    }
    init();
})();