// Orbiter Studio - Premium with Monetization Requirements
(function() {
    const API_BASE = 'http://localhost:8000';
    let currentUser = null;
    let userVideos = [];
    let userStats = {
        subscribers: 0,
        watchTimeHours: 0,
        videosLast90Days: 0,
        isEligible: false
    };
    let currentPage = 1;
    const PER_PAGE = 8;
    let analyticsChart, viewsChart;

    // DOM Elements
    const navItems = document.querySelectorAll('.studio-nav-item:not([href])');
    const views = document.querySelectorAll('.studio-view');
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    const chartPeriod = document.getElementById('chartPeriod');

    // ========== Fetch User Data ==========
    async function fetchUserData() {
        try {
            const res = await window.authorizedFetch(`${API_BASE}/users/me`);
            if (res.ok) {
                currentUser = await res.json();
            } else {
                currentUser = { id: 1, username: 'Creator', subscribers: 342 };
            }
            
            // Fetch user videos
            const videosRes = await window.authorizedFetch(`${API_BASE}/videos?uploader_id=${currentUser.id}`);
            if (videosRes.ok) {
                const data = await videosRes.json();
                userVideos = data.videos || (Array.isArray(data) ? data : []);
            } else {
                userVideos = generateMockVideos();
            }
            
            calculateUserStats();
            updateUI();
        } catch(err) {
            currentUser = { id: 1, username: 'DemoCreator', subscribers: 593 };
            userVideos = generateMockVideos();
            calculateUserStats();
            updateUI();
        }
    }

    function generateMockVideos() {
        const today = new Date();
        return [
            { id: 1, title: 'My First Vlog', thumbnail: 'assets/thumbnail.png', views: 12500, likes: 890, comments: 45, uploadDate: '2026-05-10', duration: 750, visibility: 'public' },
            { id: 2, title: 'Coding Tutorial: React Hooks', thumbnail: 'assets/thumbnail.png', views: 8700, likes: 620, comments: 32, uploadDate: '2026-05-05', duration: 1100, visibility: 'public' },
            { id: 3, title: 'Unlisted Test Video', thumbnail: 'assets/thumbnail.png', views: 3400, likes: 210, comments: 12, uploadDate: '2026-04-28', duration: 495, visibility: 'unlisted' },
            { id: 4, title: 'Private Family Video', thumbnail: 'assets/thumbnail.png', views: 0, likes: 0, comments: 0, uploadDate: '2026-04-20', duration: 345, visibility: 'private' },
            { id: 5, title: 'Latest React Tutorial', thumbnail: 'assets/thumbnail.png', views: 5600, likes: 430, comments: 28, uploadDate: '2026-04-15', duration: 820, visibility: 'public' },
            { id: 6, title: 'Vlog: Behind the Scenes', thumbnail: 'assets/thumbnail.png', views: 3200, likes: 210, comments: 15, uploadDate: '2026-04-10', duration: 630, visibility: 'public' }
        ];
    }

    // ========== Calculate Monetization Requirements ==========
    function calculateUserStats() {
        // Calculate total watch time (in hours) from all videos
        const totalWatchMinutes = userVideos.reduce((sum, v) => sum + (v.views * (v.duration / 60)), 0);
        userStats.watchTimeHours = Math.round(totalWatchMinutes / 60);
        
        // Get subscribers from user data
        userStats.subscribers = currentUser?.subscribers || 342;
        
        // Count videos uploaded in last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        userStats.videosLast90Days = userVideos.filter(v => new Date(v.uploadDate) >= ninetyDaysAgo).length;
        
        // Check if all requirements are met
        userStats.isEligible = 
            userStats.subscribers >= 500 && 
            userStats.watchTimeHours >= 2000 && 
            userStats.videosLast90Days >= 3;
    }

    // ========== Render Monetization Page ==========
    function renderMonetization() {
        const requirementsGrid = document.getElementById('requirementsGrid');
        if (!requirementsGrid) return;
        
        // Calculate percentages for progress bars
        const subProgress = Math.min(100, (userStats.subscribers / 500) * 100);
        const watchProgress = Math.min(100, (userStats.watchTimeHours / 2000) * 100);
        const videosProgress = Math.min(100, (userStats.videosLast90Days / 3) * 100);
        
        requirementsGrid.innerHTML = `
            <div class="requirement-card ${userStats.subscribers >= 500 ? 'completed' : ''}">
                <div class="requirement-header">
                    <div class="requirement-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div class="requirement-title">
                        <h3>Subscribers</h3>
                        <p>Reach 500 subscribers</p>
                    </div>
                    <div class="requirement-value">${userStats.subscribers} / 500</div>
                </div>
                <div class="progress-liquid">
                    <div class="progress-liquid-bar">
                        <div class="progress-liquid-fill" style="width: ${subProgress}%;"></div>
                    </div>
                </div>
                <div class="requirement-status ${userStats.subscribers >= 500 ? 'completed' : ''}">
                    ${userStats.subscribers >= 500 ? '✓ Completed' : `${500 - userStats.subscribers} more needed`}
                </div>
            </div>
            
            <div class="requirement-card ${userStats.watchTimeHours >= 2000 ? 'completed' : ''}">
                <div class="requirement-header">
                    <div class="requirement-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="requirement-title">
                        <h3>Watch Time</h3>
                        <p>2,000 hours in last 365 days</p>
                    </div>
                    <div class="requirement-value">${userStats.watchTimeHours}</div>
                </div>
                <div class="progress-liquid">
                    <div class="progress-liquid-bar">
                        <div class="progress-liquid-fill" style="width: ${watchProgress}%;"></div>
                    </div>
                </div>
                <div class="requirement-status ${userStats.watchTimeHours >= 2000 ? 'completed' : ''}">
                    ${userStats.watchTimeHours >= 2000 ? '✓ Completed' : `${2000 - userStats.watchTimeHours} hours more needed`}
                </div>
            </div>
            
            <div class="requirement-card ${userStats.videosLast90Days >= 3 ? 'completed' : ''}">
                <div class="requirement-header">
                    <div class="requirement-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                        </svg>
                    </div>
                    <div class="requirement-title">
                        <h3>Active Uploads</h3>
                        <p>3+ videos in last 90 days</p>
                    </div>
                    <div class="requirement-value">${userStats.videosLast90Days} / 3</div>
                </div>
                <div class="progress-liquid">
                    <div class="progress-liquid-bar">
                        <div class="progress-liquid-fill" style="width: ${videosProgress}%;"></div>
                    </div>
                </div>
                <div class="requirement-status ${userStats.videosLast90Days >= 3 ? 'completed' : ''}">
                    ${userStats.videosLast90Days >= 3 ? '✓ Completed' : `${3 - userStats.videosLast90Days} more videos needed`}
                </div>
            </div>
        `;
        
        // Show/hide apply card based on eligibility
        const applyCard = document.getElementById('applyCard');
        const ineligibleCard = document.getElementById('ineligibleCard');
        
        if (userStats.isEligible) {
            applyCard.style.display = 'block';
            ineligibleCard.style.display = 'none';
        } else {
            applyCard.style.display = 'none';
            ineligibleCard.style.display = 'block';
        }
    }

    // ========== Render Videos Table ==========
    function renderVideosTable(search = '', visibility = 'all') {
        let filtered = userVideos.filter(v =>
            v.title.toLowerCase().includes(search.toLowerCase()) &&
            (visibility === 'all' || v.visibility === visibility)
        );
        const start = (currentPage - 1) * PER_PAGE;
        const paginated = filtered.slice(start, start + PER_PAGE);
        const tbody = document.getElementById('videosTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = paginated.map(v => `
            <tr>
                <td class="video-cell">
                    <img class="video-thumb-sm" src="${v.thumbnail || 'assets/thumbnail.png'}" onerror="this.src='assets/thumbnail.png'">
                    <div>
                        <h4 style="font-weight:600;">${escapeHtml(v.title)}</h4>
                        <p style="font-size:0.7rem; color:var(--text-secondary);">${formatDuration(v.duration)}</p>
                    </div>
                 </td>
                <td><span class="badge badge-${v.visibility}">${v.visibility}</span></td>
                <td>${v.views.toLocaleString()}</td>
                <td>${v.comments || 0}</td>
                <td>${new Date(v.uploadDate).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-video" data-id="${v.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
        
        renderPagination(filtered.length);
    }

    function formatDuration(seconds) {
        if (!seconds) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        return `${minutes}:${secs.toString().padStart(2,'0')}`;
    }

    function renderPagination(total) {
        const totalPages = Math.ceil(total / PER_PAGE);
        const container = document.getElementById('contentPagination');
        if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }
        let html = '<div class="pagination">';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += '</div>';
        container.innerHTML = html;
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                const search = document.getElementById('videoSearchInput')?.value || '';
                const vis = document.getElementById('visibilityFilter')?.value || 'all';
                renderVideosTable(search, vis);
            });
        });
    }

    // ========== Dashboard ==========
    function renderDashboard() {
        const totalViews = userVideos.reduce((s, v) => s + v.views, 0);
        const totalVideos = userVideos.length;
        
        document.getElementById('dashboardStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Views</div>
                <div class="stat-value">${totalViews.toLocaleString()}</div>
                <div class="stat-change">All time</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Videos</div>
                <div class="stat-value">${totalVideos}</div>
                <div class="stat-change">Published</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Subscribers</div>
                <div class="stat-value">${userStats.subscribers.toLocaleString()}</div>
                <div class="stat-change">Target: 500</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Watch Time</div>
                <div class="stat-value">${userStats.watchTimeHours.toLocaleString()} hrs</div>
                <div class="stat-change">Target: 2000 hrs</div>
            </div>
        `;
        
        if (viewsChart) viewsChart.destroy();
        const ctx = document.getElementById('viewsChart').getContext('2d');
        viewsChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: userVideos.slice(0,7).map(v => v.title.substring(0,12)), datasets: [{ label: 'Views', data: userVideos.slice(0,7).map(v => v.views), backgroundColor: '#00c853', borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
        
        document.getElementById('recentVideoList').innerHTML = userVideos.slice(0,4).map(v => `
            <div class="video-list-item">
                <img class="video-list-thumb" src="${v.thumbnail || 'assets/thumbnail.png'}">
                <div class="video-list-info">
                    <div class="video-list-title">${escapeHtml(v.title)}</div>
                    <div class="video-list-meta">${v.views.toLocaleString()} views</div>
                </div>
            </div>
        `).join('');
    }

    // ========== Analytics ==========
    function renderAnalytics() {
        const totalViews = userVideos.reduce((s, v) => s + v.views, 0);
        const totalLikes = userVideos.reduce((s, v) => s + (v.likes || 0), 0);
        const likesPerView = totalViews ? (totalLikes / totalViews * 100).toFixed(1) : 0;
        
        document.getElementById('coreMetrics').innerHTML = `
            <div class="metric-card"><span>Subscribers</span><span>${userStats.subscribers.toLocaleString()}</span></div>
            <div class="metric-card"><span>Views</span><span>${totalViews.toLocaleString()}</span></div>
            <div class="metric-card"><span>Likes</span><span>${totalLikes.toLocaleString()}</span></div>
            <div class="metric-card"><span>Watch Time (hrs)</span><span>${userStats.watchTimeHours.toLocaleString()}</span></div>
        `;
        document.getElementById('advancedStats').innerHTML = `
            <div class="metric-card"><span>Likes/Views</span><span>${likesPerView}%</span></div>
            <div class="metric-card"><span>Click Rate</span><span>7.8%</span></div>
            <div class="metric-card"><span>Delivery Rate</span><span>92%</span></div>
            <div class="metric-card"><span>Attractiveness</span><span>71%</span></div>
            <div class="metric-card"><span>Viral Chance</span><span>8%</span></div>
        `;
        
        const labels = Array.from({length: 28}, (_, i) => `Day ${i+1}`);
        const chartData = labels.map(() => Math.floor(Math.random() * 500) + 100);
        if (analyticsChart) analyticsChart.destroy();
        analyticsChart = new Chart(document.getElementById('analyticsChart'), {
            type: 'line',
            data: { labels, datasets: [{ label: 'Views', data: chartData, borderColor: '#00c853', fill: true }] }
        });
        
        const topVideos = [...userVideos].sort((a,b) => b.views - a.views).slice(0,4);
        document.getElementById('topContentList').innerHTML = topVideos.map(v => `
            <div class="video-list-item">
                <img class="video-list-thumb" src="${v.thumbnail || 'assets/thumbnail.png'}">
                <div class="video-list-info">
                    <div class="video-list-title">${escapeHtml(v.title)}</div>
                    <div class="video-list-meta">${v.views.toLocaleString()} views</div>
                </div>
            </div>
        `).join('');
    }

    // ========== Comments Mock ==========
    function renderComments() {
        const container = document.getElementById('studioCommentsList');
        if (!container) return;
        container.innerHTML = `
            <div class="comment-row">
                <div class="comment-avatar">J</div>
                <div class="comment-content">
                    <div class="comment-author">JohnDoe <span class="comment-meta">2 days ago</span></div>
                    <div class="comment-text">Amazing content! Keep it up!</div>
                    <div class="comment-actions"><button class="reply-toggle">Reply</button></div>
                    <div class="reply-form" style="display:none;"><input class="reply-input" placeholder="Write a reply..."><button class="reply-send">Reply</button></div>
                </div>
            </div>
            <div class="comment-row">
                <div class="comment-avatar">S</div>
                <div class="comment-content">
                    <div class="comment-author">SarahSmith <span class="comment-meta">5 days ago</span></div>
                    <div class="comment-text">Very helpful tutorial, thanks!</div>
                    <div class="comment-actions"><button class="reply-toggle">Reply</button></div>
                    <div class="reply-form" style="display:none;"><input class="reply-input" placeholder="Write a reply..."><button class="reply-send">Reply</button></div>
                </div>
            </div>
        `;
        document.querySelectorAll('.reply-toggle').forEach(btn => {
            btn.onclick = (e) => {
                const form = btn.closest('.comment-content').querySelector('.reply-form');
                form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            };
        });
        document.querySelectorAll('.reply-send').forEach(btn => {
            btn.onclick = () => window.showToast('Reply sent (demo)');
        });
    }

    // ========== Update All UI ==========
    function updateUI() {
        document.getElementById('studioUsername').innerText = currentUser.username;
        document.getElementById('studioHandle').innerText = `@${currentUser.username}`;
        document.getElementById('studioChannelName').innerText = currentUser.username;
        document.getElementById('channelName').value = currentUser.username;
        document.getElementById('channelHandle').value = `@${currentUser.username}`;
        document.getElementById('studioAvatar').innerText = currentUser.username.charAt(0).toUpperCase();
        
        renderDashboard();
        renderVideosTable();
        renderAnalytics();
        renderMonetization();
        renderComments();
    }

    // ========== Navigation ==========
    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        navItems.forEach(n => n.classList.remove('active'));
        const activeNav = Array.from(navItems).find(n => n.dataset.view === viewId);
        if (activeNav) activeNav.classList.add('active');
        
        if (viewId === 'content') {
            const search = document.getElementById('videoSearchInput')?.value || '';
            const vis = document.getElementById('visibilityFilter')?.value || 'all';
            renderVideosTable(search, vis);
        }
        if (viewId === 'analytics') renderAnalytics();
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'monetization') renderMonetization();
        if (viewId === 'comments') renderComments();
    }

    // ========== Event Listeners ==========
    navItems.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    if (analyticsPeriod) analyticsPeriod.addEventListener('change', () => renderAnalytics());
    
    const videoSearch = document.getElementById('videoSearchInput');
    const visFilter = document.getElementById('visibilityFilter');
    if (videoSearch && visFilter) {
        const refresh = () => renderVideosTable(videoSearch.value, visFilter.value);
        videoSearch.addEventListener('input', refresh);
        visFilter.addEventListener('change', refresh);
    }
    
    document.getElementById('uploadVideoBtn')?.addEventListener('click', () => window.openPopupById('uploadPopup'));
    document.getElementById('channelCustomizeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        window.showToast('Settings saved');
    });
    
    document.getElementById('applyMonetizationBtn')?.addEventListener('click', () => {
        window.showToast('Application submitted! We will review your channel.');
    });

    // ========== Helpers ==========
    window.showToast = function(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    }

    // ========== Init ==========
    fetchUserData();
})();