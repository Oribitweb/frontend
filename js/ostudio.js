// ostudio.js – Orbiter Studio Complete Redesign
(function() {
    const API_BASE = 'http://localhost:8000';
    let currentUser = null;
    let userVideos = [];
    let userStats = { subscribers: 342, watchTimeHours: 1450, videosLast90Days: 2, isEligible: false };
    let currentPage = 1;
    const PER_PAGE = 8;
    let analyticsChart, viewsChart;
    let liveStreamActive = false;
    let uptimeInterval = null;
    let uptimeSeconds = 0;
    let notifications = [];
    let categories = [];
    let homeSections = [];
    let userPlaylists = [
        { id: 1, name: "My Favorite Videos" },
        { id: 2, name: "Gaming Highlights" },
        { id: 3, name: "Travel Vlogs" }
    ]; // mock playlists
    let adMarkers = [];
    let copyrightClear = false;
    let currentEditVideo = null;

    // DOM Elements
    const navItems = document.querySelectorAll('.studio-nav-item:not([href])');
    const viewsEl = document.querySelectorAll('.studio-view');
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    const notifBell = document.getElementById('notifBellBtn');
    const notifCenter = document.getElementById('notifCenter');

    // ========== Helper Functions ==========
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }

    window.showToast = function(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    function formatDuration(seconds) {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ========== Load Categories ==========
    function loadCategories() {
        if (window.ORBIT_CATEGORIES && Array.isArray(window.ORBIT_CATEGORIES)) {
            categories = window.ORBIT_CATEGORIES;
        } else {
            categories = [
                { name: "Counter Strike 2", viewers: 492 },
                { name: "PUBG MOBILE", viewers: 532 },
                { name: "Minecraft", viewers: 6000.9 },
                { name: "Just Chatting", viewers: 58.5 },
                { name: "Music", viewers: 0.5 },
                { name: "Dota 2", viewers: 81 },
                { name: "FiveM", viewers: 1000.5 },
                { name: "Science", viewers: 0.5 }
            ];
        }
        initCategorySearch();
    }

    function getCategoryImageUrl(categoryName) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
        return `assets/categories/${slug}.webp`;
    }

    // ========== Category Search with Images ==========
    function initCategorySearch() {
        // Upload popup category search
        const searchInput = document.getElementById('uploadCategorySearch');
        const dropdown = document.getElementById('uploadCategoryDropdown');
        const hiddenSelect = document.getElementById('category');
        if (searchInput && dropdown) {
            function renderDropdown(filter = '') {
                const filtered = categories.filter(cat => cat.name.toLowerCase().includes(filter.toLowerCase()));
                if (filtered.length === 0) {
                    dropdown.innerHTML = '<div class="category-item" style="justify-content:center;">No categories found</div>';
                    dropdown.style.display = 'block';
                    return;
                }
                dropdown.innerHTML = filtered.map(cat => `
                    <div class="category-item" data-name="${escapeHtml(cat.name)}">
                        <img src="${getCategoryImageUrl(cat.name)}" onerror="this.src='assets/thumbnail.png'">
                        <span>${escapeHtml(cat.name)}</span>
                        <span class="category-viewers">${cat.viewers}K viewers</span>
                    </div>
                `).join('');
                dropdown.style.display = 'block';
                dropdown.querySelectorAll('.category-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const name = item.dataset.name;
                        searchInput.value = name;
                        if (hiddenSelect) hiddenSelect.value = name;
                        dropdown.style.display = 'none';
                    });
                });
            }
            searchInput.addEventListener('input', (e) => renderDropdown(e.target.value));
            searchInput.addEventListener('focus', () => renderDropdown(searchInput.value));
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
            });
            if (categories.length > 0) {
                searchInput.value = categories[0].name;
                if (hiddenSelect) hiddenSelect.value = categories[0].name;
            }
        }

        // Edit video modal category search
        const editSearch = document.getElementById('editCategorySearch');
        const editDropdown = document.getElementById('editCategoryDropdown');
        const editHidden = document.getElementById('editVideoCategory');
        if (editSearch && editDropdown) {
            function renderEditDropdown(filter = '') {
                const filtered = categories.filter(cat => cat.name.toLowerCase().includes(filter.toLowerCase()));
                if (filtered.length === 0) {
                    editDropdown.innerHTML = '<div class="category-item" style="justify-content:center;">No categories found</div>';
                    editDropdown.style.display = 'block';
                    return;
                }
                editDropdown.innerHTML = filtered.map(cat => `
                    <div class="category-item" data-name="${escapeHtml(cat.name)}">
                        <img src="${getCategoryImageUrl(cat.name)}">
                        <span>${escapeHtml(cat.name)}</span>
                    </div>
                `).join('');
                editDropdown.style.display = 'block';
                editDropdown.querySelectorAll('.category-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const name = item.dataset.name;
                        editSearch.value = name;
                        if (editHidden) editHidden.value = name;
                        editDropdown.style.display = 'none';
                    });
                });
            }
            editSearch.addEventListener('input', (e) => renderEditDropdown(e.target.value));
            editSearch.addEventListener('focus', () => renderEditDropdown(editSearch.value));
            document.addEventListener('click', (e) => {
                if (!editSearch.contains(e.target) && !editDropdown.contains(e.target)) editDropdown.style.display = 'none';
            });
        }
    }

    // ========== Mock Data ==========
    function generateMockVideos() {
        return [
            { id: 1, title: 'My First Vlog', description: 'First video ever!', thumbnail: 'assets/thumbnail.png', views: 12500, likes: 890, comments: 45, uploadDate: '2026-05-10', duration: 750, visibility: 'public', tags: ['vlog'], category: 'entertainment', playlistId: 1, license: 'standard', allowComments: true },
            { id: 2, title: 'Coding Tutorial: React Hooks', description: 'Learn React Hooks', thumbnail: 'assets/thumbnail.png', views: 8700, likes: 620, comments: 32, uploadDate: '2026-05-05', duration: 1100, visibility: 'public', tags: ['coding', 'react'], category: 'education', playlistId: null, license: 'standard', allowComments: true },
            { id: 3, title: 'Unlisted Test Video', description: 'Testing', thumbnail: 'assets/thumbnail.png', views: 3400, likes: 210, comments: 12, uploadDate: '2026-04-28', duration: 495, visibility: 'unlisted', tags: [], category: 'science', playlistId: 2, license: 'cc', allowComments: false }
        ];
    }

    function generateCommunityPosts() {
        return [
            { id: 1, author: currentUser?.username || 'Creator', avatar: 'C', content: 'Just uploaded a new video! Check it out 🚀', time: '2 hours ago', likes: 45, comments: 12 },
            { id: 2, author: currentUser?.username || 'Creator', avatar: 'C', content: 'What content would you like to see next? Let me know in the comments!', time: '2 days ago', likes: 128, comments: 34 }
        ];
    }

    function generateCopyrightClaims() {
        return [
            { id: 1, videoTitle: 'My First Vlog', type: 'Copyright Infringement', status: 'pending', date: '2026-05-10' },
            { id: 2, videoTitle: 'Coding Tutorial', type: 'Trademark Violation', status: 'resolved', date: '2026-05-01' }
        ];
    }

    function generateNotifications() {
        return [
            { id: 1, type: 'comment', message: 'JohnDoe commented on your video', time: '5 min ago', read: false },
            { id: 2, type: 'like', message: 'Your video reached 1000 likes!', time: '1 hour ago', read: false },
            { id: 3, type: 'subscriber', message: 'You gained 10 new subscribers', time: '3 hours ago', read: true }
        ];
    }

    const royaltyFreeTracks = [
        { id: 1, title: "Ambient Dreams", artist: "Orbit Music", duration: "3:24", url: "assets/music/ambient.mp3" },
        { id: 2, title: "Tech Beats", artist: "Electro Lab", duration: "2:58", url: "assets/music/tech.mp3" },
        { id: 3, title: "Acoustic Sunset", artist: "Folk Harmony", duration: "4:12", url: "assets/music/acoustic.mp3" },
        { id: 4, title: "Deep House", artist: "Nightdrive", duration: "5:01", url: "assets/music/deephouse.mp3" }
    ];

    // ========== Dashboard ==========
    function calculateUserStats() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        userStats.videosLast90Days = userVideos.filter(v => new Date(v.uploadDate) >= ninetyDaysAgo).length;
        userStats.watchTimeHours = userVideos.reduce((sum, v) => sum + (v.views * (v.duration / 60 / 60)), 0);
        userStats.isEligible = userStats.subscribers >= 500 && userStats.watchTimeHours >= 2000 && userStats.videosLast90Days >= 3;
    }

    function renderDashboard() {
        const totalViews = userVideos.reduce((s, v) => s + v.views, 0);
        document.getElementById('dashboardStats').innerHTML = `
            <div class="stat-card"><div class="stat-label">Total Views</div><div class="stat-value">${totalViews.toLocaleString()}</div><div class="stat-change">All time</div></div>
            <div class="stat-card"><div class="stat-label">Videos</div><div class="stat-value">${userVideos.length}</div><div class="stat-change">Published</div></div>
            <div class="stat-card"><div class="stat-label">Subscribers</div><div class="stat-value">${userStats.subscribers.toLocaleString()}</div><div class="stat-change">Target: 500</div></div>
            <div class="stat-card"><div class="stat-label">Watch Time</div><div class="stat-value">${Math.round(userStats.watchTimeHours).toLocaleString()} hrs</div><div class="stat-change">Target: 2000 hrs</div></div>
        `;
        if (viewsChart) viewsChart.destroy();
        const ctx = document.getElementById('viewsChart').getContext('2d');
        viewsChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: userVideos.slice(0, 7).map(v => v.title.substring(0, 12)), datasets: [{ label: 'Views', data: userVideos.slice(0, 7).map(v => v.views), backgroundColor: '#00c853', borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
        document.getElementById('recentVideoList').innerHTML = userVideos.slice(0, 4).map(v => `
            <div class="video-list-item"><img class="video-list-thumb" src="${v.thumbnail}"><div class="video-list-info"><div class="video-list-title">${escapeHtml(v.title)}</div><div class="video-list-meta">${v.views.toLocaleString()} views</div></div></div>
        `).join('');
    }

    // ========== Content (Videos Table) ==========
    function renderVideosTable(search = '', visibility = 'all') {
        let filtered = userVideos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) && (visibility === 'all' || v.visibility === visibility));
        const start = (currentPage - 1) * PER_PAGE;
        const paginated = filtered.slice(start, start + PER_PAGE);
        document.getElementById('videosTableBody').innerHTML = paginated.map(v => `
            <tr>
                <td class="video-cell"><img class="video-thumb-sm" src="${v.thumbnail}"><div><h4 style="font-weight:600;">${escapeHtml(v.title)}</h4><p style="font-size:0.7rem;color:var(--text-secondary);">${formatDuration(v.duration)}</p></div></td>
                <td><span class="badge badge-${v.visibility}">${v.visibility}</span></td>
                <td>${v.views.toLocaleString()}</td>
                <td>${v.comments}</td>
                <td>${new Date(v.uploadDate).toLocaleDateString()}</td>
                <td><button class="action-btn edit-video" data-id="${v.id}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button></td>
            </tr>
        `).join('');
        renderPagination(filtered.length);
        document.querySelectorAll('.edit-video').forEach(btn => btn.onclick = () => openEditVideoModal(parseInt(btn.dataset.id)));
    }

    function renderPagination(total) {
        const totalPages = Math.ceil(total / PER_PAGE);
        const container = document.getElementById('contentPagination');
        if (!container || totalPages <= 1) { if (container) container.innerHTML = ''; return; }
        let html = '<div class="pagination">';
        for (let i = 1; i <= totalPages; i++) html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        html += '</div>';
        container.innerHTML = html;
        container.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); renderVideosTable(); }));
    }

    // ========== Edit Video Popup ==========
    function openEditVideoModal(videoId) {
        const video = userVideos.find(v => v.id === videoId);
        if (!video) return;
        currentEditVideo = video;
        document.getElementById('editVideoId').value = video.id;
        document.getElementById('editVideoTitle').value = video.title;
        document.getElementById('editVideoDescription').value = video.description || '';
        document.getElementById('editVideoVisibility').value = video.visibility;
        if (video.thumbnail) document.getElementById('editThumbPreview').src = video.thumbnail;
        document.getElementById('editCategorySearch').value = video.category || '';
        document.getElementById('editVideoLanguage').value = 'en';
        // Tags
        const tags = video.tags || [];
        const tagDisplay = document.getElementById('editTagDisplay');
        function updateEditTagsDisplay(tagsArr) {
            tagDisplay.innerHTML = tagsArr.map((t, i) => `<span class="tag-chip">${escapeHtml(t)}<button data-index="${i}">×</button></span>`).join('');
            document.querySelectorAll('#editTagDisplay .tag-chip button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.dataset.index);
                    tagsArr.splice(idx, 1);
                    updateEditTagsDisplay(tagsArr);
                });
            });
        }
        updateEditTagsDisplay([...tags]);
        document.getElementById('editAddTagBtn').onclick = () => {
            const input = document.getElementById('editTagInput');
            if (input.value.trim()) {
                tags.push(input.value.trim());
                updateEditTagsDisplay(tags);
                input.value = '';
            }
        };
        // Playlist
        const playlistSelect = document.getElementById('editVideoPlaylist');
        playlistSelect.innerHTML = '<option value="">None</option>' + userPlaylists.map(p => `<option value="${p.id}" ${video.playlistId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
        document.getElementById('editVideoModalOverlay').classList.add('active');
    }

    function closeEditVideoModal() {
        document.getElementById('editVideoModalOverlay').classList.remove('active');
    }
    document.getElementById('closeEditVideoModal')?.addEventListener('click', closeEditVideoModal);
    document.getElementById('editVideoForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Update video object
        if (currentEditVideo) {
            currentEditVideo.title = document.getElementById('editVideoTitle').value;
            currentEditVideo.description = document.getElementById('editVideoDescription').value;
            currentEditVideo.visibility = document.getElementById('editVideoVisibility').value;
            currentEditVideo.category = document.getElementById('editCategorySearch').value;
            // Tags - gather from display
            const tagSpans = document.querySelectorAll('#editTagDisplay .tag-chip');
            currentEditVideo.tags = Array.from(tagSpans).map(span => span.childNodes[0].nodeValue.trim());
            currentEditVideo.playlistId = parseInt(document.getElementById('editVideoPlaylist').value) || null;
            window.showToast('Video updated!');
            closeEditVideoModal();
            renderVideosTable();
            renderDashboard();
        }
    });

    // ========== Community Posts ==========
    function renderCommunityPosts() {
        const posts = generateCommunityPosts();
        document.getElementById('communityPostsList').innerHTML = posts.map(p => `
            <div class="community-post"><div class="post-header"><div class="post-avatar">${p.avatar}</div><div><span class="post-author">${escapeHtml(p.author)}</span><span class="post-time">${p.time}</span></div></div><div class="post-content">${escapeHtml(p.content)}</div><div class="post-stats"><span>❤️ ${p.likes} likes</span><span>💬 ${p.comments} comments</span></div></div>
        `).join('');
    }

    // ========== Analytics ==========
    function renderAnalytics() {
        const totalViews = userVideos.reduce((s, v) => s + v.views, 0);
        const totalLikes = userVideos.reduce((s, v) => s + (v.likes || 0), 0);
        document.getElementById('coreMetrics').innerHTML = `
            <div class="metric-card"><span>Subscribers</span><span>${userStats.subscribers}</span></div>
            <div class="metric-card"><span>Views</span><span>${totalViews.toLocaleString()}</span></div>
            <div class="metric-card"><span>Likes</span><span>${totalLikes}</span></div>
            <div class="metric-card"><span>Watch Time</span><span>${Math.round(userStats.watchTimeHours)} hrs</span></div>
        `;
        document.getElementById('advancedStats').innerHTML = `
            <div class="metric-card"><span>Likes/Views</span><span>${totalViews ? ((totalLikes / totalViews) * 100).toFixed(1) : 0}%</span></div>
            <div class="metric-card"><span>Click Rate</span><span>7.8%</span></div>
            <div class="metric-card"><span>Delivery Rate</span><span>92%</span></div>
            <div class="metric-card"><span>Attractiveness</span><span>71%</span></div>
        `;
        if (analyticsChart) analyticsChart.destroy();
        analyticsChart = new Chart(document.getElementById('analyticsChart'), {
            type: 'line',
            data: { labels: Array.from({ length: 28 }, (_, i) => `Day ${i + 1}`), datasets: [{ label: 'Views', data: Array.from({ length: 28 }, () => Math.floor(Math.random() * 500) + 100), borderColor: '#00c853', fill: true, tension: 0.3 }] },
            options: { responsive: true }
        });
        const topVideos = [...userVideos].sort((a, b) => b.views - a.views).slice(0, 4);
        document.getElementById('topContentList').innerHTML = topVideos.map(v => `
            <div class="video-list-item"><img class="video-list-thumb" src="${v.thumbnail}"><div class="video-list-info"><div class="video-list-title">${escapeHtml(v.title)}</div><div class="video-list-meta">${v.views.toLocaleString()} views</div></div></div>
        `).join('');
    }

    // ========== Comments (exactly like video.php) ==========
    let studioCommentEmojiMenuActive = false;
    function renderComments() {
        const container = document.getElementById('studioCommentsList');
        if (!container) return;
        container.innerHTML = `
            <div class="add-comment">
                <div class="user-avatar">U</div>
                <div class="comment-input-wrapper">
                    <input type="text" class="comment-input" id="studioCommentInput" placeholder="Add a comment..." maxlength="400">
                    <button class="emoji-btn" id="studioEmojiBtn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
                    <button class="send-btn" id="studioSendCommentBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-12z"/></svg></button>
                </div>
                <span class="char-counter" id="studioCharCounter">0 / 400</span>
                <div class="emoji-menu" id="studioEmojiMenu"></div>
            </div>
            <div class="comment-list" id="studioCommentList"></div>
        `;
        // Static emoji list
        const staticEmojis = ['happy','sad','shocked','like','dislike','thank','angry','stupid','ok','iran'];
        const emojiMenu = document.getElementById('studioEmojiMenu');
        staticEmojis.forEach(name => {
            const img = document.createElement('img');
            img.src = `assets/emoji/${name}.png`;
            img.alt = name;
            img.addEventListener('click', () => {
                document.getElementById('studioCommentInput').value += `:${name}:`;
                emojiMenu.classList.remove('active');
                document.getElementById('studioCommentInput').focus();
            });
            emojiMenu.appendChild(img);
        });
        document.getElementById('studioEmojiBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!emojiMenu.contains(e.target) && e.target !== document.getElementById('studioEmojiBtn')) emojiMenu.classList.remove('active');
        });
        // Char counter
        const commentInput = document.getElementById('studioCommentInput');
        const charCounter = document.getElementById('studioCharCounter');
        commentInput?.addEventListener('input', () => {
            charCounter.textContent = `${commentInput.value.length} / 400`;
            if (commentInput.value.length >= 400) charCounter.style.color = '#ff4444';
            else charCounter.style.color = 'var(--text-secondary)';
        });
        // Send comment
        function sendStudioComment() {
            const text = commentInput.value.trim();
            if (!text) return;
            const commentList = document.getElementById('studioCommentList');
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `
                <div class="comment-avatar">U</div>
                <div class="comment-body">
                    <div class="comment-author">You <span class="comment-time">${now}</span></div>
                    <p>${escapeHtml(text).replace(/:([a-z]+):/g, (m, name) => staticEmojis.includes(name) ? `<img src="assets/emoji/${name}.png" class="emoji-inline" style="width:18px;height:18px;">` : m)}</p>
                    <div class="comment-actions-row">
                        <button class="comment-action-btn like-comment-btn">👍 <span>0</span></button>
                        <button class="comment-action-btn reply-toggle-btn">Reply</button>
                    </div>
                    <div class="reply-form" style="display:none;">
                        <input type="text" class="reply-input" placeholder="Write a reply...">
                        <button class="reply-send-btn">Reply</button>
                    </div>
                    <div class="reply-list"></div>
                </div>
            `;
            commentList.prepend(div);
            attachStudioCommentListeners(div);
            commentInput.value = '';
            charCounter.textContent = '0 / 400';
        }
        document.getElementById('studioSendCommentBtn')?.addEventListener('click', sendStudioComment);
        commentInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendStudioComment(); } });
        // Mock existing comment
        const commentList = document.getElementById('studioCommentList');
        commentList.innerHTML = `
            <div class="comment">
                <div class="comment-avatar">J</div>
                <div class="comment-body">
                    <div class="comment-author">JohnDoe <span class="comment-time">2 days ago</span></div>
                    <p>Great video! Keep it up.</p>
                    <div class="comment-actions-row">
                        <button class="comment-action-btn like-comment-btn">👍 <span>12</span></button>
                        <button class="comment-action-btn reply-toggle-btn">Reply</button>
                    </div>
                    <div class="reply-form" style="display:none;">
                        <input type="text" class="reply-input" placeholder="Write a reply...">
                        <button class="reply-send-btn">Reply</button>
                    </div>
                    <div class="reply-list"></div>
                </div>
            </div>
        `;
        document.querySelectorAll('.comment').forEach(c => attachStudioCommentListeners(c));
    }

    function attachStudioCommentListeners(commentEl) {
        const toggleBtn = commentEl.querySelector('.reply-toggle-btn');
        const replyForm = commentEl.querySelector('.reply-form');
        const replyInput = commentEl.querySelector('.reply-input');
        const replySendBtn = commentEl.querySelector('.reply-send-btn');
        const replyList = commentEl.querySelector('.reply-list');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
            });
        }
        if (replySendBtn) {
            replySendBtn.addEventListener('click', () => {
                const replyText = replyInput.value.trim();
                if (replyText) {
                    const replyDiv = document.createElement('div');
                    replyDiv.className = 'comment';
                    replyDiv.style.marginLeft = '20px';
                    replyDiv.innerHTML = `<div class="comment-avatar">U</div><div class="comment-body"><div class="comment-author">You <span class="comment-time">Just now</span></div><p>${escapeHtml(replyText)}</p></div>`;
                    replyList.appendChild(replyDiv);
                    replyInput.value = '';
                    replyForm.style.display = 'none';
                }
            });
            replyInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') replySendBtn.click(); });
        }
        const likeBtn = commentEl.querySelector('.like-comment-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                const span = likeBtn.querySelector('span');
                let likes = parseInt(span.innerText);
                likes++;
                span.innerText = likes;
                likeBtn.style.color = 'var(--accent)';
            });
        }
    }

    // ========== Live Studio (with player and chat like live.php) ==========
    const gifEmojiList = window.gifEmojis || [];
    const gifEmojiSet = new Set(gifEmojiList);
    const staticEmojiNames = ['happy','sad','shocked','like','dislike','thank','angry','stupid','ok','iran'];

    function formatChatText(text) {
        return escapeHtml(text).replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
            const gifFilename = name + '.gif';
            if (gifEmojiSet.has(gifFilename)) return `<img class="emoji-inline" src="assets/emoji/gif/${gifFilename}" alt="${name}">`;
            if (staticEmojiNames.includes(name)) return `<img class="emoji-inline" src="assets/emoji/${name}.png" alt="${name}">`;
            return match;
        });
    }

    function addLiveChatMessage(author, text, verified = false) {
        const chatMessages = document.getElementById('liveChatMessages');
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        const formatted = formatChatText(text);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const verifiedBadge = verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>` : '';
        msgDiv.innerHTML = `<div class="chat-avatar">${escapeHtml(author[0])}</div><div class="chat-content"><div><span class="chat-author">${escapeHtml(author)}${verifiedBadge}</span><span class="chat-time"> ${now}</span></div><div class="chat-text">${formatted}</div></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function buildLiveEmojiMenu() {
        const menu = document.getElementById('liveEmojiMenu');
        if (!menu) return;
        menu.innerHTML = '';
        staticEmojiNames.forEach(name => {
            const img = document.createElement('img');
            img.src = `assets/emoji/${name}.png`;
            img.alt = name;
            img.addEventListener('click', () => {
                const input = document.getElementById('liveChatInput');
                input.value += `:${name}:`;
                menu.classList.remove('active');
                input.focus();
            });
            menu.appendChild(img);
        });
        gifEmojiList.forEach(gif => {
            const name = gif.split('.')[0];
            const img = document.createElement('img');
            img.src = `assets/emoji/gif/${gif}`;
            img.alt = name;
            img.addEventListener('click', () => {
                const input = document.getElementById('liveChatInput');
                input.value += `:${name}:`;
                menu.classList.remove('active');
                input.focus();
            });
            menu.appendChild(img);
        });
    }

    function setupLiveStudio() {
        const offlineBanner = document.getElementById('offlineBanner');
        const liveVideo = document.getElementById('livePreviewVideo');
        const liveIndicator = document.getElementById('liveIndicator');
        const liveStatusBadge = document.getElementById('liveStatusBadge');
        const viewersSpan = document.getElementById('liveViewers');
        const uptimeSpan = document.getElementById('liveUptime');
        const chatInput = document.getElementById('liveChatInput');
        const chatSendBtn = document.getElementById('liveChatSendBtn');
        const qualityBadge = document.getElementById('streamQualityBadge');
        const playBtn = document.getElementById('livePlayBtn');
        const playIcon = playBtn?.querySelector('.play-icon');
        const pauseIcon = playBtn?.querySelector('.pause-icon');
        const volumeBtn = document.getElementById('liveVolumeBtn');
        const volOnIcon = volumeBtn?.querySelector('.vol-on');
        const volOffIcon = volumeBtn?.querySelector('.vol-off');
        const volumeSlider = document.getElementById('liveVolumeSlider');
        const fullscreenBtn = document.getElementById('liveFullscreenBtn');
        const playerWrapper = document.getElementById('livePlayerContainer');
        const mutedIndicator = document.getElementById('mutedIndicatorLive');

        function updateVolIcon() {
            if (liveVideo.muted || liveVideo.volume === 0) {
                volOnIcon.style.display = 'none';
                volOffIcon.style.display = 'block';
            } else {
                volOnIcon.style.display = 'block';
                volOffIcon.style.display = 'none';
            }
            if (mutedIndicator) {
                if (liveVideo.muted) mutedIndicator.style.display = 'flex';
                else mutedIndicator.style.display = 'none';
            }
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (liveVideo.paused) liveVideo.play();
                else liveVideo.pause();
            });
            liveVideo.addEventListener('play', () => { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
            liveVideo.addEventListener('pause', () => { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });
        }
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => { liveVideo.volume = volumeSlider.value; updateVolIcon(); });
            volumeBtn.addEventListener('click', () => {
                if (liveVideo.volume > 0) { liveVideo.muted = !liveVideo.muted; updateVolIcon(); }
                else { liveVideo.muted = false; liveVideo.volume = 1; volumeSlider.value = 1; updateVolIcon(); }
            });
        }
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (document.fullscreenElement) document.exitFullscreen();
                else playerWrapper.requestFullscreen();
            });
        }

        // Simulate OBS stream after 3 seconds
        setTimeout(() => {
            liveStreamActive = true;
            offlineBanner.style.display = 'none';
            liveVideo.style.display = 'block';
            liveIndicator.style.display = 'flex';
            liveStatusBadge.innerHTML = '<span class="status-dot online"></span> LIVE';
            uptimeSeconds = 0;
            if (uptimeInterval) clearInterval(uptimeInterval);
            uptimeInterval = setInterval(() => {
                uptimeSeconds++;
                const h = Math.floor(uptimeSeconds / 3600);
                const m = Math.floor((uptimeSeconds % 3600) / 60);
                const s = uptimeSeconds % 60;
                uptimeSpan.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                const viewers = Math.floor(Math.random() * 500) + 50;
                viewersSpan.innerText = viewers;
                document.getElementById('chatUserCount').innerText = Math.floor(viewers * 0.7);
                if (qualityBadge) qualityBadge.innerText = Math.random() > 0.5 ? 'HD 1080p' : 'HD 720p';
            }, 1000);
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            window.showToast('Live stream detected from OBS!');
            addLiveChatMessage('System', 'Stream is now live!', false);
        }, 3000);

        chatSendBtn?.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg && liveStreamActive) {
                addLiveChatMessage('You', msg, true);
                chatInput.value = '';
            } else if (!liveStreamActive) {
                window.showToast('Start streaming via OBS to send messages');
            }
        });
        chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && liveStreamActive) chatSendBtn.click(); });

        document.getElementById('copyStreamKeyBtn')?.addEventListener('click', () => {
            const keyInput = document.getElementById('streamKey');
            keyInput.select();
            document.execCommand('copy');
            window.showToast('Stream key copied!');
        });
        document.getElementById('resetStreamKeyBtn')?.addEventListener('click', () => {
            document.getElementById('streamKey').value = Math.random().toString(36).substring(2, 15);
            window.showToast('Stream key reset');
        });
        document.getElementById('updateStreamInfoBtn')?.addEventListener('click', () => window.showToast('Stream info updated'));
        document.getElementById('saveChatSettings')?.addEventListener('click', () => window.showToast('Chat settings saved'));
        document.getElementById('liveEmojiBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('liveEmojiMenu').classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('liveEmojiMenu');
            if (menu && !menu.contains(e.target) && e.target !== document.getElementById('liveEmojiBtn')) menu.classList.remove('active');
        });
        buildLiveEmojiMenu();
    }

    // ========== Copyright ==========
    function renderCopyright() {
        const claims = generateCopyrightClaims();
        document.getElementById('activeClaims').innerText = claims.filter(c => c.status === 'pending').length;
        document.getElementById('resolvedClaims').innerText = claims.filter(c => c.status === 'resolved').length;
        document.getElementById('disputeClaims').innerText = claims.filter(c => c.status === 'disputed').length;
        document.getElementById('copyrightList').innerHTML = claims.map(c => `
            <div class="copyright-item"><div><strong>${escapeHtml(c.videoTitle)}</strong><div style="font-size:0.7rem;color:var(--text-secondary);">${c.type}</div></div><span class="copyright-status ${c.status}">${c.status}</span><div style="font-size:0.7rem;">${c.date}</div></div>
        `).join('');
    }
    document.getElementById('newClaimBtn')?.addEventListener('click', () => document.getElementById('newClaimModal').classList.add('active'));
    document.getElementById('closeClaimModal')?.addEventListener('click', () => document.getElementById('newClaimModal').classList.remove('active'));
    document.getElementById('submitClaimBtn')?.addEventListener('click', () => { window.showToast('Copyright claim submitted'); document.getElementById('newClaimModal').classList.remove('active'); renderCopyright(); });

    // ========== Customization / Home Layout with Playlist Support ==========
    function initHomeLayout() {
        loadHomeSections();
        renderHomeSections();
        setupDragAndDrop();
        document.getElementById('addNewSectionBtn')?.addEventListener('click', () => {
            document.getElementById('addSectionModal').classList.add('active');
            const typeSelect = document.getElementById('newSectionType');
            const playlistGroup = document.getElementById('playlistSelectGroup');
            const customGroup = document.getElementById('customSectionNameGroup');
            typeSelect.addEventListener('change', () => {
                playlistGroup.style.display = (typeSelect.value === 'single-playlist' || typeSelect.value === 'multiple-playlist') ? 'block' : 'none';
                customGroup.style.display = typeSelect.value === 'custom' ? 'block' : 'none';
            });
            const playlistSelect = document.getElementById('playlistSelect');
            if (playlistSelect) playlistSelect.innerHTML = userPlaylists.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
        });
        document.getElementById('closeSectionModal')?.addEventListener('click', () => document.getElementById('addSectionModal').classList.remove('active'));
        document.getElementById('confirmAddSectionBtn')?.addEventListener('click', () => {
            const type = document.getElementById('newSectionType').value;
            const customName = document.getElementById('customSectionName').value;
            const playlistIds = Array.from(document.getElementById('playlistSelect').selectedOptions).map(opt => parseInt(opt.value));
            const newSection = {
                id: Date.now(),
                type: type,
                title: type === 'custom' ? (customName || 'Custom Section') : getSectionTitle(type),
                enabled: true,
                playlistIds: (type === 'single-playlist' || type === 'multiple-playlist') ? playlistIds : []
            };
            homeSections.push(newSection);
            renderHomeSections();
            setupDragAndDrop();
            document.getElementById('addSectionModal').classList.remove('active');
            document.getElementById('customSectionName').value = '';
        });
        document.getElementById('saveHomeLayout')?.addEventListener('click', () => {
            localStorage.setItem('orbit_home_sections', JSON.stringify(homeSections));
            window.showToast('Home layout saved!');
        });
        document.getElementById('newSectionType')?.addEventListener('change', (e) => {
            document.getElementById('customSectionNameGroup').style.display = e.target.value === 'custom' ? 'block' : 'none';
            document.getElementById('playlistSelectGroup').style.display = (e.target.value === 'single-playlist' || e.target.value === 'multiple-playlist') ? 'block' : 'none';
        });
    }

    function getSectionTitle(type) {
        const titles = {
            'featured': 'Featured Video',
            'popular': 'Popular Uploads',
            'latest': 'Latest Videos',
            'playlists': 'Playlists',
            'single-playlist': 'Single Playlist',
            'multiple-playlist': 'Multiple Playlist'
        };
        return titles[type] || type;
    }

    function loadHomeSections() {
        const saved = localStorage.getItem('orbit_home_sections');
        if (saved) homeSections = JSON.parse(saved);
        else homeSections = [
            { id: 1, type: 'featured', title: 'Featured Video', enabled: true, playlistIds: [] },
            { id: 2, type: 'popular', title: 'Popular Uploads', enabled: true, playlistIds: [] },
            { id: 3, type: 'latest', title: 'Latest Videos', enabled: true, playlistIds: [] },
            { id: 4, type: 'playlists', title: 'Playlists', enabled: true, playlistIds: [] }
        ];
    }

    function renderHomeSections() {
        const container = document.getElementById('homeSectionsList');
        if (!container) return;
        container.innerHTML = homeSections.map(section => `
            <div class="section-item" data-id="${section.id}" data-type="${section.type}">
                <button class="drag-handle">⋮⋮</button>
                <div class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">${getSectionIcon(section.type)}</svg></div>
                <div class="section-title">${escapeHtml(section.title)}</div>
                <div class="section-actions"><label class="switch"><input type="checkbox" class="section-toggle" ${section.enabled ? 'checked' : ''}><span class="slider"></span></label><button class="delete-section" data-id="${section.id}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>
            </div>
        `).join('');
        document.querySelectorAll('.section-toggle').forEach((toggle, idx) => toggle.addEventListener('change', (e) => homeSections[idx].enabled = e.target.checked));
        document.querySelectorAll('.delete-section').forEach(btn => btn.addEventListener('click', (e) => { const id = parseInt(btn.dataset.id); homeSections = homeSections.filter(s => s.id !== id); renderHomeSections(); setupDragAndDrop(); }));
    }

    function getSectionIcon(type) {
        switch(type) {
            case 'featured': return '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
            case 'popular': return '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
            case 'latest': return '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
            case 'playlists': return '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>';
            default: return '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
        }
    }

    function setupDragAndDrop() {
        const items = document.querySelectorAll('.section-item');
        let draggedItem = null;
        items.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => { draggedItem = item; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
            item.addEventListener('dragend', () => { item.classList.remove('dragging'); draggedItem = null; });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const targetItem = e.target.closest('.section-item');
                if (targetItem && targetItem !== draggedItem) {
                    const rect = targetItem.getBoundingClientRect();
                    const targetIndex = Array.from(items).indexOf(targetItem);
                    const draggedIndex = Array.from(items).indexOf(draggedItem);
                    if (draggedIndex < targetIndex && e.clientY > rect.top + rect.height / 2) targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
                    else if (draggedIndex > targetIndex && e.clientY < rect.top + rect.height / 2) targetItem.parentNode.insertBefore(draggedItem, targetItem);
                    updateSectionsOrder();
                }
            });
        });
    }

    function updateSectionsOrder() {
        const newOrder = [];
        document.querySelectorAll('.section-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const section = homeSections.find(s => s.id === id);
            if (section) newOrder.push(section);
        });
        if (newOrder.length === homeSections.length) homeSections = newOrder;
    }

    // ========== Audio Library ==========
    function renderAudioLibrary() {
        const grid = document.getElementById('audioLibraryGrid');
        if (!grid) return;
        grid.innerHTML = royaltyFreeTracks.map(track => `
            <div class="audio-track-card">
                <div class="track-info">
                    <div class="track-title">${escapeHtml(track.title)}</div>
                    <div class="track-artist">${escapeHtml(track.artist)}</div>
                    <div class="track-duration">${track.duration}</div>
                </div>
                <div class="track-actions">
                    <button class="btn-preview" data-url="${track.url}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Preview</button>
                    <button class="btn-download" data-url="${track.url}">Download</button>
                </div>
                <audio class="track-audio" src="${track.url}" preload="none"></audio>
            </div>
        `).join('');
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', () => {
                const audio = btn.closest('.audio-track-card').querySelector('.track-audio');
                if (audio.paused) audio.play();
                else audio.pause();
            });
        });
    }

    // ========== Monetization (Orbship Plans with Badges & Stickers) ==========
    function renderMonetization() {
        const subProgress = Math.min(100, (userStats.subscribers / 500) * 100);
        const watchProgress = Math.min(100, (userStats.watchTimeHours / 2000) * 100);
        const videosProgress = Math.min(100, (userStats.videosLast90Days / 3) * 100);
        document.getElementById('requirementsGrid').innerHTML = `
            <div class="requirement-card ${userStats.subscribers >= 500 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="requirement-title"><h3>Subscribers</h3><p>Reach 500 subscribers</p></div><div class="requirement-value">${userStats.subscribers} / 500</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${subProgress}%;"></div></div></div><div class="requirement-status">${userStats.subscribers >= 500 ? '✓ Completed' : `${500 - userStats.subscribers} more needed`}</div></div>
            <div class="requirement-card ${userStats.watchTimeHours >= 2000 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="requirement-title"><h3>Watch Time</h3><p>2,000 hours in last 365 days</p></div><div class="requirement-value">${Math.round(userStats.watchTimeHours)} / 2000 hrs</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${watchProgress}%;"></div></div></div><div class="requirement-status">${userStats.watchTimeHours >= 2000 ? '✓ Completed' : `${Math.round(2000 - userStats.watchTimeHours)} hours more needed`}</div></div>
            <div class="requirement-card ${userStats.videosLast90Days >= 3 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg></div><div class="requirement-title"><h3>Active Uploads</h3><p>3+ videos in last 90 days</p></div><div class="requirement-value">${userStats.videosLast90Days} / 3</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${videosProgress}%;"></div></div></div><div class="requirement-status">${userStats.videosLast90Days >= 3 ? '✓ Completed' : `${3 - userStats.videosLast90Days} more videos needed`}</div></div>
        `;
        const membershipGrid = document.getElementById('membershipGrid');
        if (membershipGrid) {
            membershipGrid.innerHTML = `
                <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><circle cx="12" cy="12" r="10"/></svg></div><div class="membership-name">1 Month</div><div class="membership-price">$2.99/month</div><div class="membership-badge"><img src="assets/badges/bronze.png" width="40" alt="Bronze Badge"></div><div class="membership-stickers"><label>Upload stickers (max 5):</label><input type="file" multiple accept="image/png" class="sticker-upload" data-plan="1m"></div><button class="btn-save-plan" data-plan="1m">Save</button></div>
                <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2"/><circle cx="12" cy="12" r="4"/></svg></div><div class="membership-name">3 Months</div><div class="membership-price">$7.99</div><div class="membership-badge"><img src="assets/badges/silver.png" width="40" alt="Silver Badge"></div><div class="membership-stickers"><label>Upload stickers (max 15):</label><input type="file" multiple accept="image/png" class="sticker-upload" data-plan="3m"></div><button class="btn-save-plan" data-plan="3m">Save</button></div>
                <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg></div><div class="membership-name">1 Year</div><div class="membership-price">$29.99</div><div class="membership-badge"><img src="assets/badges/gold.png" width="40" alt="Gold Badge"></div><div class="membership-stickers"><label>Upload stickers (max 20):</label><input type="file" multiple accept="image/png" class="sticker-upload" data-plan="1y"></div><button class="btn-save-plan" data-plan="1y">Save</button></div>
            `;
            document.querySelectorAll('.btn-save-plan').forEach(btn => btn.addEventListener('click', () => window.showToast('Plan stickers saved!')));
        }
        document.getElementById('applyCard').style.display = userStats.isEligible ? 'block' : 'none';
        document.getElementById('ineligibleCard').style.display = userStats.isEligible ? 'none' : 'block';
        document.getElementById('applyMonetizationBtn')?.addEventListener('click', () => window.showToast('Application submitted! We will review your channel.'));
        document.getElementById('saveMembershipBtn')?.addEventListener('click', () => window.showToast('Membership settings saved'));
    }

    // ========== Notifications ==========
    function renderNotifications() {
        notifications = generateNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        document.getElementById('notifDot').style.display = unreadCount > 0 ? 'block' : 'none';
        document.getElementById('notifList').innerHTML = notifications.map(n => `
            <div class="notif-item ${!n.read ? 'notif-unread' : ''}" data-id="${n.id}"><div class="notif-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg></div><div class="notif-text"><p>${escapeHtml(n.message)}</p><span class="notif-time">${n.time}</span></div></div>
        `).join('');
    }

    // ========== Upload Popup with 4 Tabs ==========
    function initUploadPopupTabs() {
        const tabs = document.querySelectorAll('.upload-tab');
        const contents = document.querySelectorAll('.upload-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                contents.forEach(c => c.classList.remove('active'));
                document.getElementById(`uploadTab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.add('active');
            });
        });
        // Ad timeline
        const timeline = document.getElementById('adTimelinePreview');
        if (timeline) {
            timeline.addEventListener('click', (e) => {
                const rect = timeline.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                adMarkers.push({ time: percent, position: e.clientX - rect.left });
                renderAdMarkers();
            });
        }
        document.getElementById('clearAdMarkers')?.addEventListener('click', () => { adMarkers = []; renderAdMarkers(); });
        // Copyright check
        const copyrightTab = document.getElementById('uploadTabCopyright');
        if (copyrightTab) {
            copyrightTab.addEventListener('click', () => {
                document.getElementById('copyrightCheckStatus').innerText = 'Checking copyright...';
                setTimeout(() => {
                    copyrightClear = Math.random() > 0.2; // 80% clear
                    const resultDiv = document.getElementById('copyrightCheckResult');
                    resultDiv.innerHTML = copyrightClear ? '<span style="color:var(--accent);">✅ No copyright issues found. You can publish.</span>' : '<span style="color:#ff4444;">⚠️ Potential copyright conflict detected. Please review.</span>';
                    document.getElementById('finalPublishBtn').disabled = !copyrightClear;
                }, 1500);
            });
        }
        // Populate playlist select
        const playlistSelect = document.getElementById('videoPlaylistSelect');
        if (playlistSelect) playlistSelect.innerHTML = '<option value="">None</option>' + userPlaylists.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
        // Add card button
        let cardCount = 0;
        document.getElementById('addCardBtn')?.addEventListener('click', () => {
            cardCount++;
            const cardsDiv = document.getElementById('cardsList');
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-item';
            cardDiv.innerHTML = `<input type="text" placeholder="Card URL" class="form-input" style="width:70%;"><input type="text" placeholder="Timestamp (sec)" class="form-input" style="width:25%;"><button class="remove-card" data-id="${cardCount}">✕</button>`;
            cardsDiv.appendChild(cardDiv);
            cardDiv.querySelector('.remove-card').addEventListener('click', () => cardDiv.remove());
        });
    }

    function renderAdMarkers() {
        const container = document.getElementById('adMarkersContainer');
        const list = document.getElementById('adMarkersList');
        if (!container) return;
        container.innerHTML = adMarkers.map(m => `<div class="ad-marker" style="position:absolute; left:${m.position}px; width:4px; height:100%; background:#ff4444; top:0;"></div>`).join('');
        if (list) list.innerHTML = adMarkers.map((m, i) => `<div>Ad at ${Math.round(m.time)}% <button class="remove-ad" data-index="${i}">✕</button></div>`).join('');
        document.querySelectorAll('.remove-ad').forEach(btn => btn.addEventListener('click', (e) => { const idx = parseInt(btn.dataset.index); adMarkers.splice(idx, 1); renderAdMarkers(); }));
    }

    // ========== Navigation ==========
    function switchView(viewId) {
        viewsEl.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        navItems.forEach(n => n.classList.remove('active'));
        const activeNav = Array.from(navItems).find(n => n.dataset.view === viewId);
        if (activeNav) activeNav.classList.add('active');
        if (viewId === 'content') renderVideosTable();
        if (viewId === 'analytics') renderAnalytics();
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'monetization') renderMonetization();
        if (viewId === 'community') renderCommunityPosts();
        if (viewId === 'copyright') renderCopyright();
        if (viewId === 'comments') renderComments();
        if (viewId === 'audiolibrary') renderAudioLibrary();
    }

    // ========== Event Listeners ==========
    navItems.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    document.getElementById('uploadVideoBtn')?.addEventListener('click', () => window.openPopupById('uploadPopup'));
    document.getElementById('uploadShortBtn')?.addEventListener('click', () => window.openPopupById('shortPopup'));
    document.getElementById('newPostBtn')?.addEventListener('click', () => document.getElementById('newPostModal').classList.add('active'));
    document.getElementById('newPostBtn2')?.addEventListener('click', () => document.getElementById('newPostModal').classList.add('active'));
    document.getElementById('closePostModal')?.addEventListener('click', () => document.getElementById('newPostModal').classList.remove('active'));
    document.getElementById('submitPostBtn')?.addEventListener('click', () => { window.showToast('Post published!'); document.getElementById('newPostModal').classList.remove('active'); renderCommunityPosts(); });
    const searchInput = document.getElementById('videoSearchInput');
    const visFilter = document.getElementById('visibilityFilter');
    if (searchInput && visFilter) {
        const refresh = () => renderVideosTable(searchInput.value, visFilter.value);
        searchInput.addEventListener('input', refresh);
        visFilter.addEventListener('change', refresh);
    }
    notifBell?.addEventListener('click', (e) => { e.stopPropagation(); notifCenter.classList.toggle('active'); });
    document.getElementById('closeNotifBtn')?.addEventListener('click', () => notifCenter.classList.remove('active'));
    document.addEventListener('click', (e) => { if (!notifCenter?.contains(e.target) && !notifBell?.contains(e.target) && notifCenter?.classList.contains('active')) notifCenter.classList.remove('active'); });
    document.getElementById('channelCustomizeForm')?.addEventListener('submit', (e) => { e.preventDefault(); window.showToast('Settings saved'); });
    document.querySelectorAll('.custom-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.custom-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.custom-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`custom${tab.dataset.customTab === 'home' ? 'Home' : 'Channel'}`).classList.add('active');
        });
    });

    // ========== Initialization ==========
    async function init() {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/me`);
            if (res.ok) currentUser = await res.json();
            else currentUser = { id: 1, username: 'Creator', subscribers: 342 };
        } catch (err) {
            currentUser = { id: 1, username: 'DemoCreator', subscribers: 342 };
        }
        window.currentUser = currentUser;
        document.getElementById('studioUsername').innerText = currentUser.username;
        document.getElementById('studioHandle').innerText = `@${currentUser.username}`;
        document.getElementById('studioChannelName').innerText = currentUser.username;
        document.getElementById('studioAvatar').innerText = currentUser.username.charAt(0).toUpperCase();
        document.getElementById('channelName').value = currentUser.username;
        document.getElementById('channelHandle').value = `@${currentUser.username}`;
        userStats.subscribers = currentUser.subscribers || 342;
        userVideos = generateMockVideos();
        calculateUserStats();
        loadCategories();
        initHomeLayout();
        initUploadPopupTabs();
        renderDashboard();
        renderVideosTable();
        renderAnalytics();
        renderMonetization();
        renderCommunityPosts();
        renderCopyright();
        renderComments();
        renderNotifications();
        renderAudioLibrary();
        setupLiveStudio();
        const claimSelect = document.getElementById('claimVideoSelect');
        if (claimSelect) claimSelect.innerHTML = userVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
        const commentFilter = document.getElementById('commentFilterVideo');
        if (commentFilter) commentFilter.innerHTML = '<option value="all">All videos</option>' + userVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
    }
    init();
})();