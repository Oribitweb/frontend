<?php
$pageTitle = "ORBIT — Orbiter Studio";
$extraCSS = '
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/popups.css">
    <link rel="stylesheet" href="css/ostudio.css">
    <link rel="stylesheet" href="css/orby.css">
    <script src="scripts/jsdelivr/chart.js"></script>
    <script src="scripts/jsdelivr/Sortable.min.js"></script>
';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="studio-main">
    <div class="studio-container">
        <!-- Sidebar (unchanged) -->
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
                <button class="studio-nav-item" data-view="copyright"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Copyright</span></button>
                <button class="studio-nav-item" data-view="customization"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Customization</span></button>
                <button class="studio-nav-item" data-view="monetization"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><span>Monetization</span></button>
                <button class="studio-nav-item" data-view="audiolibrary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><span>Audio Library</span></button>
            </nav>
            <div class="studio-sidebar-footer">
                <a href="settings.php" class="studio-nav-item"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Settings</span></a>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="studio-content">
            <!-- Dashboard -->
            <div class="studio-view active" id="view-dashboard">
                <div class="studio-header"><div><h1>Dashboard</h1><p class="studio-sub">Welcome back, <span id="studioChannelName">Creator</span></p></div></div>
                <div class="stats-grid" id="dashboardStats"></div>
                <div class="chart-card"><div class="chart-header"><h3>Channel Performance</h3><select id="chartPeriod" class="filter-select-sm"><option value="7">Last 7 days</option><option value="28" selected>Last 28 days</option><option value="90">Last 90 days</option></select></div><canvas id="viewsChart" height="200"></canvas></div>
                <div class="recent-videos-card"><h3>Recent Videos</h3><div class="video-list" id="recentVideoList"></div></div>
            </div>

            <!-- Content (with extra buttons) -->
            <div class="studio-view" id="view-content">
                <div class="studio-header">
                    <h1>Content</h1>
                    <div class="content-actions">
                        <button class="btn-upload" id="uploadVideoBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>Upload Video</button>
                        <button class="btn-upload" id="uploadShortBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="8 13 10 15 12 13"/></svg>Upload Short</button>
                        <button class="btn-upload" id="newPostBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>New Post</button>
                    </div>
                </div>
                <div class="content-filters"><div class="search-wrapper"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="videoSearchInput" placeholder="Search your videos..."></div><select id="visibilityFilter" class="filter-select"><option value="all">All visibility</option><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></div>
                <div class="videos-table-container"><table class="videos-table"><thead><tr><th>Video</th><th>Visibility</th><th>Views</th><th>Comments</th><th>Upload Date</th><th></th></tr></thead><tbody id="videosTableBody"></tbody></table><div id="contentPagination" class="pagination"></div></div>
            </div>

            <!-- Community Posts -->
            <div class="studio-view" id="view-community">
                <div class="studio-header"><h1>Community</h1><button class="btn-upload" id="newPostBtn2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>New Post</button></div>
                <div class="community-posts" id="communityPostsList"></div>
            </div>

            <!-- Analytics -->
            <div class="studio-view" id="view-analytics">
                <div class="studio-header"><h1>Analytics</h1><select id="analyticsPeriod" class="filter-select"><option value="7">Last 7 days</option><option value="28" selected>Last 28 days</option><option value="90">Last 90 days</option></select></div>
                <div class="metrics-grid" id="coreMetrics"></div><div class="metrics-grid advanced" id="advancedStats"></div>
                <div class="chart-card"><h3>Views Trend</h3><canvas id="analyticsChart" height="200"></canvas></div>
                <div class="top-videos-card"><h3>Top Performing Videos</h3><div id="topContentList" class="video-list"></div></div>
            </div>

            <!-- Comments (exactly like video.php) -->
            <div class="studio-view" id="view-comments">
                <div class="studio-header"><h1>Comments</h1><select id="commentFilterVideo" class="filter-select"><option value="all">All videos</option></select></div>
                <div class="comments-list" id="studioCommentsList"></div>
            </div>

            <!-- Live Studio (with improved chat and player) -->
            <div class="studio-view" id="view-live">
                <div class="studio-header">
                    <h1>Live Studio</h1>
                    <div class="live-status" id="liveStatusBadge">
                        <span class="status-dot offline"></span> Offline
                    </div>
                </div>
                <div class="live-studio-grid">
                    <!-- Left: Video Player (HTML5 like live.php) -->
                    <div class="live-broadcast-panel">
                        <div class="live-player-container" id="livePlayerContainer">
                            <div class="muted-indicator" id="mutedIndicatorLive">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                                <span>Muted</span>
                            </div>
                            <div class="live-indicator" id="liveIndicator" style="display:none;">
                                <span class="live-dot"></span> LIVE
                            </div>
                            <video id="livePreviewVideo" class="live-video" style="display:none;" muted autoplay></video>
                            <div id="offlineBanner" class="offline-banner"><img src="assets/img/offline.png" alt="Offline"></div>
                            <div class="custom-controls" id="liveControls">
                                <div class="controls-row">
                                    <div class="left-controls">
                                        <button class="control-btn" id="livePlayBtn"><svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>
                                        <div class="volume-group"><button class="control-btn" id="liveVolumeBtn"><svg class="vol-on" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg><svg class="vol-off" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></button><div class="volume-slider-container"><input type="range" class="volume-slider" id="liveVolumeSlider" min="0" max="1" step="0.05" value="1"></div></div>
                                        <span class="time-display" id="liveTimeDisplay">LIVE</span>
                                    </div>
                                    <div class="right-controls">
                                        <button class="control-btn" id="liveFullscreenBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="stream-stats-bar"><div class="stat-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span id="liveViewers">0</span> watching</div><div class="stat-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span id="liveUptime">00:00:00</span></div></div>
                        <div class="stream-info-panel"><div class="info-row"><label>Stream Title</label><input type="text" id="streamTitle" class="form-input" placeholder="Stream Title" value="My Awesome Stream"></div><div class="info-row"><label>Description</label><textarea id="streamDescription" class="form-textarea" rows="2" placeholder="Stream Description"></textarea></div><div class="info-row"><label>Category</label><div class="category-search-wrapper"><input type="text" id="categorySearchInput" class="form-input" placeholder="Search category..."><div class="category-dropdown" id="categoryDropdown" style="display:none;"></div></div><select id="streamCategory" class="filter-select" style="display:none;"></select></div><button class="btn-save" id="updateStreamInfoBtn">Update Stream Info</button></div>
                    </div>
                    <!-- Right: Chat like live.php -->
                    <div class="live-interaction-panel">
                        <div class="live-chat-container">
                            <div class="chat-header"><h3>Live Chat</h3><div class="chat-stats"><span id="chatUserCount">0</span> viewers in chat</div></div>
                            <div class="live-chat-messages" id="liveChatMessages"></div>
                            <div class="chat-input-area">
                                <button class="emoji-btn" id="liveEmojiBtn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
                                <button class="orby-btn" id="orbyBtnLive"><img src="assets/img/orby/orby.png" alt="Orby" width="22" height="22"></button>
                                <input type="text" id="liveChatInput" placeholder="Say something..." maxlength="200" disabled>
                                <button id="liveChatSendBtn" disabled>Send</button>
                                <div class="emoji-menu" id="liveEmojiMenu"></div>
                            </div>
                        </div>
                        <div class="stream-settings-panel"><div class="settings-section"><div class="settings-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><span>Stream Configuration</span></div><div class="key-row"><span>Stream Key</span><div class="key-value"><input type="text" id="streamKey" readonly value="xxxx-xxxx-xxxx-xxxx"><button class="btn-copy" id="copyStreamKeyBtn">Copy</button></div></div><div class="key-row"><span>Server URL</span><div class="key-value"><input type="text" id="serverUrl" readonly value="rtmp://live.orbit.com/live"></div></div><button class="btn-secondary" id="resetStreamKeyBtn">Reset Stream Key</button></div><div class="settings-section"><div class="settings-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Chat Settings</span></div><div class="toggle-item"><span>Slow Mode (10s)</span><label class="switch"><input type="checkbox" id="slowMode"><span class="slider"></span></label></div><div class="toggle-item"><span>Subscribers Only</span><label class="switch"><input type="checkbox" id="subsOnlyMode"><span class="slider"></span></label></div><div class="toggle-item"><span>Followers Only (10 min)</span><label class="switch"><input type="checkbox" id="followersOnlyMode"><span class="slider"></span></label></div><div class="toggle-item"><span>Enable Emotes</span><label class="switch"><input type="checkbox" id="enableEmotes" checked><span class="slider"></span></label></div><div class="input-group"><label>Blocked Words</label><input type="text" id="blockedWords" class="form-input" placeholder="word1,word2,word3"></div><button class="btn-save" id="saveChatSettings">Save Chat Settings</button></div></div>
                    </div>
                </div>
            </div>

            <!-- Copyright -->
            <div class="studio-view" id="view-copyright">
                <div class="studio-header"><h1>Copyright Management</h1></div>
                <div class="copyright-stats"><div class="stat-card"><div class="stat-label">Active Claims</div><div class="stat-value" id="activeClaims">0</div></div><div class="stat-card"><div class="stat-label">Resolved</div><div class="stat-value" id="resolvedClaims">0</div></div><div class="stat-card"><div class="stat-label">Disputes</div><div class="stat-value" id="disputeClaims">0</div></div></div>
                <div class="copyright-list" id="copyrightList"></div><button class="btn-primary" id="newClaimBtn" style="margin-top:20px;">+ New Copyright Claim</button>
            </div>

            <!-- Customization (Home Layout with Playlist sections) -->
            <div class="studio-view" id="view-customization">
                <div class="studio-header"><h1>Customization</h1><p class="studio-sub">Personalize your channel and homepage</p></div>
                <div class="customization-tabs"><button class="custom-tab active" data-custom-tab="channel">Channel Settings</button><button class="custom-tab" data-custom-tab="home">Home Layout</button></div>
                <div class="custom-tab-content active" id="customChannel"><div class="customization-card"><form id="channelCustomizeForm"><div class="form-row"><div class="form-group"><label>Channel Name</label><input type="text" id="channelName" class="form-input"></div><div class="form-group"><label>Handle</label><input type="text" id="channelHandle" class="form-input"></div></div><div class="form-group"><label>Description</label><textarea id="channelBio" class="form-textarea" rows="3"></textarea></div><div class="form-row"><div class="form-group"><label>Profile Picture</label><input type="file" id="avatarFile" accept="image/*"><div class="avatar-preview" id="avatarPreview"></div></div><div class="form-group"><label>Banner Image</label><input type="file" id="bannerFile" accept="image/*"></div></div><button type="submit" class="btn-save">Save Changes</button></form></div></div>
                <div class="custom-tab-content" id="customHome"><div class="customization-card"><div class="home-layout-header"><h3>Homepage Sections</h3><div class="layout-actions"><button class="btn-secondary" id="addNewSectionBtn">+ Add New Section</button></div></div><p class="studio-sub">Drag and drop to reorder sections. Toggle to show/hide.</p><div class="home-sections-list" id="homeSectionsList"></div><button class="btn-save" id="saveHomeLayout">Save Home Layout</button></div></div>
            </div>

            <!-- Monetization with Orbship plans (badges + stickers) -->
            <div class="studio-view" id="view-monetization">
                <div class="monetization-header"><div class="monetization-title"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><div><h1>Monetization & Orbship</h1><p>Start earning from your content</p></div></div></div>
                <div class="requirements-grid" id="requirementsGrid"></div>
                <div class="orbship-membership"><h3>Orbship Membership Levels</h3><div class="membership-grid" id="membershipGrid"></div><button class="btn-primary" id="saveMembershipBtn">Save Membership Settings</button></div>
                <div class="benefits-card"><h3>Program Benefits</h3><div class="benefits-grid"><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg><div><strong>Ad Revenue</strong><span>Earn from ads on your videos</span></div></div><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M17 9l2 2 4-4"/></svg><div><strong>Orbship Program</strong><span>Receive direct support from fans</span></div></div><div class="benefit-item"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><div><strong>Premium Support</strong><span>Priority support from our team</span></div></div></div></div>
                <div class="apply-card" id="applyCard" style="display:none;"><div class="apply-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><h3>You're eligible!</h3><p>All requirements met. Apply now to start monetizing.</p></div><button class="btn-apply" id="applyMonetizationBtn">Apply Now</button></div></div>
                <div class="ineligible-card" id="ineligibleCard"><div class="ineligible-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><h3>Not yet eligible</h3><p>Complete the requirements above to join.</p></div></div></div>
            </div>

            <!-- Audio Library (Royalty‑free music) -->
            <div class="studio-view" id="view-audiolibrary">
                <div class="studio-header"><h1>Audio Library</h1><p class="studio-sub">Royalty‑free music for your videos</p></div>
                <div class="audio-library-grid" id="audioLibraryGrid"></div>
            </div>
        </div>
    </div>
