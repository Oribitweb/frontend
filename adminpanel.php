<?php
$pageTitle = "ORBIT — Admin Panel";
$extraCSS = '<link rel="stylesheet" href="css/main.css"><link rel="stylesheet" href="css/admin.css">';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="admin-panel">
    <div class="admin-header">
        <h2>Admin Dashboard</h2>
        <div class="admin-notif-btn" id="adminNotifBtn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-badge" id="notifBadge">0</span>
            <div class="notif-dropdown" id="notifDropdown">
                <div style="padding:8px 12px; font-weight:700; border-bottom:1px solid var(--border-color);">Notifications</div>
                <div id="notifList"></div>
                <div style="padding:8px 12px; text-align:center; font-size:0.8rem; color:var(--accent);">View all</div>
            </div>
        </div>
    </div>

    <nav class="admin-nav">
        <button class="admin-nav-item active" data-section="dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Dashboard
        </button>
        <button class="admin-nav-item" data-section="users">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
        </button>
        <button class="admin-nav-item" data-section="videos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Videos
        </button>
        <button class="admin-nav-item" data-section="live">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
            Live Streams
        </button>
    </nav>

    <div id="adminSections">
        <!-- Dashboard -->
        <section class="admin-section active" id="section-dashboard">
            <div class="stats-grid">
                <div class="stat-card"><span class="stat-label">Total Users</span><span class="stat-value" id="totalUsers">0</span><span class="stat-change">+12 this month</span></div>
                <div class="stat-card"><span class="stat-label">Total Videos</span><span class="stat-value" id="totalVideos">0</span><span class="stat-change">+5 this week</span></div>
                <div class="stat-card"><span class="stat-label">Active Streams</span><span class="stat-value">2</span><span class="stat-change">Live now</span></div>
                <div class="stat-card"><span class="stat-label">Banned Users</span><span class="stat-value" id="bannedCount">0</span><span class="stat-change">review needed</span></div>
            </div>
            <h3 style="margin-bottom:16px;">Recent Activity</h3>
            <div class="table-container"><table><thead><tr><th>Action</th><th>Target</th><th>Time</th></tr></thead><tbody id="recentActivity"></tbody></table></div>
        </section>

        <!-- Users -->
        <section class="admin-section" id="section-users">
            <div class="admin-search">
                <input type="text" class="admin-search-input" id="userSearch" placeholder="Search users...">
                <select class="filter-select" id="userRoleFilter">
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select class="filter-select" id="userStatusFilter">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                </select>
            </div>
            
            <!-- Add results count -->
            <div id="resultsCount" style="margin: 8px 0; color: var(--text-secondary); font-size: 0.9rem;"></div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Streaming</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody"></tbody>
                </table>
            </div>
            
            <!-- Add pagination container -->
            <div id="pagination" style="margin-top: 16px; display: flex; justify-content: center; gap: 8px;"></div>
        </section>

        <!-- Videos -->
        <section class="admin-section" id="section-videos">
            <div class="admin-search">
                <input type="text" class="admin-search-input" id="videoSearch" placeholder="Search videos...">
                <select class="filter-select" id="videoStatusFilter"><option value="all">All</option><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select>
            </div>
            <div class="table-container"><table><thead><tr><th>ID</th><th>Title</th><th>Channel</th><th>Views</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead><tbody id="videoTableBody"></tbody></table></div>
        </section>

        <!-- Live Streams -->
        <section class="admin-section" id="section-live">
            <div class="admin-search"><input type="text" class="admin-search-input" id="liveSearch" placeholder="Search live streams..."></div>
            <div class="table-container"><table><thead><tr><th>ID</th><th>Title</th><th>Streamer</th><th>Viewers</th><th>Uptime</th><th>Restriction</th><th>Actions</th></tr></thead><tbody id="liveTableBody"></tbody></table></div>
        </section>
    </div>
    <div id="toastContainer" style="position:fixed; bottom:24px; right:24px; z-index:10000; display:flex; flex-direction:column; gap:8px;"></div>
</main>

<!-- Ban Modal -->
<div class="modal-overlay" id="banModalOverlay"><div class="modal"><h3>🚫 Ban User</h3><form id="banForm"><div class="form-group"><label>User</label><input type="text" id="banUsername" readonly class="admin-search-input"></div><div class="form-group"><label>Duration (days)</label><input type="number" id="banDuration" class="admin-search-input" placeholder="Leave empty for permanent"></div><div class="checkbox-group"><input type="checkbox" id="banPermanent"><label for="banPermanent">Permanent ban</label></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeBanModal">Cancel</button><button type="submit" class="btn-danger">Ban</button></div></form></div></div>

