// ===== Admin Panel Logic (Connected to Backend) =====
(function() {
    // API Base (same as core.js, or redefine)
    const API_BASE = 'http://localhost:8000';

    // ---------------------------------------
    // State
    // ---------------------------------------
    let users = [];            // will be fetched from API
    let videos = [];           // keep mock for now
    let liveStreams = [];      // keep mock for now

    // Mock data for videos & live (until endpoints are provided)
    const mockVideos = [
        { id: 101, title: "How to Explore Space", channel: "Channel Name", views: 1200000, uploadDate: "2026-04-01", status: "public", copyright: null },
        { id: 102, title: "ORBIT Platform Overview", channel: "Channel Name", views: 856000, uploadDate: "2026-03-15", status: "public", copyright: null },
        { id: 103, title: "Private Beta Footage", channel: "Secret Lab", views: 3200, uploadDate: "2026-02-28", status: "private", copyright: { type: "copyright-income", description: "Music revenue" } },
        { id: 104, title: "Unlisted Teaser", channel: "Channel Name", views: 45000, uploadDate: "2026-04-05", status: "unlisted", copyright: null }
    ];
    const mockLiveStreams = [
        { id: 201, title: "Exploring the Cosmos", streamer: "Channel Name", viewers: 12500, uptime: "34 min", ageRestricted: false, chatEnabled: true, copyright: null },
        { id: 202, title: "Late Night Jazz", streamer: "Music Lounge", viewers: 3400, uptime: "1 h 12 min", ageRestricted: false, chatEnabled: true, copyright: null }
    ];

    // Initialize with mock data for videos/live
    videos = [...mockVideos];
    liveStreams = [...mockLiveStreams];

    // Notifications (static demo)
    const notifications = [
        { id: 1, icon: "user", text: "New user registered: streamer_pro", time: "5 min ago" },
        { id: 2, icon: "video", text: "Video uploaded: How to Explore Space", time: "15 min ago" },
        { id: 3, icon: "copyright", text: "Copyright claim filed for 'Late Night Jazz'", time: "1 hour ago" },
        { id: 4, icon: "ban", text: "bad_user was permanently banned", time: "2 hours ago" },
        { id: 5, icon: "live", text: "New live stream started: 'Late Night Jazz'", time: "3 hours ago" }
    ];

    let currentSection = 'dashboard';

    // DOM elements
    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.admin-section');
    const notifBtn = document.getElementById('adminNotifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalVideosEl = document.getElementById('totalVideos');
    const bannedCountEl = document.getElementById('bannedCount');
    const recentActivityEl = document.getElementById('recentActivity');
    const userTableBody = document.getElementById('userTableBody');
    const videoTableBody = document.getElementById('videoTableBody');
    const liveTableBody = document.getElementById('liveTableBody');
    const userSearch = document.getElementById('userSearch');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');
    const videoSearch = document.getElementById('videoSearch');
    const videoStatusFilter = document.getElementById('videoStatusFilter');
    const liveSearch = document.getElementById('liveSearch');
    const toastContainer = document.getElementById('toastContainer');

    // Modals
    const banModalOverlay = document.getElementById('banModalOverlay');
    const banForm = document.getElementById('banForm');
    const banUsername = document.getElementById('banUsername');
    const banDuration = document.getElementById('banDuration');
    const banPermanent = document.getElementById('banPermanent');
    const editUserModalOverlay = document.getElementById('editUserModalOverlay');
    const editUserForm = document.getElementById('editUserForm');
    const editUserId = document.getElementById('editUserId');
    const editUsername = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    const editRole = document.getElementById('editRole');
    const editStatus = document.getElementById('editStatus');
    const editChannel = document.getElementById('editChannel');
    const editHandle = document.getElementById('editHandle');
    const editBio = document.getElementById('editBio');
    const editVideoModalOverlay = document.getElementById('editVideoModalOverlay');
    const editVideoForm = document.getElementById('editVideoForm');
    const editVideoId = document.getElementById('editVideoId');
    const editVideoTitle = document.getElementById('editVideoTitle');
    const editVideoChannel = document.getElementById('editVideoChannel');
    const editVideoStatus = document.getElementById('editVideoStatus');
    const copyrightModalOverlay = document.getElementById('copyrightModalOverlay');
    const copyrightForm = document.getElementById('copyrightForm');
    const copyrightVideoId = document.getElementById('copyrightVideoId');
    const copyrightType = document.getElementById('copyrightType');
    const copyrightDescription = document.getElementById('copyrightDescription');
    const copyrightVideoTitle = document.getElementById('copyrightVideoTitle');
    const editLiveModalOverlay = document.getElementById('editLiveModalOverlay');
    const editLiveForm = document.getElementById('editLiveForm');
    const editLiveId = document.getElementById('editLiveId');
    const editLiveTitle = document.getElementById('editLiveTitle');
    const editLiveStreamer = document.getElementById('editLiveStreamer');
    const editLiveAgeRestricted = document.getElementById('editLiveAgeRestricted');
    const editLiveChatEnabled = document.getElementById('editLiveChatEnabled');
    const liveCopyrightModalOverlay = document.getElementById('liveCopyrightModalOverlay');
    const liveCopyrightForm = document.getElementById('liveCopyrightForm');
    const liveCopyrightStreamId = document.getElementById('liveCopyrightStreamId');
    const liveCopyrightType = document.getElementById('liveCopyrightType');
    const liveCopyrightDescription = document.getElementById('liveCopyrightDescription');
    const liveCopyrightStreamTitle = document.getElementById('liveCopyrightStreamTitle');
    const messageModalOverlay = document.getElementById('messageModalOverlay');
    const messageForm = document.getElementById('messageForm');
    const messageStreamId = document.getElementById('messageStreamId');
    const messageStreamTitle = document.getElementById('messageStreamTitle');
    const messageText = document.getElementById('messageText');

    let currentBanUserId = null;
    let currentEditUserId = null;
    let currentEditVideoId = null;
    let currentCopyrightVideoId = null;
    let currentEditLiveId = null;
    let currentLiveCopyrightId = null;

    // Helper: Toast
    function showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    function closeAllModals() {
        [banModalOverlay, editUserModalOverlay, editVideoModalOverlay, copyrightModalOverlay,
         editLiveModalOverlay, liveCopyrightModalOverlay, messageModalOverlay].forEach(m => m.classList.remove('active'));
    }

    // ========== API Calls ==========
    async function fetchUsers() {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/`);
            if (!res.ok) throw new Error('Failed to fetch users');
            users = await res.json();
            return users;
        } catch (err) {
            console.error('Fetch users error:', err);
            showToast('Error loading users');
            return [];
        }
    }

    async function updateUserOnServer(userId, data) {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Update failed');
            }
            return await res.json();
        } catch (err) {
            console.error('Update user error:', err);
            showToast('Error updating user: ' + err.message);
            throw err;
        }
    }

    async function deleteUserOnServer(userId) {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Delete failed');
            return true;
        } catch (err) {
            console.error('Delete user error:', err);
            showToast('Error deleting user');
            throw err;
        }
    }

    // ========== Data Loading ==========
    async function loadUsers() {
        await fetchUsers();
        renderUsers();
        updateDashboard();
    }

    // fake load for videos/live (until endpoints exist)
    function loadVideos() {
        renderVideos();
        updateDashboard();
    }
    function loadLiveStreams() {
        renderLiveStreams();
        updateDashboard();
    }

    // ========== Dashboard ==========
    function updateDashboard() {
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        if (totalVideosEl) totalVideosEl.textContent = videos.length;
        if (bannedCountEl) bannedCountEl.textContent = users.filter(u => u.status === 'banned').length;
        if (recentActivityEl) {
            recentActivityEl.innerHTML = `
                <tr><td>User registered</td><td>new_user_42</td><td>Just now</td></tr>
                <tr><td>Video uploaded</td><td>"Space Walk"</td><td>5 min ago</td></tr>
            `;
        }
    }

    // ========== Notifications ==========
    function renderNotifications() {
        const count = notifications.length;
        notifBadge.textContent = count;
        notifBadge.style.display = count > 0 ? 'flex' : 'none';
        notifList.innerHTML = notifications.map(n => {
            let iconSVG = '';
            switch(n.icon) {
                case 'user':
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                    break;
                case 'video':
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
                    break;
                case 'copyright':
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14.5 9.5a3 3 0 0 0-5 0"/><path d="M9.5 14.5a3 3 0 0 0 5 0"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="17"/></svg>';
                    break;
                case 'ban':
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>';
                    break;
                case 'live':
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
                    break;
                default:
                    iconSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
            }
            return `
                <div class="notif-item">
                    <div class="notif-icon">${iconSVG}</div>
                    <div class="notif-text">
                        <p>${n.text}</p>
                        <span class="notif-time">${n.time}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
            notifDropdown.classList.remove('active');
        }
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            currentSection = item.dataset.section;
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById('section-' + currentSection).classList.add('active');
            if (currentSection === 'dashboard') updateDashboard();
            else if (currentSection === 'users') renderUsers();
            else if (currentSection === 'videos') renderVideos();
            else if (currentSection === 'live') renderLiveStreams();
        });
    });

    function getCopyrightBadge(copyright) {
        if (!copyright) return '';
        const type = copyright.type;
        const labelMap = {
            'no-copyright': 'No Copyright',
            'copyright-free': 'Copyright Free',
            'copyright-income': 'Copyright Income',
            'copyright-remove': 'Copyright Remove'
        };
        const classMap = {
            'no-copyright': 'badge-copyright-none',
            'copyright-free': 'badge-copyright-free',
            'copyright-income': 'badge-copyright-income',
            'copyright-remove': 'badge-copyright-remove'
        };
        return `<span class="badge ${classMap[type] || 'badge-copyright-none'}">${labelMap[type] || type}</span>`;
    }

    // ========== Users ==========
    function getFilteredUsers() {
        const search = userSearch.value.toLowerCase();
        const role = userRoleFilter.value;
        const status = userStatusFilter.value;
        return users.filter(u =>
            (u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)) &&
            (role === 'all' || u.role === role) &&
            (status === 'all' || u.status === status)
        );
    }

    function renderUsers() {
        const filtered = getFilteredUsers();
        userTableBody.innerHTML = filtered.map(u => {
            const streamBanIcon = u.streamBanned
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>` // Play icon (allow)
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`; // Ban icon
            return `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td><span class="badge badge-${u.role === 'admin' ? 'admin' : 'user'}">${u.role}</span></td>
                    <td><span class="badge badge-${u.status === 'active' ? 'active' : 'banned'}">${u.status}</span></td>
                    <td>${u.streamBanned ? '<span class="badge badge-stream-banned">Stream Banned</span>' : '<span class="badge badge-active">Can Stream</span>'}</td>
                    <td>${u.joinDate || '–'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-icon edit-user" data-id="${u.id}" title="Edit user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                            ${u.status === 'active' ? `<button class="action-icon ban-user" data-id="${u.id}" title="Ban user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>` : ''}
                            ${u.status === 'banned' ? `<button class="action-icon unban-user" data-id="${u.id}" title="Unban user" style="color:#00c853;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg></button>` : ''}
                            <button class="action-icon toggle-stream-ban" data-id="${u.id}" title="${u.streamBanned ? 'Allow streaming' : 'Ban from streaming'}">
                                ${streamBanIcon}
                            </button>
                            <button class="action-icon danger delete-user" data-id="${u.id}" title="Delete user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        attachUserActions();
    }

    function attachUserActions() {
        document.querySelectorAll('.edit-user').forEach(b => b.onclick = () => openEditUserModal(+b.dataset.id));
        document.querySelectorAll('.ban-user').forEach(b => b.onclick = () => openBanModal(+b.dataset.id));
        document.querySelectorAll('.unban-user').forEach(b => b.onclick = () => {
            const user = users.find(u => u.id === +b.dataset.id);
            if (user) {
                user.status = 'active';
                updateUserOnServer(user.id, { status: 'active' }).then(() => {
                    showToast(`${user.username} unbanned.`);
                    renderUsers();
                    updateDashboard();
                }).catch(() => {
                    // revert on error? keep UI as is
                });
            }
        });
        document.querySelectorAll('.toggle-stream-ban').forEach(b => {
            b.onclick = () => {
                const user = users.find(u => u.id === +b.dataset.id);
                if (user) {
                    user.streamBanned = !user.streamBanned;
                    updateUserOnServer(user.id, { streamBanned: user.streamBanned }).then(() => {
                        showToast(`Stream ${user.streamBanned ? 'disabled' : 'enabled'}.`);
                        renderUsers();
                    }).catch(() => {
                        user.streamBanned = !user.streamBanned; // revert
                        renderUsers();
                    });
                }
            };
        });
        document.querySelectorAll('.delete-user').forEach(b => b.onclick = () => {
            if (confirm('Delete this user permanently?')) deleteUser(+b.dataset.id);
        });
    }

    function deleteUser(id) {
        deleteUserOnServer(id).then(() => {
            users = users.filter(u => u.id !== id);
            showToast('User deleted.');
            renderUsers();
            updateDashboard();
        });
    }

    // Ban modal
    function openBanModal(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        currentBanUserId = userId;
        banUsername.value = user.username;
        banDuration.value = '';
        banPermanent.checked = false;
        banModalOverlay.classList.add('active');
    }
    function closeBanModal() { banModalOverlay.classList.remove('active'); currentBanUserId = null; }
    document.getElementById('closeBanModal').addEventListener('click', closeBanModal);
    banModalOverlay.addEventListener('click', e => { if (e.target === banModalOverlay) closeBanModal(); });
    banForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!currentBanUserId) return;
        const user = users.find(u => u.id === currentBanUserId);
        if (!user) return;
        user.status = 'banned';
        updateUserOnServer(user.id, { status: 'banned' }).then(() => {
            showToast(`${user.username} banned.`);
            closeBanModal();
            renderUsers();
            updateDashboard();
        }).catch(() => {
            user.status = 'active'; // revert
            renderUsers();
        });
    });

    // Edit user modal
    function openEditUserModal(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        currentEditUserId = userId;
        editUserId.value = user.id;
        editUsername.value = user.username;
        editEmail.value = user.email;
        editRole.value = user.role;
        editStatus.value = user.status;
        editChannel.value = user.channel || '';
        editHandle.value = user.handle || '';
        editBio.value = user.bio || '';
        editUserModalOverlay.classList.add('active');
    }
    function closeEditUserModal() { editUserModalOverlay.classList.remove('active'); }
    document.getElementById('closeEditUserModal').addEventListener('click', closeEditUserModal);
    editUserModalOverlay.addEventListener('click', e => { if (e.target === editUserModalOverlay) closeEditUserModal(); });
    editUserForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = users.find(u => u.id === currentEditUserId);
        if (!user) return;
        const updatedData = {
            username: editUsername.value,
            email: editEmail.value,
            role: editRole.value,
            status: editStatus.value,
            channel: editChannel.value,
            handle: editHandle.value,
            bio: editBio.value
        };
        updateUserOnServer(user.id, updatedData).then(() => {
            // Update local object
            Object.assign(user, updatedData);
            showToast('User updated.');
            closeEditUserModal();
            renderUsers();
            updateDashboard();
        });
    });

    userSearch.addEventListener('input', renderUsers);
    userRoleFilter.addEventListener('change', renderUsers);
    userStatusFilter.addEventListener('change', renderUsers);

    // ========== Videos (mock for now) ==========
    function getFilteredVideos() {
        const search = videoSearch.value.toLowerCase();
        const status = videoStatusFilter.value;
        return videos.filter(v =>
            v.title.toLowerCase().includes(search) &&
            (status === 'all' || v.status === status)
        );
    }

    function renderVideos() {
        videoTableBody.innerHTML = getFilteredVideos().map(v => `
            <tr>
                <td>${v.id}</td>
                <td>${v.title} ${getCopyrightBadge(v.copyright)}</td>
                <td>${v.channel}</td>
                <td>${v.views.toLocaleString()}</td>
                <td>${v.uploadDate}</td>
                <td><span class="badge badge-${v.status === 'public' ? 'active' : 'user'}">${v.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-icon edit-video" data-id="${v.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                        <button class="action-icon copyright-video" data-id="${v.id}" title="Copyright"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14.5 9.5a3 3 0 0 0-5 0"/><path d="M9.5 14.5a3 3 0 0 0 5 0"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="17"/></svg></button>
                        <button class="action-icon danger delete-video" data-id="${v.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                </td>
            </tr>
        `).join('');
        attachVideoActions();
    }

    function attachVideoActions() {
        document.querySelectorAll('.edit-video').forEach(b => b.onclick = () => openEditVideoModal(+b.dataset.id));
        document.querySelectorAll('.copyright-video').forEach(b => b.onclick = () => openCopyrightModal(+b.dataset.id));
        document.querySelectorAll('.delete-video').forEach(b => b.onclick = () => { if (confirm('Delete?')) deleteVideo(+b.dataset.id); });
    }

    function deleteVideo(id) { videos = videos.filter(v => v.id !== id); showToast('Deleted.'); renderVideos(); updateDashboard(); }

    function openEditVideoModal(videoId) {
        const video = videos.find(v => v.id === videoId); if (!video) return;
        currentEditVideoId = videoId;
        editVideoId.value = video.id; editVideoTitle.value = video.title; editVideoChannel.value = video.channel; editVideoStatus.value = video.status;
        editVideoModalOverlay.classList.add('active');
    }
    function closeEditVideoModal() { editVideoModalOverlay.classList.remove('active'); }
    document.getElementById('closeEditVideoModal').addEventListener('click', closeEditVideoModal);
    editVideoModalOverlay.addEventListener('click', e => { if (e.target === editVideoModalOverlay) closeEditVideoModal(); });
    editVideoForm.addEventListener('submit', e => {
        e.preventDefault();
        const video = videos.find(v => v.id === currentEditVideoId); if (!video) return;
        video.title = editVideoTitle.value; video.channel = editVideoChannel.value; video.status = editVideoStatus.value;
        showToast('Updated.'); closeEditVideoModal(); renderVideos();
    });

    function openCopyrightModal(videoId) {
        const video = videos.find(v => v.id === videoId); if (!video) return;
        currentCopyrightVideoId = videoId;
        copyrightVideoId.value = videoId;
        copyrightVideoTitle.value = video.title;
        copyrightType.value = video.copyright?.type || 'no-copyright';
        copyrightDescription.value = video.copyright?.description || '';
        copyrightModalOverlay.classList.add('active');
    }
    function closeCopyrightModal() { copyrightModalOverlay.classList.remove('active'); }
    document.getElementById('closeCopyrightModal').addEventListener('click', closeCopyrightModal);
    copyrightModalOverlay.addEventListener('click', e => { if (e.target === copyrightModalOverlay) closeCopyrightModal(); });
    copyrightForm.addEventListener('submit', e => {
        e.preventDefault();
        const video = videos.find(v => v.id === currentCopyrightVideoId); if (!video) return;
        video.copyright = { type: copyrightType.value, description: copyrightDescription.value };
        showToast('Copyright claim saved.');
        closeCopyrightModal();
        renderVideos();
    });

    videoSearch.addEventListener('input', renderVideos);
    videoStatusFilter.addEventListener('change', renderVideos);

    // ========== Live Streams (mock) ==========
    function getFilteredLive() {
        const search = liveSearch.value.toLowerCase();
        return liveStreams.filter(s => s.title.toLowerCase().includes(search) || s.streamer.toLowerCase().includes(search));
    }

    function renderLiveStreams() {
        liveTableBody.innerHTML = getFilteredLive().map(ls => `
            <tr>
                <td>${ls.id}</td>
                <td>${ls.title} ${getCopyrightBadge(ls.copyright)}</td>
                <td>${ls.streamer}</td>
                <td>${ls.viewers.toLocaleString()}</td>
                <td>${ls.uptime}</td>
                <td>${ls.ageRestricted ? '<span class="badge badge-banned">Age Restricted</span>' : '<span class="badge badge-active">Open</span>'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-icon edit-live" data-id="${ls.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                        <button class="action-icon live-copyright" data-id="${ls.id}" title="Copyright"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14.5 9.5a3 3 0 0 0-5 0"/><path d="M9.5 14.5a3 3 0 0 0 5 0"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="17"/></svg></button>
                        <button class="action-icon message-streamer" data-id="${ls.id}" title="Message streamer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>
                        <button class="action-icon toggle-age-restrict" data-id="${ls.id}" title="Age Restrict"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></button>
                        <button class="action-icon toggle-chat" data-id="${ls.id}" title="${ls.chatEnabled ? 'Disable chat' : 'Enable chat'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
                        <button class="action-icon danger end-stream" data-id="${ls.id}" title="End Stream"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>
                    </div>
                </td>
            </tr>
        `).join('');
        attachLiveActions();
    }

    function attachLiveActions() {
        document.querySelectorAll('.edit-live').forEach(b => b.onclick = () => openEditLiveModal(+b.dataset.id));
        document.querySelectorAll('.live-copyright').forEach(b => b.onclick = () => openLiveCopyrightModal(+b.dataset.id));
        document.querySelectorAll('.message-streamer').forEach(b => b.onclick = () => openMessageModal(+b.dataset.id));
        document.querySelectorAll('.toggle-age-restrict').forEach(b => {
            b.onclick = () => {
                const ls = liveStreams.find(s => s.id === +b.dataset.id);
                if (ls) {
                    ls.ageRestricted = !ls.ageRestricted;
                    showToast(`Age restriction ${ls.ageRestricted ? 'enabled' : 'disabled'}.`);
                    renderLiveStreams();
                }
            };
        });
        document.querySelectorAll('.toggle-chat').forEach(b => {
            b.onclick = () => {
                const ls = liveStreams.find(s => s.id === +b.dataset.id);
                if (ls) {
                    ls.chatEnabled = !ls.chatEnabled;
                    showToast(`Chat ${ls.chatEnabled ? 'enabled' : 'disabled'}.`);
                    renderLiveStreams();
                }
            };
        });
        document.querySelectorAll('.end-stream').forEach(b => {
            b.onclick = () => {
                const id = +b.dataset.id;
                const ls = liveStreams.find(s => s.id === id);
                if (ls && confirm(`End "${ls.title}"?`)) {
                    liveStreams = liveStreams.filter(s => s.id !== id);
                    showToast('Stream ended.');
                    renderLiveStreams();
                }
            };
        });
    }

    function openEditLiveModal(streamId) {
        const stream = liveStreams.find(s => s.id === streamId); if (!stream) return;
        currentEditLiveId = streamId;
        editLiveId.value = stream.id;
        editLiveTitle.value = stream.title;
        editLiveStreamer.value = stream.streamer;
        editLiveAgeRestricted.checked = stream.ageRestricted;
        editLiveChatEnabled.checked = stream.chatEnabled;
        editLiveModalOverlay.classList.add('active');
    }
    function closeEditLiveModal() { editLiveModalOverlay.classList.remove('active'); }
    document.getElementById('closeEditLiveModal').addEventListener('click', closeEditLiveModal);
    editLiveModalOverlay.addEventListener('click', e => { if (e.target === editLiveModalOverlay) closeEditLiveModal(); });
    editLiveForm.addEventListener('submit', e => {
        e.preventDefault();
        const stream = liveStreams.find(s => s.id === currentEditLiveId); if (!stream) return;
        stream.title = editLiveTitle.value;
        stream.streamer = editLiveStreamer.value;
        stream.ageRestricted = editLiveAgeRestricted.checked;
        stream.chatEnabled = editLiveChatEnabled.checked;
        showToast('Stream updated.');
        closeEditLiveModal();
        renderLiveStreams();
    });

    function openLiveCopyrightModal(streamId) {
        const stream = liveStreams.find(s => s.id === streamId); if (!stream) return;
        currentLiveCopyrightId = streamId;
        liveCopyrightStreamId.value = streamId;
        liveCopyrightStreamTitle.value = stream.title;
        liveCopyrightType.value = stream.copyright?.type || 'no-copyright';
        liveCopyrightDescription.value = stream.copyright?.description || '';
        liveCopyrightModalOverlay.classList.add('active');
    }
    function closeLiveCopyrightModal() { liveCopyrightModalOverlay.classList.remove('active'); }
    document.getElementById('closeLiveCopyrightModal').addEventListener('click', closeLiveCopyrightModal);
    liveCopyrightModalOverlay.addEventListener('click', e => { if (e.target === liveCopyrightModalOverlay) closeLiveCopyrightModal(); });
    liveCopyrightForm.addEventListener('submit', e => {
        e.preventDefault();
        const stream = liveStreams.find(s => s.id === currentLiveCopyrightId); if (!stream) return;
        stream.copyright = { type: liveCopyrightType.value, description: liveCopyrightDescription.value };
        showToast('Live copyright claim saved.');
        closeLiveCopyrightModal();
        renderLiveStreams();
    });

    function openMessageModal(streamId) {
        const stream = liveStreams.find(s => s.id === streamId); if (!stream) return;
        messageStreamId.value = streamId;
        messageStreamTitle.value = stream.title;
        messageText.value = '';
        messageModalOverlay.classList.add('active');
    }
    function closeMessageModal() { messageModalOverlay.classList.remove('active'); }
    document.getElementById('closeMessageModal').addEventListener('click', closeMessageModal);
    messageModalOverlay.addEventListener('click', e => { if (e.target === messageModalOverlay) closeMessageModal(); });
    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const stream = liveStreams.find(s => s.id === +messageStreamId.value);
        if (stream) {
            showToast(`Message sent to ${stream.streamer}: "${messageText.value}"`);
        }
        closeMessageModal();
    });

    liveSearch.addEventListener('input', renderLiveStreams);

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

    // ========== Init ==========
    renderNotifications();
    loadUsers();    // Fetch real users from API, then render
    loadVideos();   // still mock
    loadLiveStreams(); // still mock
})();