</main>

<!-- Modals -->
<div class="notif-center" id="notifCenter"><div class="notif-header"><h3>Notifications</h3><button id="closeNotifBtn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="notif-list" id="notifList"></div></div>
<div class="modal-overlay" id="newPostModal"><div class="modal"><h3>Create Community Post</h3><textarea id="postContent" class="form-textarea" rows="4" placeholder="What's on your mind?"></textarea><div class="modal-actions"><button class="btn-secondary" id="closePostModal">Cancel</button><button class="btn-primary" id="submitPostBtn">Post</button></div></div></div>
<div class="modal-overlay" id="newClaimModal"><div class="modal"><h3>File Copyright Claim</h3><select id="claimVideoSelect" class="filter-select"></select><div class="form-group"><label>Claim Type</label><select id="claimType" class="filter-select"><option value="copyright">Copyright Infringement</option><option value="trademark">Trademark Violation</option><option value="other">Other</option></select></div><div class="form-group"><label>Description</label><textarea id="claimDescription" class="form-textarea" rows="3"></textarea></div><div class="modal-actions"><button class="btn-secondary" id="closeClaimModal">Cancel</button><button class="btn-primary" id="submitClaimBtn">Submit Claim</button></div></div></div>
<div class="modal-overlay" id="addSectionModal"><div class="modal"><h3>Add New Section</h3><div class="form-group"><label>Section Type</label><select id="newSectionType" class="filter-select"><option value="featured">Featured Video</option><option value="popular">Popular Uploads</option><option value="latest">Latest Videos</option><option value="playlists">Playlists</option><option value="single-playlist">Single Playlist</option><option value="multiple-playlist">Multiple Playlist</option><option value="custom">Custom Section</option></select></div><div class="form-group" id="customSectionNameGroup" style="display:none;"><label>Custom Section Name</label><input type="text" id="customSectionName" class="form-input" placeholder="e.g., My Favorites"></div><div class="form-group" id="playlistSelectGroup" style="display:none;"><label>Select Playlist(s)</label><select id="playlistSelect" class="filter-select" multiple size="3"></select><small>Hold Ctrl/Cmd to select multiple</small></div><div class="modal-actions"><button class="btn-secondary" id="closeSectionModal">Cancel</button><button class="btn-primary" id="confirmAddSectionBtn">Add Section</button></div></div></div>

