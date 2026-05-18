<?php
$pageTitle = "ORBIT — Orbiter Studio";
$extraCSS = '
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/popups.css">
    <link rel="stylesheet" href="css/ostudio.css">
    <script src="scripts/jsdelivr/chart.js"></script>
';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="studio-main" id="studioMain">
    <div class="studio-container">
        <!-- Sidebar -->
        <aside class="studio-sidebar">
            <nav class="studio-nav">
                <button class="studio-nav-item active" data-view="dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Dashboard</span>
                </button>
                <button class="studio-nav-item" data-view="content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                    <span>Content</span>
                </button>
                <button class="studio-nav-item" data-view="library">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16v12H4z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                    <span>Content Library</span>
                </button>
                <button class="studio-nav-item" data-view="analytics">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="18" y1="14" x2="10.5" y2="6.5"/></svg>
                    <span>Analytics</span>
                </button>
                <button class="studio-nav-item" data-view="comments">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/></svg>
                    <span>Comments</span>
                </button>
                <button class="studio-nav-item" data-view="customization">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Customization</span>
                </button>
                <button class="studio-nav-item" data-view="monetization">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg>
                    <span>Monetization</span>
                </button>
                <a href="settings.php" class="studio-nav-item" style="margin-top: auto;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Settings</span>
                </a>
            </nav>
        </aside>

        <div class="studio-content">
            <!-- Dashboard View -->
            <div class="studio-view active" id="view-dashboard">
                <div class="studio-header">
                    <h1>Dashboard</h1>
                    <p class="studio-sub">Welcome back, <span id="studioChannelName">Creator</span>! Here's your channel overview.</p>
                </div>
                <div class="stats-grid" id="dashboardStats"></div>
                <div class="analytics-chart">
                    <h3>Views over time</h3>
                    <canvas id="viewsChart" width="400" height="200"></canvas>
                </div>
                <div class="recent-videos">
                    <h3>Recent Videos</h3>
                    <div class="video-list" id="recentVideoList"></div>
                </div>
            </div>

            <!-- Content View (بهبود یافته با نمایش کانال) -->
            <div class="studio-view" id="view-content">
                <div class="studio-header">
                    <h1>Content</h1>
                    <div class="content-actions">
                        <button class="btn btn-primary" id="uploadVideoBtn">Upload Video</button>
                    </div>
                </div>
                <div class="content-filters">
                    <input type="text" id="videoSearchInput" placeholder="Search videos..." class="content-search">
                    <select id="visibilityFilter" class="filter-select">
                        <option value="all">All visibility</option>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div class="table-container">
                    <table class="studio-table">
                        <thead>
                            <tr><th>Video</th><th>Channel</th><th>Visibility</th><th>Views</th><th>Comments</th><th>Upload Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody id="videosTableBody"></tbody>
                    </table>
                </div>
                <div id="contentPagination" class="pagination"></div>
            </div>

            <!-- Content Library (بدون کپی‌رایت) -->
            <div class="studio-view" id="view-library">
                <div class="studio-header">
                    <h1>Content Library</h1>
                    <p class="studio-sub">Free & Copyright‑Free Media for Your Projects</p>
                </div>
                <div class="content-filters">
                    <input type="text" id="librarySearch" placeholder="Search library..." class="content-search">
                    <select id="libraryTypeFilter" class="filter-select">
                        <option value="all">All Types</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                        <option value="image">Images</option>
                    </select>
                </div>
                <div class="library-list" id="libraryList"></div>
            </div>

            <!-- Analytics View (۹ متریک) -->
            <div class="studio-view" id="view-analytics">
                <div class="studio-header">
                    <h1>Analytics</h1>
                    <select id="analyticsPeriod" class="filter-select">
                        <option value="7">Last 7 days</option>
                        <option value="28" selected>Last 28 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>
                <div class="analytics-summary" id="coreMetrics"></div>
                <div class="advanced-stats-grid" id="advancedStats"></div>
                <div class="analytics-chart-large"><canvas id="analyticsChart"></canvas></div>
                <div class="top-videos"><h3>Top Performing Content</h3><div id="topContentList" class="video-list"></div></div>
            </div>

            <!-- Comments View (با ریپلای) -->
            <div class="studio-view" id="view-comments">
                <div class="studio-header">
                    <h1>Comments</h1>
                    <div class="content-actions"><select id="commentFilterVideo" class="filter-select"><option value="all">All videos</option></select></div>
                </div>
                <div class="comments-list" id="studioCommentsList"></div>
            </div>

            <!-- Customization View -->
            <div class="studio-view" id="view-customization">
                <div class="studio-header"><h1>Customization</h1><p class="studio-sub">Manage your channel branding</p></div>
                <form id="channelCustomizeForm">
                    <div class="form-group"><label>Channel Name</label><input type="text" id="channelName" class="form-input"></div>
                    <div class="form-group"><label>Handle</label><input type="text" id="channelHandle" class="form-input"></div>
                    <div class="form-group"><label>Description</label><textarea id="channelBio" class="form-textarea" rows="3"></textarea></div>
                    <div class="form-group"><label>Profile Picture</label><input type="file" id="avatarFile" accept="image/*"><div class="avatar-preview" id="avatarPreview"></div></div>
                    <div class="form-group"><label>Banner Image</label><input type="file" id="bannerFile" accept="image/*"></div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>

            <!-- Monetization View (طراحی درخشان) -->
            <div class="studio-view" id="view-monetization">
                <div class="monetization-hero">
                    <div class="monetization-glow-card">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.2">
                            <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
                            <circle cx="12" cy="12" r="4"/>
                            <path d="M12 8v8M8 12h8"/>
                        </svg>
                        <h2>Under Development</h2>
                        <p>Orbship Program & Ad Revenue are coming soon.<br>Get ready to earn from your content.</p>
                        <div class="monetization-progress">
                            <div class="progress-bar"><div class="progress-fill" style="width: 45%;"></div></div>
                            <span>45% Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<script src="js/ostudio.js"></script>
</body>
</html>