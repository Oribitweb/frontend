<?php
$pageTitle = "ORBIT — Settings";
$extraCSS = '<link rel="stylesheet" href="css/settings.css">';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="settings-main" id="settingsMain">
    <div class="settings-container">
        <div class="settings-sidebar" id="settingsSidebar">
            <div class="settings-nav">
                <div class="settings-group">
                    <button class="settings-group-header open" data-group="channel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Channel Settings
                        <svg class="group-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="settings-group-items" id="channelGroup" style="display:flex;">
                        <button class="settings-sub-item active" data-section="channel-basic">Basic Info</button>
                        <button class="settings-sub-item" data-section="channel-branding">Branding</button>
                        <button class="settings-sub-item" data-section="channel-upload">Upload Defaults</button>
                        <button class="settings-sub-item" data-section="channel-permissions">Permissions</button>
                        <button class="settings-sub-item" data-section="channel-featured">Featured Sections</button>
                        <button class="settings-sub-item" data-section="channel-links">Links & Contact</button>
                    </div>
                </div>

                <div class="settings-group">
                    <button class="settings-group-header" data-group="live">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                        Live Streaming
                        <svg class="group-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="settings-group-items" id="liveGroup" style="display:none;">
                        <button class="settings-sub-item" data-section="live-stream-key">Stream Key & Server</button>
                        <button class="settings-sub-item" data-section="live-stream-info">Stream Info & Stickers</button>
                        <button class="settings-sub-item" data-section="live-dvr">Enable DVR</button>
                        <button class="settings-sub-item" data-section="live-latency">Latency Settings</button>
                        <button class="settings-sub-item" data-section="live-chat-replay">Chat Replay</button>
                        <button class="settings-sub-item" data-section="live-chat">Live Chat Settings</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="settings-content" id="settingsContent"></div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<script src="js/categories.js"></script>
<script src="js/settings.js"></script>
</body>
</html>