<!-- Edit User Modal -->
<div class="modal-overlay" id="editUserModalOverlay"><div class="modal"><h3>✏️ Edit User</h3><form id="editUserForm"><input type="hidden" id="editUserId"><div class="form-group"><label>Username</label><input type="text" id="editUsername" class="admin-search-input" required></div><div class="form-group"><label>Email</label><input type="email" id="editEmail" class="admin-search-input" required></div><div class="form-group"><label>Role</label><select id="editRole" class="filter-select" style="width:100%;"><option value="user">User</option><option value="admin">Admin</option></select></div><div class="form-group"><label>Status</label><select id="editStatus" class="filter-select" style="width:100%;"><option value="active">Active</option><option value="banned">Banned</option></select></div><div class="form-group"><label>Channel Name</label><input type="text" id="editChannel" class="admin-search-input"></div><div class="form-group"><label>Handle</label><input type="text" id="editHandle" class="admin-search-input"></div><div class="form-group"><label>Bio</label><textarea id="editBio" rows="2"></textarea></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeEditUserModal">Cancel</button><button type="submit" class="btn btn--primary">Save</button></div></form></div></div>

<!-- Edit Video Modal -->
<div class="modal-overlay" id="editVideoModalOverlay"><div class="modal"><h3>📹 Edit Video</h3><form id="editVideoForm"><input type="hidden" id="editVideoId"><div class="form-group"><label>Title</label><input type="text" id="editVideoTitle" class="admin-search-input" required></div><div class="form-group"><label>Channel</label><input type="text" id="editVideoChannel" class="admin-search-input" required></div><div class="form-group"><label>Visibility</label><select id="editVideoStatus" class="filter-select" style="width:100%;"><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeEditVideoModal">Cancel</button><button type="submit" class="btn btn--primary">Save</button></div></form></div></div>

<!-- Video Copyright Modal -->
<div class="modal-overlay" id="copyrightModalOverlay"><div class="modal"><h3>⚠️ Video Copyright</h3><form id="copyrightForm"><input type="hidden" id="copyrightVideoId"><div class="form-group"><label>Video</label><input type="text" id="copyrightVideoTitle" readonly class="admin-search-input"></div><div class="form-group"><label>Copyright Type</label><select id="copyrightType" class="filter-select" style="width:100%;"><option value="no-copyright">No Copyright</option><option value="copyright-free">Copyright Free</option><option value="copyright-income">Copyright Income</option><option value="copyright-remove">Copyright Remove</option></select></div><div class="form-group"><label>Description</label><textarea id="copyrightDescription" rows="3" placeholder="Explain..."></textarea></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeCopyrightModal">Cancel</button><button type="submit" class="btn-danger">Submit Claim</button></div></form></div></div>

<!-- Edit Live Modal -->
<div class="modal-overlay" id="editLiveModalOverlay"><div class="modal"><h3>🔴 Edit Stream</h3><form id="editLiveForm"><input type="hidden" id="editLiveId"><div class="form-group"><label>Title</label><input type="text" id="editLiveTitle" class="admin-search-input" required></div><div class="form-group"><label>Streamer</label><input type="text" id="editLiveStreamer" class="admin-search-input" required></div><div class="checkbox-group"><input type="checkbox" id="editLiveAgeRestricted"><label for="editLiveAgeRestricted">Age Restrict</label></div><div class="checkbox-group"><input type="checkbox" id="editLiveChatEnabled"><label for="editLiveChatEnabled">Chat Enabled</label></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeEditLiveModal">Cancel</button><button type="submit" class="btn btn--primary">Save</button></div></form></div></div>

<!-- Live Copyright Modal -->
<div class="modal-overlay" id="liveCopyrightModalOverlay"><div class="modal"><h3>⚠️ Live Copyright</h3><form id="liveCopyrightForm"><input type="hidden" id="liveCopyrightStreamId"><div class="form-group"><label>Stream</label><input type="text" id="liveCopyrightStreamTitle" readonly class="admin-search-input"></div><div class="form-group"><label>Copyright Type</label><select id="liveCopyrightType" class="filter-select" style="width:100%;"><option value="no-copyright">No Copyright</option><option value="copyright-free">Copyright Free</option><option value="copyright-income">Copyright Income</option><option value="copyright-remove">Copyright Remove</option></select></div><div class="form-group"><label>Description</label><textarea id="liveCopyrightDescription" rows="3" placeholder="Explain..."></textarea></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeLiveCopyrightModal">Cancel</button><button type="submit" class="btn-danger">Submit Claim</button></div></form></div></div>

<!-- Message Streamer Modal -->
<div class="modal-overlay" id="messageModalOverlay"><div class="modal"><h3>💬 Private Message</h3><form id="messageForm"><input type="hidden" id="messageStreamId"><div class="form-group"><label>Stream</label><input type="text" id="messageStreamTitle" readonly class="admin-search-input"></div><div class="form-group"><label>Message</label><textarea id="messageText" rows="3" placeholder="Type your message..." required></textarea></div><div class="modal-actions"><button type="button" class="btn-secondary" id="closeMessageModal">Cancel</button><button type="submit" class="btn btn--primary">Send</button></div></form></div></div>

<?php include 'includes/footer.php'; ?>
<script src="js/admin.js"></script>
</body>
</html> 