<!-- Edit Video Modal (full metadata) -->
<div class="modal-overlay" id="editVideoModalOverlay"><div class="modal modal-large"><h3>✏️ Edit Video</h3><form id="editVideoForm"><input type="hidden" id="editVideoId"><div class="form-row"><div class="form-group"><label>Title</label><input type="text" id="editVideoTitle" class="form-input" required></div><div class="form-group"><label>Description</label><textarea id="editVideoDescription" class="form-textarea" rows="3"></textarea></div></div><div class="form-row"><div class="form-group"><label>Thumbnail</label><input type="file" id="editThumbInput" accept="image/*"><img id="editThumbPreview" style="width:120px; margin-top:8px; border-radius:8px;"></div><div class="form-group"><label>Visibility</label><select id="editVideoVisibility" class="filter-select"><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></div></div><div class="form-row"><div class="form-group"><label>Category</label><div class="category-search-wrapper"><input type="text" id="editCategorySearch" class="form-input" placeholder="Search category..."><div class="category-dropdown" id="editCategoryDropdown" style="display:none;"></div></div><select id="editVideoCategory" class="filter-select" style="display:none;"></select></div><div class="form-group"><label>Language</label><select id="editVideoLanguage" class="filter-select"><option value="en">English</option><option value="fa">Persian</option><option value="es">Spanish</option></select></div></div><div class="form-group"><label>Tags</label><div class="tag-section"><div class="tag-display" id="editTagDisplay"></div><div class="tag-input-row"><input type="text" id="editTagInput" class="form-input" placeholder="Add a tag..."><button type="button" id="editAddTagBtn" class="btn btn--small">Add</button></div></div></div><div class="form-group"><label>Playlist</label><select id="editVideoPlaylist" class="filter-select"><option value="">None</option></select></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeEditVideoModal">Cancel</button><button type="submit" class="btn-primary">Save Changes</button></div></form></div></div>

