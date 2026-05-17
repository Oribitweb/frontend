<?php
$pageTitle = "ORBIT — Channel";
$extraCSS = '<link rel="stylesheet" href="css/channel.css">';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="channel-main" id="channelMain">
    <div class="channel-banner">
        <img src="assets/banner.png" alt="Channel Banner" class="banner-img" onerror="this.style.display='none'">
    </div>

    <div class="channel-header">
        <div class="channel-avatar-large">CN</div>
        <div class="channel-info-text">
            <h1 class="channel-name">
                Channel Name
                <span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>
            </h1>
            <div class="channel-handle-row">
                <span class="channel-handle">@channelname</span>
                <span class="subscriber-count">123K subscribers</span>
                <span class="video-count">120 videos</span>
            </div>
            <p class="channel-description">
                Welcome to the official ORBIT channel. We explore the universe of content. Subscribe for more!
            </p>
        </div>
        <div class="channel-actions">
            <button class="btn btn--primary subscribe-btn" id="subscribeBtn">Subscribe</button>
            <button class="notification-bell-btn" id="notificationBellBtn" title="Notifications" style="display:none;">
                <svg class="bell-on" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 13.18V10a6 6 0 0 0-5-5.91V3a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 10v3.18A3 3 0 0 0 4 16v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a3 3 0 0 0-2-2.82zM12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/></svg>
                <svg class="bell-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8v7"/><path d="M18 8a6 6 0 0 0-9.33-5"/><path d="M4 17H2"/><path d="M22 17h-2"/><path d="M17 2l5 5"/><path d="M2 2l20 20"/></svg>
            </button>
        </div>
    </div>

    <div class="channel-tabs">
        <button class="tab-btn active" data-tab="home">Home</button>
        <button class="tab-btn" data-tab="videos">Videos</button>
        <button class="tab-btn" data-tab="live">Live</button>
        <button class="tab-btn" data-tab="about">About</button>
    </div>

    <div class="tab-content" id="tabHome">
        <div class="home-featured">
            <div class="featured-video-card" id="featuredVideoCard">
                <div class="featured-thumb" style="background-image: url('assets/thumbnail.png')">
                    <div class="featured-duration">12:34</div>
                    <div class="featured-play-overlay">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                </div>
                <div class="featured-info">
                    <span class="featured-label">FEATURED</span>
                    <h2 class="featured-title">How to Explore Space</h2>
                    <div class="featured-meta">1.2M views • 2 weeks ago</div>
                    <p class="featured-desc">Join us on a journey through the cosmos. This video is a fan favorite and a great place to start!</p>
                </div>
            </div>
        </div>

        <div class="home-section">
            <h3 class="home-section-title">Popular uploads</h3>
            <div class="video-grid" id="homeVideoGrid"></div>
        </div>
        <div class="home-section">
            <h3 class="home-section-title">Videos</h3>
            <div class="video-grid" id="latestVideoGrid"></div>
        </div>
    </div>

    <div class="tab-content" id="tabVideos" style="display:none;">
        <div class="sort-bar">
            <button class="sort-btn active" data-sort="latest">Latest</button>
            <button class="sort-btn" data-sort="popular">Popular</button>
            <button class="sort-btn" data-sort="oldest">Oldest</button>
        </div>
        <div class="video-grid" id="fullVideoGrid"></div>
    </div>

    <div class="tab-content" id="tabLive" style="display:none;">
        <p class="empty-message">No live streams currently.</p>
    </div>
    <div class="tab-content" id="tabAbout" style="display:none;">
        <div class="about-section">
            <h3>About</h3>
            <p>Channel description and stats will appear here.</p>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<script src="js/channel.js"></script>
</body>
</html>