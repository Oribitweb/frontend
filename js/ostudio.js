// Orbiter Studio – Enhanced with Channel Info & More Content
(function() {
    const API_BASE = 'http://localhost:8000';
    let currentUser = null;
    let testVideos = [];
    let libraryItems = [];
    let commentsData = [];

    const navItems = document.querySelectorAll('.studio-nav-item:not([href])');
    const views = document.querySelectorAll('.studio-view');
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    let analyticsChart, viewsChart;

    // ---------- تولید ویدیوهای تستی با اطلاعات کانال ----------
    function generateTestVideos() {
        return [
            { id: 1, title: 'Orbit Platform Overview', channel: 'Orbit Official', channelAvatar: 'O', thumbnail: 'assets/thumbnail.png', views: 28700, likes: 3100, comments: 156, uploadDate: '2026-05-10', duration: '8:22', visibility: 'public', watchTime: 12500 },
            { id: 2, title: 'How to Master CSS Grid', channel: 'CodeMaster', channelAvatar: 'C', thumbnail: 'assets/thumbnail.png', views: 15200, likes: 1430, comments: 89, uploadDate: '2026-05-05', duration: '12:34', visibility: 'public', watchTime: 8900 },
            { id: 3, title: '10 JavaScript Tricks', channel: 'JS Ninja', channelAvatar: 'J', thumbnail: 'assets/thumbnail.png', views: 89300, likes: 8700, comments: 245, uploadDate: '2026-05-01', duration: '18:22', visibility: 'public', watchTime: 45600 },
            { id: 4, title: 'Behind the Scenes', channel: 'Orbit Official', channelAvatar: 'O', thumbnail: 'assets/thumbnail.png', views: 5600, likes: 412, comments: 28, uploadDate: '2026-04-20', duration: '6:45', visibility: 'unlisted', watchTime: 2100 },
            { id: 5, title: 'Live Coding Session', channel: 'TechLive', channelAvatar: 'T', thumbnail: 'assets/thumbnail.png', views: 12400, likes: 980, comments: 67, uploadDate: '2026-04-15', duration: '2:15:00', visibility: 'public', watchTime: 28400 },
            { id: 6, title: 'UI Design Trends 2026', channel: 'DesignHub', channelAvatar: 'D', thumbnail: 'assets/thumbnail.png', views: 34200, likes: 2900, comments: 112, uploadDate: '2026-04-10', duration: '14:30', visibility: 'public', watchTime: 18500 }
        ];
    }

    // ---------- کتابخانه محتوای بدون کپی‌رایت ----------
    function generateLibrary() {
        return [
            { id: 1, type: 'video', title: 'Free Stock Footage – Mountains', fileSize: '24 MB', url: '#', license: 'CC0', thumbnail: 'assets/thumbnail.png' },
            { id: 2, type: 'video', title: 'Cinematic B-Roll Pack', fileSize: '156 MB', url: '#', license: 'Royalty-Free', thumbnail: 'assets/thumbnail.png' },
            { id: 3, type: 'audio', title: 'Ambient Background Music', fileSize: '5 MB', url: '#', license: 'Free for commercial', thumbnail: 'assets/thumbnail.png' },
            { id: 4, type: 'image', title: 'Abstract Gradient Pack', fileSize: '2 MB', url: '#', license: 'CC BY 4.0', thumbnail: 'assets/thumbnail.png' }
        ];
    }

    // ---------- کامنت‌ها با قابلیت ریپلای ----------
    function generateComments() {
        return [
            { id: 1, author: 'SpaceExplorer', text: 'Amazing content! Keep it up.', avatar: 'S', date: '2 days ago', videoId: 1, replies: [
                { id: 11, author: 'OrbitTeam', text: 'Thanks! Glad you liked it.', avatar: 'O', date: '1 day ago' }
            ]},
            { id: 2, author: 'TechGuru', text: 'Very helpful tutorial.', avatar: 'T', date: '1 day ago', videoId: 2, replies: [] },
            { id: 3, author: 'CodeMaster', text: 'Best JS video on the platform!', avatar: 'C', date: '5 hours ago', videoId: 3, replies: [
                { id: 31, author: 'OrbitTeam', text: 'Thank you so much!', avatar: 'O', date: '2 hours ago' }
            ]}
        ];
    }

    // ---------- رندر کتابخانه ----------
    function renderLibrary(filterType = 'all', search = '') {
        let filtered = libraryItems.filter(item =>
            (filterType === 'all' || item.type === filterType) &&
            item.title.toLowerCase().includes(search.toLowerCase())
        );
        const container = document.getElementById('libraryList');
        if (!container) return;
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-message">No items found</div>';
            return;
        }
        container.innerHTML = filtered.map(item => `
            <div class="library-item">
                <div class="library-thumb"><img src="${item.thumbnail}" onerror="this.src='assets/thumbnail.png'"></div>
                <div class="library-info">
                    <div class="library-title">${escapeHtml(item.title)}</div>
                    <div class="library-meta">
                        <span>${item.type.toUpperCase()}</span>
                        <span>${item.fileSize}</span>
                        <span class="library-badge">${item.license}</span>
                    </div>
                </div>
                <button class="download-btn" data-url="${item.url}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                </button>
            </div>
        `).join('');
        document.querySelectorAll('.download-btn').forEach(btn => btn.onclick = () => window.showToast('Download started (demo)'));
    }

    // ---------- رندر جدول ویدیوها با نمایش کانال ----------
    function renderVideosTable(search = '', visibility = 'all') {
        let filtered = testVideos.filter(v =>
            v.title.toLowerCase().includes(search.toLowerCase()) &&
            (visibility === 'all' || v.visibility === visibility)
        );
        const tbody = document.getElementById('videosTableBody');
        if (!tbody) return;
        tbody.innerHTML = filtered.map(v => `
            <tr>
                <td class="video-title-cell">
                    <img class="video-thumb" src="${v.thumbnail}" onerror="this.src='assets/thumbnail.png'">
                    <div class="video-info">
                        <h4>${escapeHtml(v.title)}</h4>
                        <p>${v.duration}</p>
                    </div>
                 </td>
                 <td class="channel-cell">
                    <div class="channel-avatar-sm">${escapeHtml(v.channelAvatar)}</div>
                    <span>${escapeHtml(v.channel)}</span>
                 </td>
                 <td><span class="badge badge-${v.visibility}">${v.visibility}</span></td>
                 <td>${v.views.toLocaleString()}</td>
                 <td>${v.comments}</td>
                 <td>${new Date(v.uploadDate).toLocaleDateString()}</td>
                 <td>
                    <button class="action-icon-btn edit-video" data-id="${v.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                 </td>
            </tr>
        `).join('');
        document.querySelectorAll('.edit-video').forEach(btn => btn.onclick = () => window.showToast('Edit video coming soon'));
    }

    // ---------- رندر کامنت‌ها با ریپلای ----------
    function renderComments(filterVideo = 'all') {
        const container = document.getElementById('studioCommentsList');
        if (!container) return;
        let filteredComments = commentsData;
        if (filterVideo !== 'all') filteredComments = commentsData.filter(c => c.videoId == filterVideo);
        container.innerHTML = filteredComments.map(comment => `
            <div class="comment-row" data-comment-id="${comment.id}">
                <div class="comment-avatar">${escapeHtml(comment.avatar)}</div>
                <div class="comment-content">
                    <div class="comment-author">${escapeHtml(comment.author)} <span class="comment-meta">${comment.date}</span></div>
                    <div class="comment-text">${escapeHtml(comment.text)}</div>
                    <div class="comment-actions">
                        <button class="like-comment">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            <span>${comment.replies.length}</span>
                        </button>
                        <button class="reply-toggle">Reply</button>
                    </div>
                    <div class="reply-form" style="display:none;">
                        <input type="text" class="reply-input" placeholder="Write a reply...">
                        <button class="reply-send">Reply</button>
                    </div>
                    <div class="reply-list">
                        ${comment.replies.map(reply => `
                            <div class="comment-row" style="margin-left:0; padding:8px 0;">
                                <div class="comment-avatar" style="width:32px;height:32px;">${escapeHtml(reply.avatar)}</div>
                                <div class="comment-content">
                                    <div class="comment-author">${escapeHtml(reply.author)} <span class="comment-meta">${reply.date}</span></div>
                                    <div class="comment-text">${escapeHtml(reply.text)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.reply-toggle').forEach(btn => {
            btn.onclick = (e) => {
                const replyForm = btn.closest('.comment-content').querySelector('.reply-form');
                replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
            };
        });
        document.querySelectorAll('.reply-send').forEach(btn => {
            btn.onclick = (e) => {
                const input = btn.closest('.reply-form').querySelector('.reply-input');
                if (input.value.trim()) window.showToast('Reply sent (demo)');
                input.value = '';
                btn.closest('.reply-form').style.display = 'none';
            };
        });
    }

    // ---------- آمار پیشرفته (۹ متریک) ----------
    function calculateMetrics(videos, periodDays = 28) {
        const totalViews = videos.reduce((s, v) => s + v.views, 0);
        const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
        const watchTimeHours = videos.reduce((s, v) => s + (v.watchTime || 0), 0) / 60;
        const subscribers = currentUser?.subscribers || 12400;
        const likesPerView = totalViews ? (totalLikes / totalViews * 100).toFixed(1) : 0;
        return {
            subscribers, totalViews, totalLikes, watchTimeHours: Math.round(watchTimeHours),
            likesPerView, targetedCTR: '8.2%', deliveryRate: '94%', attractiveness: '76%', viralChance: '12%'
        };
    }

    function renderAnalytics(periodDays) {
        const metrics = calculateMetrics(testVideos, periodDays);
        document.getElementById('coreMetrics').innerHTML = `
            <div class="analytics-card"><span>Subscribers</span><span>${metrics.subscribers.toLocaleString()}</span></div>
            <div class="analytics-card"><span>Views</span><span>${metrics.totalViews.toLocaleString()}</span></div>
            <div class="analytics-card"><span>Likes</span><span>${metrics.totalLikes.toLocaleString()}</span></div>
            <div class="analytics-card"><span>Watch Time (hrs)</span><span>${metrics.watchTimeHours.toLocaleString()}</span></div>
        `;
        document.getElementById('advancedStats').innerHTML = `
            <div class="analytics-card"><span>Likes per views</span><span>${metrics.likesPerView}%</span></div>
            <div class="analytics-card"><span>Targeted Click Rate</span><span>${metrics.targetedCTR}</span></div>
            <div class="analytics-card"><span>Content Delivery Rate</span><span>${metrics.deliveryRate}</span></div>
            <div class="analytics-card"><span>Content Attractiveness</span><span>${metrics.attractiveness}</span></div>
            <div class="analytics-card"><span>Viral Chance</span><span>${metrics.viralChance}</span></div>
        `;
        const labels = Array.from({length: periodDays}, (_, i) => `Day ${i+1}`);
        const chartData = labels.map(() => Math.floor(Math.random() * 2000) + 500);
        if (analyticsChart) analyticsChart.destroy();
        analyticsChart = new Chart(document.getElementById('analyticsChart'), {
            type: 'line', data: { labels, datasets: [{ label: 'Views', data: chartData, borderColor: '#00c853', fill: true }] }
        });
        const topContent = [...testVideos].sort((a,b) => b.views - a.views).slice(0,4);
        document.getElementById('topContentList').innerHTML = topContent.map(v => `
            <div class="video-list-item">
                <img class="video-list-thumb" src="${v.thumbnail}"><div class="video-list-info"><div class="video-list-title">${v.title}</div><div class="video-list-meta">${v.views.toLocaleString()} views</div></div>
            </div>
        `).join('');
    }

    // ---------- داشبورد ----------
    function renderDashboard() {
        const totalViews = testVideos.reduce((s, v) => s + v.views, 0);
        const watchHours = testVideos.reduce((s, v) => s + (v.watchTime || 0), 0) / 60;
        document.getElementById('dashboardStats').innerHTML = `
            <div class="stat-card"><div class="stat-label">Total Views</div><div class="stat-value">${totalViews.toLocaleString()}</div><div class="stat-change">last 28 days</div></div>
            <div class="stat-card"><div class="stat-label">Subscribers</div><div class="stat-value">${(currentUser?.subscribers || 12400).toLocaleString()}</div><div class="stat-change">+124 this week</div></div>
            <div class="stat-card"><div class="stat-label">Watch Time (hours)</div><div class="stat-value">${Math.round(watchHours).toLocaleString()}</div><div class="stat-change">last 28 days</div></div>
            <div class="stat-card"><div class="stat-label">Videos</div><div class="stat-value">${testVideos.length}</div><div class="stat-change">published</div></div>
        `;
        if (viewsChart) viewsChart.destroy();
        viewsChart = new Chart(document.getElementById('viewsChart'), {
            type: 'bar', data: { labels: testVideos.map(v => v.title.slice(0,10)), datasets: [{ label: 'Views', data: testVideos.map(v => v.views), backgroundColor: '#00c853' }] }
        });
        document.getElementById('recentVideoList').innerHTML = testVideos.slice(0,4).map(v => `
            <div class="video-list-item"><img class="video-list-thumb" src="${v.thumbnail}"><div class="video-list-info"><div class="video-list-title">${v.title}</div><div class="video-list-meta">${v.views.toLocaleString()} views</div></div></div>
        `).join('');
    }

    // ---------- سوئیچ تب ----------
    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        navItems.forEach(n => n.classList.remove('active'));
        const activeNav = Array.from(navItems).find(n => n.dataset.view === viewId);
        if (activeNav) activeNav.classList.add('active');
        if (viewId === 'library') renderLibrary();
        if (viewId === 'analytics') renderAnalytics(parseInt(analyticsPeriod?.value || 28));
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'comments') renderComments();
        if (viewId === 'content') {
            const search = document.getElementById('videoSearchInput')?.value || '';
            const vis = document.getElementById('visibilityFilter')?.value || 'all';
            renderVideosTable(search, vis);
        }
    }

    // ---------- رویدادها ----------
    navItems.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    if (analyticsPeriod) analyticsPeriod.addEventListener('change', () => renderAnalytics(parseInt(analyticsPeriod.value)));
    const libSearch = document.getElementById('librarySearch'), libFilter = document.getElementById('libraryTypeFilter');
    if (libSearch && libFilter) {
        const refresh = () => renderLibrary(libFilter.value, libSearch.value);
        libSearch.addEventListener('input', refresh);
        libFilter.addEventListener('change', refresh);
    }
    const videoSearch = document.getElementById('videoSearchInput');
    const visFilter = document.getElementById('visibilityFilter');
    if (videoSearch && visFilter) {
        const refreshContent = () => renderVideosTable(videoSearch.value, visFilter.value);
        videoSearch.addEventListener('input', refreshContent);
        visFilter.addEventListener('change', refreshContent);
    }
    const commentFilter = document.getElementById('commentFilterVideo');
    if (commentFilter) {
        commentFilter.innerHTML = '<option value="all">All videos</option>' + testVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
        commentFilter.addEventListener('change', (e) => renderComments(e.target.value));
    }
    document.getElementById('uploadVideoBtn')?.addEventListener('click', () => window.openPopupById('uploadPopup'));
    document.getElementById('channelCustomizeForm')?.addEventListener('submit', (e) => { e.preventDefault(); window.showToast('Settings saved (demo)'); });

    // ---------- توابع کمکی ----------
    window.showToast = function(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };
    function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }

    // ---------- مقداردهی اولیه ----------
    async function init() {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/me`);
            if (res.ok) currentUser = await res.json();
            else currentUser = { username: 'Creator', subscribers: 12400 };
            window.currentUser = currentUser;
            document.getElementById('studioChannelName').innerText = currentUser.username;
            testVideos = generateTestVideos();
            libraryItems = generateLibrary();
            commentsData = generateComments();
            renderDashboard();
            renderVideosTable();
            renderLibrary();
            renderAnalytics(28);
            renderComments();
        } catch(err) {
            currentUser = { username: 'DemoCreator', subscribers: 12400 };
            window.currentUser = currentUser;
            document.getElementById('studioChannelName').innerText = 'DemoCreator';
            testVideos = generateTestVideos();
            libraryItems = generateLibrary();
            commentsData = generateComments();
            renderDashboard();
            renderVideosTable();
            renderLibrary();
            renderAnalytics(28);
            renderComments();
        }
    }
    init();
})();