<!-- Upload Popup with 4 Tabs (will be injected via JS) -->
<div class="popup" id="uploadPopup" role="dialog" aria-modal="true">
    <div class="popup__panel popup__panel--upload popup__panel--tabs">
        <button class="popup__close" data-close="uploadPopup" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="upload-tabs">
            <button class="upload-tab active" data-tab="basic">1. Basic</button>
            <button class="upload-tab" data-tab="cards">2. Cards & End Screen</button>
            <button class="upload-tab" data-tab="ads">3. Ad Placement</button>
            <button class="upload-tab" data-tab="copyright">4. Copyright Check</button>
        </div>
        <div class="upload-tab-content active" id="uploadTabBasic">
            <!-- Same as original upload form, plus playlist selection and gaming category search -->
            <form class="popup__form" id="uploadForm" novalidate>
                <fieldset class="form-section"><legend class="form-section__title">Details</legend>
                    <div class="input-group"><label>Title <span class="required">*</span></label><input type="text" id="videoTitle" placeholder="Add a catchy title" required></div>
                    <div class="input-group"><label>Description</label><div id="videoDescription" class="input-area" contenteditable="true" placeholder="Tell viewers about your video. Add #hashtags..."></div><div class="char-counter" id="descCounter">0 / 5000</div></div>
                    <div class="input-group"><label>Playlist</label><select id="videoPlaylistSelect" class="filter-select"><option value="">None</option></select></div>
                    <div class="input-group"><label>Thumbnail</label><div class="thumbnail-options"><div class="file-upload-area thumbnail-box" id="thumbUploadArea"><input type="file" id="thumbUploadInput" accept="image/*" hidden><div class="file-upload-area__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div><p class="file-upload-area__text">Upload thumbnail</p></div><button type="button" class="thumbnail-box thumbnail-box--frame" id="chooseFrameBtn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg><span>Choose from video</span></button></div></div>
                    <div class="input-group"><label>Visibility</label><div class="radio-group"><label class="radio-item"><input type="radio" name="visibility" value="private"> Private</label><label class="radio-item"><input type="radio" name="visibility" value="unlisted"> Unlisted</label><label class="radio-item"><input type="radio" name="visibility" value="public" checked> Public</label></div></div>
                    <div class="input-group"><label for="schedule">Schedule (optional)</label><input type="datetime-local" id="schedule" class="input--datetime"></div>
                    <div class="input-group"><label>Audience</label><div class="radio-group radio-group--vertical"><label class="radio-item"><input type="radio" name="audience" value="kids"> Yes, it’s made for kids</label><label class="radio-item"><input type="radio" name="audience" value="not-kids" checked> No, it’s not made for kids</label><label class="radio-item"><input type="radio" name="audience" value="not-sure"> Not sure</label></div></div>
                </fieldset>
                <fieldset class="form-section"><legend class="form-section__title">Video</legend><div class="input-group"><label>Video File <span class="required">*</span></label><div class="file-upload-area" id="videoFileArea"><input type="file" id="videoFileInput" accept="video/*" hidden><div class="file-upload-area__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div><p class="file-upload-area__text" id="videoFileName">Click to select a video file</p></div></div><div class="progress-container" id="progressContainer" style="display:none;"><div class="progress-bar"><div class="progress-bar__fill" id="progressFill"></div></div><span class="progress-text" id="progressText">0%</span></div></fieldset>
                <fieldset class="form-section"><legend class="form-section__title">Select</legend><div class="input-group"><label>Language</label><select id="language" class="select-input"><option value="en">English</option><option value="fa">Persian</option><option value="es">Spanish</option><option value="fr">French</option><option value="ar">Arabic</option><option value="de">German</option></select></div>
                <div class="input-group"><label>Category</label><div class="category-search-wrapper"><input type="text" id="uploadCategorySearch" class="form-input" placeholder="Search category..."><div class="category-dropdown" id="uploadCategoryDropdown" style="display:none;"></div></div><select id="category" class="select-input" style="display:none;"><option value="entertainment">Entertainment</option><option value="gaming">Gaming</option></select></div>
                <div class="input-group"><label>License</label><div class="radio-group"><label class="radio-item"><input type="radio" name="license" value="standard" checked> Orbit Standard License</label><label class="radio-item"><input type="radio" name="license" value="cc"> Creative Commons</label></div></div>
                <div class="input-group"><label>Comments</label><div class="radio-group radio-group--vertical"><label class="radio-item"><input type="radio" name="comments" value="hold"> Hold potentially inappropriate comments for review</label><label class="radio-item"><input type="radio" name="comments" value="hide"> Hide all inappropriate comments</label><label class="radio-item"><input type="radio" name="comments" value="allow" checked> Allow all comments</label></div></div>
                <div class="input-group"><label>Tags</label><div class="tag-section"><div class="tag-display" id="tagDisplay"></div><div class="tag-input-row"><input type="text" id="tagInput" class="tag-input-simple" placeholder="Add a tag..."><button type="button" id="addTagBtn" class="btn btn--small btn--tag">Add</button></div><div class="tag-counter" id="tagCounter">0 / 500 tags</div></div></div></fieldset>
            </form>
        </div>
        <div class="upload-tab-content" id="uploadTabCards">
            <div class="form-group"><label>End Screen</label><textarea id="endScreenHtml" class="form-textarea" rows="4" placeholder="HTML for end screen (cards, subscribe, etc.)"></textarea></div>
            <div class="form-group"><label>Subtitles (SRT)</label><input type="file" id="subtitleFile" accept=".srt,.vtt"></div>
            <div class="form-group"><label>Cards</label><div id="cardsList"></div><button type="button" id="addCardBtn" class="btn-secondary">+ Add Card</button></div>
        </div>
        <div class="upload-tab-content" id="uploadTabAds">
            <p>Click on the video timeline below to set ad markers. Each click adds an ad spot (mid-roll).</p>
            <div id="adTimelinePreview" class="ad-timeline" style="height:40px; background:#333; border-radius:8px; margin:20px 0; position:relative;"><div id="adMarkersContainer" style="position:relative; height:100%;"></div></div>
            <div id="adMarkersList"></div>
            <button type="button" id="clearAdMarkers" class="btn-secondary">Clear All</button>
        </div>
        <div class="upload-tab-content" id="uploadTabCopyright">
            <div id="copyrightCheckStatus">Checking copyright...</div>
            <div id="copyrightCheckResult" style="margin-top:16px;"></div>
        </div>
        <div class="upload-actions"><button type="submit" class="btn btn--primary btn--full" id="finalPublishBtn" disabled>Publish Video</button></div>
    </div>
