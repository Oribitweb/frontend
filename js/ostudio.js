// Orbiter Studio - Complete with Drag & Drop Home Layout + Category Search with Images
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

    // DOM Elements
    const navItems = document.querySelectorAll('.studio-nav-item:not([href])');
    const views = document.querySelectorAll('.studio-view');
    const analyticsPeriod = document.getElementById('analyticsPeriod');
    const notifBell = document.getElementById('notifBellBtn');
    const notifCenter = document.getElementById('notifCenter');

    // ========== Load Categories from window.ORBIT_CATEGORIES ==========
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
        if (window.getCategoryImage) {
            return window.getCategoryImage(categoryName);
        }
        const slug = categoryName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
        return `assets/categories/${slug}.webp`;
    }

    // ========== Category Search with Images ==========
    function initCategorySearch() {
        const searchInput = document.getElementById('categorySearchInput');
        const dropdown = document.getElementById('categoryDropdown');
        const hiddenSelect = document.getElementById('streamCategory');
        
        if (!searchInput || !dropdown) return;

        function renderDropdown(filter = '') {
            const filtered = categories.filter(cat => 
                cat.name.toLowerCase().includes(filter.toLowerCase())
            );
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
                    if (hiddenSelect) {
                        hiddenSelect.value = name;
                    }
                    dropdown.style.display = 'none';
                });
            });
        }

        searchInput.addEventListener('input', (e) => {
            renderDropdown(e.target.value);
        });
        searchInput.addEventListener('focus', () => {
            renderDropdown(searchInput.value);
        });
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Set default value
        if (categories.length > 0) {
            searchInput.value = categories[0].name;
            if (hiddenSelect) hiddenSelect.value = categories[0].name;
        }
    }

    // ========== Home Layout with Drag & Drop ==========
    function initHomeLayout() {
        loadHomeSections();
        renderHomeSections();
        setupDragAndDrop();
        
        document.getElementById('addNewSectionBtn')?.addEventListener('click', () => {
            document.getElementById('addSectionModal').classList.add('active');
        });
        document.getElementById('closeSectionModal')?.addEventListener('click', () => {
            document.getElementById('addSectionModal').classList.remove('active');
        });
        document.getElementById('confirmAddSectionBtn')?.addEventListener('click', () => {
            const type = document.getElementById('newSectionType').value;
            const customName = document.getElementById('customSectionName').value;
            const newSection = {
                id: Date.now(),
                type: type,
                title: type === 'custom' ? (customName || 'Custom Section') : getSectionTitle(type),
                enabled: true
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
        
        // Toggle custom section name field
        document.getElementById('newSectionType')?.addEventListener('change', (e) => {
            const customGroup = document.getElementById('customSectionNameGroup');
            customGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }
    
    function getSectionTitle(type) {
        const titles = {
            'featured': 'Featured Video',
            'popular': 'Popular Uploads',
            'latest': 'Latest Videos',
            'playlists': 'Playlists'
        };
        return titles[type] || type;
    }
    
    function loadHomeSections() {
        const saved = localStorage.getItem('orbit_home_sections');
        if (saved) {
            homeSections = JSON.parse(saved);
        } else {
            homeSections = [
                { id: 1, type: 'featured', title: 'Featured Video', enabled: true },
                { id: 2, type: 'popular', title: 'Popular Uploads', enabled: true },
                { id: 3, type: 'latest', title: 'Latest Videos', enabled: true },
                { id: 4, type: 'playlists', title: 'Playlists', enabled: true }
            ];
        }
    }
    
    function renderHomeSections() {
        const container = document.getElementById('homeSectionsList');
        if (!container) return;
        container.innerHTML = homeSections.map(section => `
            <div class="section-item" data-id="${section.id}" data-type="${section.type}">
                <button class="drag-handle">⋮⋮</button>
                <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${getSectionIcon(section.type)}
                    </svg>
                </div>
                <div class="section-title">${escapeHtml(section.title)}</div>
                <div class="section-actions">
                    <label class="switch">
                        <input type="checkbox" class="section-toggle" ${section.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <button class="delete-section" data-id="${section.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Attach toggle events
        document.querySelectorAll('.section-toggle').forEach((toggle, idx) => {
            toggle.addEventListener('change', (e) => {
                homeSections[idx].enabled = e.target.checked;
            });
        });
        document.querySelectorAll('.delete-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                homeSections = homeSections.filter(s => s.id !== id);
                renderHomeSections();
                setupDragAndDrop();
            });
        });
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
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                draggedItem = null;
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const targetItem = e.target.closest('.section-item');
                if (targetItem && targetItem !== draggedItem) {
                    const rect = targetItem.getBoundingClientRect();
                    const offset = e.clientY - rect.top;
                    const targetIndex = Array.from(items).indexOf(targetItem);
                    const draggedIndex = Array.from(items).indexOf(draggedItem);
                    if (draggedIndex < targetIndex && offset > rect.height / 2) {
                        targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
                        updateSectionsOrder();
                    } else if (draggedIndex > targetIndex && offset < rect.height / 2) {
                        targetItem.parentNode.insertBefore(draggedItem, targetItem);
                        updateSectionsOrder();
                    }
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
        if (newOrder.length === homeSections.length) {
            homeSections = newOrder;
        }
    }

    // ========== Mock Data (بقیه توابع مانند قبل) ==========
    function generateMockVideos() {
        return [
            { id: 1, title: 'My First Vlog', thumbnail: 'assets/thumbnail.png', views: 12500, likes: 890, comments: 45, uploadDate: '2026-05-10', duration: 750, visibility: 'public' },
            { id: 2, title: 'Coding Tutorial: React Hooks', thumbnail: 'assets/thumbnail.png', views: 8700, likes: 620, comments: 32, uploadDate: '2026-05-05', duration: 1100, visibility: 'public' },
            { id: 3, title: 'Unlisted Test Video', thumbnail: 'assets/thumbnail.png', views: 3400, likes: 210, comments: 12, uploadDate: '2026-04-28', duration: 495, visibility: 'unlisted' },
            { id: 4, title: 'Private Family Video', thumbnail: 'assets/thumbnail.png', views: 0, likes: 0, comments: 0, uploadDate: '2026-04-20', duration: 345, visibility: 'private' }
        ];
    }

    function generateCommunityPosts() {
        return [
            { id: 1, author: currentUser?.username || 'Creator', avatar: 'C', content: 'Just uploaded a new video! Check it out 🚀', time: '2 hours ago', likes: 45, comments: 12 },
            { id: 2, author: currentUser?.username || 'Creator', avatar: 'C', content: 'What content would you like to see next? Let me know in the comments!', time: '2 days ago', likes: 128, comments: 34 }
        ];
    }

    function generateABTests() {
        return [
            { id: 1, videoTitle: 'My First Vlog', originalThumb: 'assets/thumb_a.jpg', variantThumb: 'assets/thumb_b.jpg', status: 'running', viewsA: 1240, viewsB: 1560, startDate: '2026-05-01' }
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

    // ========== Helper Functions ==========
    function formatDuration(seconds) {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

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

    // ========== Calculate User Stats ==========
    function calculateUserStats() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        userStats.videosLast90Days = userVideos.filter(v => new Date(v.uploadDate) >= ninetyDaysAgo).length;
        userStats.watchTimeHours = userVideos.reduce((sum, v) => sum + (v.views * (v.duration / 60 / 60)), 0);
        userStats.isEligible = userStats.subscribers >= 500 && userStats.watchTimeHours >= 2000 && userStats.videosLast90Days >= 3;
    }

    // ========== Render Functions ==========
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
        document.querySelectorAll('.edit-video').forEach(btn => btn.onclick = () => window.showToast('Edit feature coming soon'));
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

    function renderCommunityPosts() {
        document.getElementById('communityPostsList').innerHTML = generateCommunityPosts().map(p => `
            <div class="community-post"><div class="post-header"><div class="post-avatar">${p.avatar}</div><div><span class="post-author">${escapeHtml(p.author)}</span><span class="post-time">${p.time}</span></div></div><div class="post-content">${escapeHtml(p.content)}</div><div class="post-stats"><span>❤️ ${p.likes} likes</span><span>💬 ${p.comments} comments</span></div></div>
        `).join('');
    }

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
            <div class="metric-card"><span>Viral Chance</span><span>8%</span></div>
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

    function renderComments() {
        document.getElementById('studioCommentsList').innerHTML = `
            <div class="comment-row"><div class="comment-avatar">J</div><div class="comment-content"><div class="comment-author">JohnDoe <span class="comment-meta">2 days ago</span></div><div class="comment-text">Amazing content!</div><div class="comment-actions"><button class="reply-toggle">Reply</button></div><div class="reply-form" style="display:none;"><input class="reply-input" placeholder="Write a reply..."><button class="reply-send">Reply</button></div></div></div>
            <div class="comment-row"><div class="comment-avatar">S</div><div class="comment-content"><div class="comment-author">SarahSmith <span class="comment-meta">5 days ago</span></div><div class="comment-text">Very helpful tutorial!</div><div class="comment-actions"><button class="reply-toggle">Reply</button></div><div class="reply-form" style="display:none;"><input class="reply-input" placeholder="Write a reply..."><button class="reply-send">Reply</button></div></div></div>
        `;
        attachReplyEvents();
    }

    function attachReplyEvents() {
        document.querySelectorAll('.reply-toggle').forEach(btn => {
            btn.onclick = (e) => {
                const form = btn.closest('.comment-content').querySelector('.reply-form');
                if (form) form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            };
        });
        document.querySelectorAll('.reply-send').forEach(btn => {
            btn.onclick = () => window.showToast('Reply sent');
        });
    }

    function renderABTests() {
        document.getElementById('abTestsList').innerHTML = generateABTests().map(t => `
            <div class="ab-test-card"><div class="ab-test-header"><span class="ab-test-title">${escapeHtml(t.videoTitle)}</span><span class="ab-test-status ${t.status}">${t.status}</span></div><div class="ab-comparison"><div class="ab-variant"><img src="${t.originalThumb}"><div>Original</div><div class="ab-views">${t.viewsA} views</div></div><div class="ab-variant"><img src="${t.variantThumb}"><div>Variant</div><div class="ab-views">${t.viewsB} views</div><div class="ab-winner" style="color:var(--accent);margin-top:8px;">🏆 Winner</div></div></div></div>
        `).join('');
    }

    function renderCopyright() {
        const claims = generateCopyrightClaims();
        document.getElementById('activeClaims').innerText = claims.filter(c => c.status === 'pending').length;
        document.getElementById('resolvedClaims').innerText = claims.filter(c => c.status === 'resolved').length;
        document.getElementById('disputeClaims').innerText = claims.filter(c => c.status === 'disputed').length;
        document.getElementById('copyrightList').innerHTML = claims.map(c => `
            <div class="copyright-item"><div><strong>${escapeHtml(c.videoTitle)}</strong><div style="font-size:0.7rem;color:var(--text-secondary);">${c.type}</div></div><span class="copyright-status ${c.status}">${c.status}</span><div style="font-size:0.7rem;">${c.date}</div></div>
        `).join('');
    }

    function renderMonetization() {
        const subProgress = Math.min(100, (userStats.subscribers / 500) * 100);
        const watchProgress = Math.min(100, (userStats.watchTimeHours / 2000) * 100);
        const videosProgress = Math.min(100, (userStats.videosLast90Days / 3) * 100);
        document.getElementById('requirementsGrid').innerHTML = `
            <div class="requirement-card ${userStats.subscribers >= 500 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="requirement-title"><h3>Subscribers</h3><p>Reach 500 subscribers</p></div><div class="requirement-value">${userStats.subscribers} / 500</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${subProgress}%;"></div></div></div><div class="requirement-status">${userStats.subscribers >= 500 ? '✓ Completed' : `${500 - userStats.subscribers} more needed`}</div></div>
            <div class="requirement-card ${userStats.watchTimeHours >= 2000 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="requirement-title"><h3>Watch Time</h3><p>2,000 hours in last 365 days</p></div><div class="requirement-value">${Math.round(userStats.watchTimeHours)} / 2000 hrs</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${watchProgress}%;"></div></div></div><div class="requirement-status">${userStats.watchTimeHours >= 2000 ? '✓ Completed' : `${Math.round(2000 - userStats.watchTimeHours)} hours more needed`}</div></div>
            <div class="requirement-card ${userStats.videosLast90Days >= 3 ? 'completed' : ''}"><div class="requirement-header"><div class="requirement-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg></div><div class="requirement-title"><h3>Active Uploads</h3><p>3+ videos in last 90 days</p></div><div class="requirement-value">${userStats.videosLast90Days} / 3</div></div><div class="progress-liquid"><div class="progress-liquid-bar"><div class="progress-liquid-fill" style="width: ${videosProgress}%;"></div></div></div><div class="requirement-status">${userStats.videosLast90Days >= 3 ? '✓ Completed' : `${3 - userStats.videosLast90Days} more videos needed`}</div></div>
        `;
        document.getElementById('membershipGrid').innerHTML = `
            <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="var(--accent)"/></svg></div><div class="membership-name">Bronze</div><div class="membership-price">$2.99/month</div><ul class="membership-features"><li>✓ Badge in chat</li><li>✓ Exclusive emotes</li></ul></div>
            <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2"/><circle cx="12" cy="12" r="4"/></svg></div><div class="membership-name">Silver</div><div class="membership-price">$4.99/month</div><ul class="membership-features"><li>✓ Bronze benefits</li><li>✓ Member-only videos</li></ul></div>
            <div class="membership-card"><div class="membership-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg></div><div class="membership-name">Gold</div><div class="membership-price">$9.99/month</div><ul class="membership-features"><li>✓ Silver benefits</li><li>✓ Monthly shoutout</li></ul></div>
        `;
        document.getElementById('applyCard').style.display = userStats.isEligible ? 'block' : 'none';
        document.getElementById('ineligibleCard').style.display = userStats.isEligible ? 'none' : 'block';
    }

    function renderNotifications() {
        notifications = generateNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        document.getElementById('notifDot').style.display = unreadCount > 0 ? 'block' : 'none';
        document.getElementById('notifList').innerHTML = notifications.map(n => `
            <div class="notif-item ${!n.read ? 'notif-unread' : ''}" data-id="${n.id}"><div class="notif-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg></div><div class="notif-text"><p>${escapeHtml(n.message)}</p><span class="notif-time">${n.time}</span></div></div>
        `).join('');
    }

    // ========== Live Studio Functions (بدون دکمه Go Live و بدون بیت‌ریت) ==========
    function setupLiveStudio() {
        const offlineBanner = document.getElementById('offlineBanner');
        const liveVideo = document.getElementById('livePreviewVideo');
        const liveIndicator = document.getElementById('liveIndicator');
        const liveStatusBadge = document.getElementById('liveStatusBadge');
        const viewersSpan = document.getElementById('liveViewers');
        const uptimeSpan = document.getElementById('liveUptime');
        const liveChatMessages = document.getElementById('liveChatMessages');
        const chatInput = document.getElementById('liveChatInput');
        const chatSendBtn = document.getElementById('liveChatSendBtn');
        const qualityBadge = document.getElementById('streamQualityBadge');

        // شبیه‌سازی تشخیص استریم از OBS (در واقعیت باید از WebSocket یا API استفاده کنید)
        // برای دمو، با تایمر شبیه‌سازی می‌کنیم که استریم شروع شده
        setTimeout(() => {
            // شبیه‌سازی شروع استریم از OBS بعد از 3 ثانیه (در واقعیت اینجا WebSocket وصل میشه)
            startLiveStreamFromOBS();
        }, 3000);

        function startLiveStreamFromOBS() {
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
                qualityBadge.innerText = Math.random() > 0.5 ? 'HD 1080p' : 'HD 720p';
            }, 1000);
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            window.showToast('Live stream detected from OBS!');
            liveChatMessages.innerHTML = '<div class="chat-message"><span class="chat-user">System:</span> Stream is now live!</div>';
        }

        function stopLiveStream() {
            liveStreamActive = false;
            offlineBanner.style.display = 'block';
            liveVideo.style.display = 'none';
            liveIndicator.style.display = 'none';
            liveStatusBadge.innerHTML = '<span class="status-dot offline"></span> Offline';
            if (uptimeInterval) clearInterval(uptimeInterval);
            uptimeSeconds = 0;
            uptimeSpan.innerText = '00:00:00';
            viewersSpan.innerText = '0';
            document.getElementById('chatUserCount').innerText = '0';
            chatInput.disabled = true;
            chatSendBtn.disabled = true;
            window.showToast('Stream ended');
            liveChatMessages.innerHTML = '<div class="chat-message"><span class="chat-user">System:</span> Stream ended. Start streaming via OBS to go live.</div>';
        }

        window.stopLiveStream = stopLiveStream;

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

        chatSendBtn?.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg && liveStreamActive) {
                liveChatMessages.innerHTML += `<div class="chat-message"><span class="chat-user">You:</span> ${escapeHtml(msg)}</div>`;
                chatInput.value = '';
                liveChatMessages.scrollTop = liveChatMessages.scrollHeight;
            } else if (!liveStreamActive) {
                window.showToast('Start streaming via OBS to send messages');
            }
        });
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && liveStreamActive) {
                const msg = chatInput.value.trim();
                if (msg) {
                    liveChatMessages.innerHTML += `<div class="chat-message"><span class="chat-user">You:</span> ${escapeHtml(msg)}</div>`;
                    chatInput.value = '';
                    liveChatMessages.scrollTop = liveChatMessages.scrollHeight;
                }
            } else if (e.key === 'Enter' && !liveStreamActive) {
                window.showToast('Start streaming via OBS to send messages');
            }
        });
    }

    // ========== Navigation ==========
    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        navItems.forEach(n => n.classList.remove('active'));
        const activeNav = Array.from(navItems).find(n => n.dataset.view === viewId);
        if (activeNav) activeNav.classList.add('active');
        if (viewId === 'content') renderVideosTable();
        if (viewId === 'analytics') renderAnalytics();
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'monetization') renderMonetization();
        if (viewId === 'community') renderCommunityPosts();
        if (viewId === 'abtesting') renderABTests();
        if (viewId === 'copyright') renderCopyright();
        if (viewId === 'comments') renderComments();
    }

    // ========== Event Listeners ==========
    navItems.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    document.getElementById('uploadVideoBtn')?.addEventListener('click', () => window.openPopupById('uploadPopup'));
    document.getElementById('newPostBtn')?.addEventListener('click', () => document.getElementById('newPostModal').classList.add('active'));
    document.getElementById('closePostModal')?.addEventListener('click', () => document.getElementById('newPostModal').classList.remove('active'));
    document.getElementById('submitPostBtn')?.addEventListener('click', () => {
        window.showToast('Post published!');
        document.getElementById('newPostModal').classList.remove('active');
        renderCommunityPosts();
    });
    document.getElementById('newTestBtn')?.addEventListener('click', () => document.getElementById('newTestModal').classList.add('active'));
    document.getElementById('closeTestModal')?.addEventListener('click', () => document.getElementById('newTestModal').classList.remove('active'));
    document.getElementById('startTestBtn')?.addEventListener('click', () => {
        window.showToast('A/B Test started!');
        document.getElementById('newTestModal').classList.remove('active');
        renderABTests();
    });
    document.getElementById('newClaimBtn')?.addEventListener('click', () => document.getElementById('newClaimModal').classList.add('active'));
    document.getElementById('closeClaimModal')?.addEventListener('click', () => document.getElementById('newClaimModal').classList.remove('active'));
    document.getElementById('submitClaimBtn')?.addEventListener('click', () => {
        window.showToast('Copyright claim submitted');
        document.getElementById('newClaimModal').classList.remove('active');
        renderCopyright();
    });
    document.getElementById('saveMembershipBtn')?.addEventListener('click', () => window.showToast('Membership settings saved'));
    document.getElementById('applyMonetizationBtn')?.addEventListener('click', () => window.showToast('Application submitted! We will review your channel.'));
    document.getElementById('saveHomeLayout')?.addEventListener('click', () => window.showToast('Home layout saved'));
    notifBell?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifCenter.classList.toggle('active');
    });
    document.getElementById('closeNotifBtn')?.addEventListener('click', () => notifCenter.classList.remove('active'));
    document.addEventListener('click', (e) => {
        if (!notifCenter?.contains(e.target) && !notifBell?.contains(e.target) && notifCenter?.classList.contains('active')) {
            notifCenter.classList.remove('active');
        }
    });
    document.getElementById('channelCustomizeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        window.showToast('Settings saved');
    });
    document.querySelectorAll('.custom-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.custom-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.custom-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`custom${tab.dataset.customTab === 'home' ? 'Home' : 'Channel'}`).classList.add('active');
        });
    });
    const searchInput = document.getElementById('videoSearchInput');
    const visFilter = document.getElementById('visibilityFilter');
    if (searchInput && visFilter) {
        const refresh = () => renderVideosTable(searchInput.value, visFilter.value);
        searchInput.addEventListener('input', refresh);
        visFilter.addEventListener('change', refresh);
    }

    // ========== Init ==========
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
        renderDashboard();
        renderVideosTable();
        renderAnalytics();
        renderMonetization();
        renderCommunityPosts();
        renderABTests();
        renderCopyright();
        renderComments();
        renderNotifications();
        setupLiveStudio();
        const videoSelect = document.getElementById('testVideoSelect');
        if (videoSelect) {
            videoSelect.innerHTML = userVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
        }
        const claimSelect = document.getElementById('claimVideoSelect');
        if (claimSelect) {
            claimSelect.innerHTML = userVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
        }
        const commentFilter = document.getElementById('commentFilterVideo');
        if (commentFilter) {
            commentFilter.innerHTML = '<option value="all">All videos</option>' + userVideos.map(v => `<option value="${v.id}">${escapeHtml(v.title)}</option>`).join('');
        }
    }
    init();
})();