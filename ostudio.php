<?php
$pageTitle = "ORBIT — Orbiter Studio";
$extraCSS = '
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/popups.css">
    <link rel="stylesheet" href="css/ostudio.css">
    <script src="scripts/jsdelivr/chart.js"></script>
    <script src="scripts/jsdelivr/Sortable.min.js"></script>
';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="studio-main">
    <div class="studio-container">
        <!-- Sidebar (همانند قبل) -->
        <aside class="studio-sidebar">
            <div class="studio-sidebar-header">
                <div class="studio-avatar" id="studioAvatar">U</div>
                <div class="studio-user-info">
                    <span class="studio-username" id="studioUsername">Loading...</span>
                    <span class="studio-handle" id="studioHandle">@username</span>
                </div>
                <button class="notif-bell" id="notifBellBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <span class="notif-dot" id="notifDot"></span>
                </button>
            </div>
            <nav class="studio-nav">
                <button class="studio-nav-item active" data-view="dashboard"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg><span>Dashboard</span></button>
                <button class="studio-nav-item" data-view="content"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg><span>Content</span></button>
                <button class="studio-nav-item" data-view="community"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>Community</span></button>
                <button class="studio-nav-item" data-view="analytics"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="18" y1="14" x2="10.5" y2="6.5"/></svg><span>Analytics</span></button>
                <button class="studio-nav-item" data-view="comments"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/></svg><span>Comments</span></button>
                <button class="studio-nav-item" data-view="live"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg><span>Live Studio</span></button>
                <button class="studio-nav-item" data-view="abtesting"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 12H4M12 4v16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg><span>A/B Testing</span></button>
                <button class="studio-nav-item" data-view="copyright"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Copyright</span></button>
                <button class="studio-nav-item" data-view="customization"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Customization</span></button>
                <button class="studio-nav-item" data-view="monetization"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><span>Monetization</span></button>
            </nav>
            <div class="studio-sidebar-footer">
                <a href="settings.php" class="studio-nav-item"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Settings</span></a>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="studio-content">
            <!-- Dashboard (خلاصه) -->
            <div class="studio-view active" id="view-dashboard">
                <div class="studio-header"><div><h1>Dashboard</h1><p class="studio-sub">Welcome back, <span id="studioChannelName">Creator</span></p></div></div>
                <div class="stats-grid" id="dashboardStats"></div>
                <div class="chart-card"><div class="chart-header"><h3>Channel Performance</h3><select id="chartPeriod" class="filter-select-sm"><option value="7">Last 7 days</option><option value="28" selected>Last 28 days</option><option value="90">Last 90 days</option></select></div><canvas id="viewsChart" height="200"></canvas></div>
                <div class="recent-videos-card"><h3>Recent Videos</h3><div class="video-list" id="recentVideoList"></div></div>
            </div>

            <!-- Content (همانند قبل) -->
            <div class="studio-view" id="view-content">
                <div class="studio-header"><h1>Content</h1><button class="btn-upload" id="uploadVideoBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>Upload Video</button></div>
                <div class="content-filters"><div class="search-wrapper"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="videoSearchInput" placeholder="Search your videos..."></div><select id="visibilityFilter" class="filter-select"><option value="all">All visibility</option><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></div>
                <div class="videos-table-container"><table class="videos-table"><thead><tr><th>Video</th><th>Visibility</th><th>Views</th><th>Comments</th><th>Upload Date</th><th></th></tr></thead><tbody id="videosTableBody"></tbody></table><div id="contentPagination" class="pagination"></div></div>
            </div>

            <!-- Community -->
            <div class="studio-view" id="view-community">
                <div class="studio-header"><h1>Community</h1><button class="btn-upload" id="newPostBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>New Post</button></div>
                <div class="community-posts" id="communityPostsList"></div>
            </div>

            <!-- Analytics -->
            <div class="studio-view" id="view-analytics">
                <div class="studio-header"><h1>Analytics</h1><select id="analyticsPeriod" class="filter-select"><option value="7">Last 7 days</option><option value="28" selected>Last 28 days</option><option value="90">Last 90 days</option></select></div>
                <div class="metrics-grid" id="coreMetrics"></div><div class="metrics-grid advanced" id="advancedStats"></div>
                <div class="chart-card"><h3>Views Trend</h3><canvas id="analyticsChart" height="200"></canvas></div>
                <div class="top-videos-card"><h3>Top Performing Videos</h3><div id="topContentList" class="video-list"></div></div>
            </div>

            <!-- Comments -->
            <div class="studio-view" id="view-comments">
                <div class="studio-header"><h1>Comments</h1><select id="commentFilterVideo" class="filter-select"><option value="all">All videos</option></select></div>
                <div class="comments-list" id="studioCommentsList"></div>
            </div>

            <!-- ========== LIVE STUDIO - بدون دکمه Go Live و بدون بیت‌ریت ========== -->
            <div class="studio-view" id="view-live">
                <div class="studio-header">
                    <h1>Live Studio</h1>
                    <div class="live-status" id="liveStatusBadge">
                        <span class="status-dot offline"></span> Offline
                    </div>
                </div>

                <div class="live-studio-grid">
                    <!-- LEFT: Video Player + Stream Info -->
                    <div class="live-broadcast-panel">
                        <div class="live-player-container">
                            <img id="offlineBanner" src="assets/img/offline.png" alt="Offline" class="offline-banner">
                            <video id="livePreviewVideo" class="live-video" style="display:none;" controls></video>
                            <div class="live-indicator-overlay" id="liveIndicator" style="display:none;">
                                <span class="live-dot-pulse"></span> LIVE
                            </div>
                            <div class="stream-quality-badge" id="streamQualityBadge">HD 1080p</div>
                        </div>
                        <div class="stream-stats-bar">
                            <div class="stat-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span id="liveViewers">0</span> watching</div>
                            <div class="stat-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span id="liveUptime">00:00:00</span></div>
                        </div>
                        <div class="stream-info-panel">
                            <div class="info-row"><label>Stream Title</label><input type="text" id="streamTitle" class="form-input" placeholder="Stream Title" value="My Awesome Stream"></div>
                            <div class="info-row"><label>Description</label><textarea id="streamDescription" class="form-textarea" rows="2" placeholder="Stream Description"></textarea></div>
                            <div class="info-row"><label>Category</label>
                                <div class="category-search-wrapper">
                                    <input type="text" id="categorySearchInput" class="form-input" placeholder="Search category...">
                                    <div class="category-dropdown" id="categoryDropdown" style="display:none;"></div>
                                </div>
                                <select id="streamCategory" class="filter-select" style="display:none;"></select>
                            </div>
                            <button class="btn-save" id="updateStreamInfoBtn">Update Stream Info</button>
                        </div>
                    </div>

                    <!-- RIGHT: Chat Panel + Settings -->
                    <div class="live-interaction-panel">
                        <div class="live-chat-container">
                            <div class="chat-header">
                                <h3>Live Chat</h3>
                                <div class="chat-stats"><span id="chatUserCount">0</span> viewers in chat</div>
                            </div>
                            <div class="live-chat-messages" id="liveChatMessages">
                                <div class="chat-message"><span class="chat-user">System:</span> Start streaming via OBS to see chat</div>
                            </div>
                            <div class="chat-input-area">
                                <input type="text" id="liveChatInput" placeholder="Send a message..." disabled>
                                <button id="liveChatSendBtn" disabled>Send</button>
                            </div>
                        </div>
                        <div class="stream-settings-panel">
                            <div class="settings-section">
                                <div class="settings-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><span>Stream Configuration</span></div>
                                <div class="key-row"><span>Stream Key</span><div class="key-value"><input type="text" id="streamKey" readonly value="xxxx-xxxx-xxxx-xxxx"><button class="btn-copy" id="copyStreamKeyBtn">Copy</button></div></div>
                                <div class="key-row"><span>Server URL</span><div class="key-value"><input type="text" id="serverUrl" readonly value="rtmp://live.orbit.com/live"></div></div>
                                <button class="btn-secondary" id="resetStreamKeyBtn">Reset Stream Key</button>
                            </div>
                            <div class="settings-section">
                                <div class="settings-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Chat Settings</span></div>
                                <div class="toggle-item"><span>Slow Mode (10s)</span><label class="switch"><input type="checkbox" id="slowMode"><span class="slider"></span></label></div>
                                <div class="toggle-item"><span>Subscribers Only</span><label class="switch"><input type="checkbox" id="subsOnlyMode"><span class="slider"></span></label></div>
                                <div class="toggle-item"><span>Followers Only (10 min)</span><label class="switch"><input type="checkbox" id="followersOnlyMode"><span class="slider"></span></label></div>
                                <div class="toggle-item"><span>Enable Emotes</span><label class="switch"><input type="checkbox" id="enableEmotes" checked><span class="slider"></span></label></div>
                                <div class="input-group"><label>Blocked Words</label><input type="text" id="blockedWords" class="form-input" placeholder="word1,word2,word3"></div>
                                <button class="btn-save" id="saveChatSettings">Save Chat Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- A/B Testing -->
            <div class="studio-view" id="view-abtesting">
                <div class="studio-header"><h1>A/B Testing</h1><button class="btn-upload" id="newTestBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>Create Test</button></div>
                <div class="ab-tests-list" id="abTestsList"></div>
            </div>

            <!-- Copyright -->
            <div class="studio-view" id="view-copyright">
                <div class="studio-header"><h1>Copyright Management</h1></div>
                <div class="copyright-stats"><div class="stat-card"><div class="stat-label">Active Claims</div><div class="stat-value" id="activeClaims">0</div></div><div class="stat-card"><div class="stat-label">Resolved</div><div class="stat-value" id="resolvedClaims">0</div></div><div class="stat-card"><div class="stat-label">Disputes</div><div class="stat-value" id="disputeClaims">0</div></div></div>
                <div class="copyright-list" id="copyrightList"></div><button class="btn-primary" id="newClaimBtn" style="margin-top:20px;">+ New Copyright Claim</button>
            </div>

            <!-- ========== CUSTOMIZATION با HOME LAYOUT درگ و دراپ و اضافه کردن لایه ========== -->
            <div class="studio-view" id="view-customization">
                <div class="studio-header"><h1>Customization</h1><p class="studio-sub">Personalize your channel and homepage</p></div>
                <div class="customization-tabs"><button class="custom-tab active" data-custom-tab="channel">Channel Settings</button><button class="custom-tab" data-custom-tab="home">Home Layout</button></div>
                
                <!-- Channel Settings -->
                <div class="custom-tab-content active" id="customChannel">
                    <div class="customization-card"><form id="channelCustomizeForm"><div class="form-row"><div class="form-group"><label>Channel Name</label><input type="text" id="channelName" class="form-input"></div><div class="form-group"><label>Handle</label><input type="text" id="channelHandle" class="form-input"></div></div><div class="form-group"><label>Description</label><textarea id="channelBio" class="form-textarea" rows="3"></textarea></div><div class="form-row"><div class="form-group"><label>Profile Picture</label><input type="file" id="avatarFile" accept="image/*"><div class="avatar-preview" id="avatarPreview"></div></div><div class="form-group"><label>Banner Image</label><input type="file" id="bannerFile" accept="image/*"></div></div><button type="submit" class="btn-save">Save Changes</button></form></div>
                </div>
                
                <!-- Home Layout with Drag & Drop and Add New Section -->
                <div class="custom-tab-content" id="customHome">
                    <div class="customization-card">
                        <div class="home-layout-header">
                            <h3>Homepage Sections</h3>
                            <div class="layout-actions">
                                <button class="btn-secondary" id="addNewSectionBtn">+ Add New Section</button>
                            </div>
                        </div>
                        <p class="studio-sub">Drag and drop to reorder sections. Toggle to show/hide.</p>
                        <div class="home-sections-list" id="homeSectionsList">
                            <!-- Sections will be populated by JS with drag & drop -->
                        </div>
                        <button class="btn-save" id="saveHomeLayout">Save Home Layout</button>
                    </div>
                </div>
            </div>

            <!-- Monetization -->
            <div class="studio-view" id="view-monetization">
                <div class="monetization-header"><div class="monetization-title"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><div><h1>Monetization & Orbship</h1><p>Start earning from your content</p></div></div></div>
                <div class="requirements-grid" id="requirementsGrid"></div>
                <div class="orbship-membership"><h3>Orbship Membership Levels</h3><div class="membership-grid" id="membershipGrid"></div><button class="btn-primary" id="saveMembershipBtn">Save Membership Settings</button></div>
                <div class="benefits-card"><h3>Program Benefits</h3><div class="benefits-grid"><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><div><strong>Ad Revenue</strong><span>Earn from ads on your videos</span></div></div><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M17 9l2 2 4-4"/></svg><div><strong>Orbship Program</strong><span>Receive direct support from fans</span></div></div><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><div><strong>Premium Support</strong><span>Priority support from our team</span></div></div></div></div>
                <div class="apply-card" id="applyCard" style="display:none;"><div class="apply-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><h3>You're eligible!</h3><p>All requirements met. Apply now to start monetizing.</p></div><button class="btn-apply" id="applyMonetizationBtn">Apply Now</button></div></div>
                <div class="ineligible-card" id="ineligibleCard"><div class="ineligible-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><h3>Not yet eligible</h3><p>Complete the requirements above to join.</p></div></div></div>
            </div>
        </div>
    </div>
