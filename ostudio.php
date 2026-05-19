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

<main class="studio-main">
    <div class="studio-container">
        <!-- Sidebar - Glass Liquid -->
        <aside class="studio-sidebar">
            <div class="studio-sidebar-header">
                <div class="studio-avatar" id="studioAvatar">U</div>
                <div class="studio-user-info">
                    <span class="studio-username" id="studioUsername">Loading...</span>
                    <span class="studio-handle" id="studioHandle">@username</span>
                </div>
            </div>
            <nav class="studio-nav">
                <button class="studio-nav-item active" data-view="dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                    <span>Dashboard</span>
                </button>
                <button class="studio-nav-item" data-view="content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="4" width="20" height="16" rx="3"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                    </svg>
                    <span>Content</span>
                </button>
                <button class="studio-nav-item" data-view="analytics">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                        <line x1="18" y1="14" x2="10.5" y2="6.5"/>
                    </svg>
                    <span>Analytics</span>
                </button>
                <button class="studio-nav-item" data-view="comments">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <line x1="9" y1="10" x2="15" y2="10"/>
                        <line x1="9" y1="14" x2="12" y2="14"/>
                    </svg>
                    <span>Comments</span>
                </button>
                <button class="studio-nav-item" data-view="customization">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>Customization</span>
                </button>
                <button class="studio-nav-item" data-view="monetization">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                    <span>Monetization</span>
                </button>
            </nav>
            <div class="studio-sidebar-footer">
                <a href="settings.php" class="studio-nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>Settings</span>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="studio-content">
            <!-- Dashboard -->
            <div class="studio-view active" id="view-dashboard">
                <div class="studio-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p class="studio-sub">Welcome back, <span id="studioChannelName">Creator</span></p>
                    </div>
                </div>
                <div class="stats-grid" id="dashboardStats"></div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Channel Performance</h3>
                        <select id="chartPeriod" class="filter-select-sm">
                            <option value="7">Last 7 days</option>
                            <option value="28" selected>Last 28 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                    <canvas id="viewsChart" height="200"></canvas>
                </div>
                <div class="recent-videos-card">
                    <h3>Recent Videos</h3>
                    <div class="video-list" id="recentVideoList"></div>
                </div>
            </div>

            <!-- Content -->
            <div class="studio-view" id="view-content">
                <div class="studio-header">
                    <h1>Content</h1>
                    <button class="btn-upload" id="uploadVideoBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Upload Video
                    </button>
                </div>
                <div class="content-filters">
                    <div class="search-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="videoSearchInput" placeholder="Search your videos...">
                    </div>
                    <select id="visibilityFilter" class="filter-select">
                        <option value="all">All visibility</option>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div class="videos-table-container">
                    <table class="videos-table">
                        <thead>
                            <tr><th>Video</th><th>Visibility</th><th>Views</th><th>Comments</th><th>Upload Date</th><th></th></tr>
                        </thead>
                        <tbody id="videosTableBody"></tbody>
                    </table>
                    <div id="contentPagination" class="pagination"></div>
                </div>
            </div>

            <!-- Analytics -->
            <div class="studio-view" id="view-analytics">
                <div class="studio-header">
                    <h1>Analytics</h1>
                    <select id="analyticsPeriod" class="filter-select">
                        <option value="7">Last 7 days</option>
                        <option value="28" selected>Last 28 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>
                <div class="metrics-grid" id="coreMetrics"></div>
                <div class="metrics-grid advanced" id="advancedStats"></div>
                <div class="chart-card">
                    <h3>Views Trend</h3>
                    <canvas id="analyticsChart" height="200"></canvas>
                </div>
                <div class="top-videos-card">
                    <h3>Top Performing Videos</h3>
                    <div id="topContentList" class="video-list"></div>
                </div>
            </div>

            <!-- Comments -->
            <div class="studio-view" id="view-comments">
                <div class="studio-header">
                    <h1>Comments</h1>
                    <select id="commentFilterVideo" class="filter-select">
                        <option value="all">All videos</option>
                    </select>
                </div>
                <div class="comments-list" id="studioCommentsList"></div>
            </div>

            <!-- Customization -->
            <div class="studio-view" id="view-customization">
                <div class="studio-header">
                    <h1>Customization</h1>
                    <p class="studio-sub">Manage your channel appearance</p>
                </div>
                <div class="customization-card">
                    <form id="channelCustomizeForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Channel Name</label>
                                <input type="text" id="channelName" class="form-input">
                            </div>
                            <div class="form-group">
                                <label>Handle</label>
                                <input type="text" id="channelHandle" class="form-input">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="channelBio" class="form-textarea" rows="3"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Profile Picture</label>
                                <input type="file" id="avatarFile" accept="image/*">
                                <div class="avatar-preview" id="avatarPreview"></div>
                            </div>
                            <div class="form-group">
                                <label>Banner Image</label>
                                <input type="file" id="bannerFile" accept="image/*">
                            </div>
                        </div>
                        <button type="submit" class="btn-save">Save Changes</button>
                    </form>
                </div>
            </div>

            <!-- Monetization - New Design with Requirements -->
            <div class="studio-view" id="view-monetization">
                <div class="monetization-header">
                    <div class="monetization-title">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                            <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
                            <circle cx="12" cy="12" r="4"/>
                        </svg>
                        <div>
                            <h1>Monetization Program</h1>
                            <p>Start earning from your content. Meet the requirements to join.</p>
                        </div>
                    </div>
                </div>

                <!-- Requirements Progress Cards -->
                <div class="requirements-grid" id="requirementsGrid">
                    <!-- Filled by JS -->
                </div>

                <!-- Benefits Section -->
                <div class="benefits-card">
                    <h3>Program Benefits</h3>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                                <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/>
                                <circle cx="12" cy="12" r="4"/>
                            </svg>
                            <div><strong>Ad Revenue</strong><span>Earn from ads on your videos</span></div>
                        </div>
                        <div class="benefit-item">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                                <path d="M17 9l2 2 4-4"/>
                            </svg>
                            <div><strong>Orbship Program</strong><span>Receive direct support from fans</span></div>
                        </div>
                        <div class="benefit-item">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <div><strong>Premium Support</strong><span>Priority support from our team</span></div>
                        </div>
                    </div>
                </div>

                <!-- Apply Section -->
                <div class="apply-card" id="applyCard" style="display: none;">
                    <div class="apply-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <div>
                            <h3>You're eligible!</h3>
                            <p>All requirements met. Apply now to start monetizing your content.</p>
                        </div>
                        <button class="btn-apply" id="applyMonetizationBtn">Apply Now</button>
                    </div>
                </div>

                <!-- Ineligible Card -->
                <div class="ineligible-card" id="ineligibleCard">
                    <div class="ineligible-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                            <h3>Not yet eligible</h3>
                            <p>Complete the requirements above to join the Monetization Program.</p>
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