</div>

<!-- Short Upload Popup (same as before) -->
<div class="popup" id="shortPopup" role="dialog" aria-modal="true"><div class="popup__panel popup__panel--upload"><button class="popup__close" data-close="shortPopup"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="popup__icon-ring"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><polyline points="8 13 10 15 12 13"/></svg></div><h2 class="popup__title">Upload Short Video</h2><p class="popup__subtitle">Vertical videos, 60 seconds or less</p><form class="popup__form" id="shortForm" novalidate><div class="input-group"><label>Title</label><input type="text" id="shortTitle" placeholder="Short video title" required></div><div class="input-group"><label>Short Video File <span class="required">*</span></label><div class="file-upload-area" id="shortFileArea"><input type="file" id="shortFileInput" accept="video/*" hidden><div class="file-upload-area__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div><p class="file-upload-area__text" id="shortFileName">Click to select a short video</p></div></div><div class="input-group"><label>Visibility</label><div class="radio-group"><label class="radio-item"><input type="radio" name="shortVisibility" value="public" checked> Public</label><label class="radio-item"><input type="radio" name="shortVisibility" value="unlisted"> Unlisted</label></div></div><button type="submit" class="btn btn--primary btn--full">Publish Short</button></form></div></div>

<!-- Orby Selection Modal (same as live.php) -->
<div class="orby-selection-overlay" id="orbySelectionOverlay"><div class="orby-selection-panel"><h3>💎 DONATE AS ORBY!</h3><p>CHOOSE YOUR ORBY AMOUNT</p><div class="orby-levels-grid" id="orbyLevelsGrid"></div><button class="orby-close-btn" id="orbyCloseBtn">Close</button></div></div>
<div class="orby-donation-modal" id="orbyDonationModal"><div class="orby-donation-panel"><div class="orby-donation-header"><h4 id="donationAmountTitle">Send 75 ORBY</h4><button class="orby-modal-close" id="orbyModalCloseBtn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="orby-donation-body"><div class="orby-message-area"><label>Your message (optional)</label><textarea id="orbyMessageInput" rows="3" placeholder="Write a message to the streamer..."></textarea><div class="orby-emoji-tools" id="orbyEmojiTools" style="display:none;"><button id="orbyEmojiBtn" class="orby-tool-btn">😀 Add Emoji</button><button id="orbyGifBtn" class="orby-tool-btn" style="display:none;">🎞️ Add GIF</button></div><div class="orby-voice-tool" id="orbyVoiceTool" style="display:none;"><button id="orbyRecordBtn" class="orby-tool-btn">🎙️ Record Voice (max 30s)</button><div id="orbyRecordingStatus" class="orby-recording-status"></div></div></div></div><div class="orby-donation-footer"><button id="orbyConfirmBtn" class="orby-confirm-btn">Send Orby</button><button id="orbyCancelBtn" class="orby-cancel-btn">Cancel</button></div></div></div>
<div class="orby-emoji-picker" id="orbyEmojiPicker"><div class="orby-emoji-header"><span>Pick an emoji</span><button id="orbyEmojiPickerClose">&times;</button></div><div class="orby-emoji-grid" id="orbyEmojiGrid"></div></div>

<?php include 'includes/footer.php'; ?>
<script src="js/categories.js"></script>
<script src="js/ostudio.js"></script>
</body>
</html>