</main>

<!-- Modals (همانند قبل) -->
<div class="notif-center" id="notifCenter"><div class="notif-header"><h3>Notifications</h3><button id="closeNotifBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="notif-list" id="notifList"></div></div>
<div class="modal-overlay" id="newPostModal"><div class="modal"><h3>Create Community Post</h3><textarea id="postContent" class="form-textarea" rows="4" placeholder="What's on your mind?"></textarea><div class="modal-actions"><button class="btn-secondary" id="closePostModal">Cancel</button><button class="btn-primary" id="submitPostBtn">Post</button></div></div></div>
<div class="modal-overlay" id="newTestModal"><div class="modal"><h3>Create A/B Test</h3><select id="testVideoSelect" class="filter-select"></select><div class="form-group"><label>Original Thumbnail URL</label><input type="text" id="originalThumb" class="form-input"></div><div class="form-group"><label>Variant Thumbnail URL</label><input type="text" id="variantThumb" class="form-input"></div><div class="form-group"><label>Duration (days)</label><input type="number" id="testDuration" class="form-input" value="7"></div><div class="modal-actions"><button class="btn-secondary" id="closeTestModal">Cancel</button><button class="btn-primary" id="startTestBtn">Start Test</button></div></div></div>
<div class="modal-overlay" id="newClaimModal"><div class="modal"><h3>File Copyright Claim</h3><select id="claimVideoSelect" class="filter-select"></select><div class="form-group"><label>Claim Type</label><select id="claimType" class="filter-select"><option value="copyright">Copyright Infringement</option><option value="trademark">Trademark Violation</option><option value="other">Other</option></select></div><div class="form-group"><label>Description</label><textarea id="claimDescription" class="form-textarea" rows="3"></textarea></div><div class="modal-actions"><button class="btn-secondary" id="closeClaimModal">Cancel</button><button class="btn-primary" id="submitClaimBtn">Submit Claim</button></div></div></div>

<!-- Modal for Add New Section -->
<div class="modal-overlay" id="addSectionModal"><div class="modal"><h3>Add New Section</h3><div class="form-group"><label>Section Type</label><select id="newSectionType" class="filter-select"><option value="featured">Featured Video</option><option value="popular">Popular Uploads</option><option value="latest">Latest Videos</option><option value="playlists">Playlists</option><option value="custom">Custom Section</option></select></div><div class="form-group" id="customSectionNameGroup" style="display:none;"><label>Custom Section Name</label><input type="text" id="customSectionName" class="form-input" placeholder="e.g., My Favorites"></div><div class="modal-actions"><button class="btn-secondary" id="closeSectionModal">Cancel</button><button class="btn-primary" id="confirmAddSectionBtn">Add Section</button></div></div></div>

<?php include 'includes/footer.php'; ?>
<script src="js/categories.js"></script>
<script src="js/ostudio.js"></script>
</body>
</html>