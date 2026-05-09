<?php
$pageTitle = "ORBIT — Watch Video";
$extraCSS = '<link rel="stylesheet" href="css/video.css">';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="watch-grid" id="watchGrid">
    <div class="watch-primary">
        <div class="video-player" id="videoPlayerContainer">
            <div class="ambient-canvas-container">
                <canvas id="ambientCanvas" class="ambient-canvas"></canvas>
            </div>
            <div class="player-wrapper" id="playerWrapper">
                <div class="muted-indicator" id="mutedIndicator">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                        <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Muted</span>
                </div>
                <div class="video-title-overlay" id="videoTitleOverlay">Sample Video Title</div>
                <video id="mainVideo" class="main-video" poster="assets/thumbnail.png" preload="metadata">
                    <source src="assets/vid.mp4" type="video/mp4">
                </video>
                <div class="custom-controls" id="customControls">
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-hover-time" id="progressHoverTime">0:00</div>
                        <div class="progress-track" id="progressTrack">
                            <div class="progress-loaded" id="progressLoaded"></div>
                            <div class="progress-current" id="progressCurrent"></div>
                            <div class="progress-thumb" id="progressThumb"></div>
                        </div>
                    </div>
                    <div class="controls-row">
                        <div class="left-controls">
                            <button class="control-btn" id="playBtn" aria-label="Play/Pause">
                                <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <svg class="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            </button>
                            <button class="control-btn" id="prevBtn" aria-label="Previous">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="4" height="12"/><polygon points="22 6 6 12 22 18"/></svg>
                            </button>
                            <button class="control-btn" id="nextBtn" aria-label="Next">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="18" y="6" width="4" height="12"/><polygon points="2 6 18 12 2 18"/></svg>
                            </button>
                            <div class="volume-group">
                                <button class="control-btn" id="volumeBtn" aria-label="Volume">
                                    <svg class="vol-on" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                                    <svg class="vol-off" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                                </button>
                                <div class="volume-slider-container">
                                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.05" value="1">
                                </div>
                            </div>
                            <span class="time-display" id="timeDisplay">0:00 / 0:00</span>
                        </div>
                        <div class="right-controls">
                            <button class="control-btn" id="speedBtn"><span class="speed-label">1x</span></button>
                            <button class="control-btn" id="pipBtn" aria-label="Picture in Picture">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="8" y="8" width="8" height="6" rx="1"/></svg>
                            </button>
                            <button class="control-btn" id="theaterBtn" aria-label="Theater Mode">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="4"/><rect x="2" y="10" width="20" height="10"/></svg>
                            </button>
                            <button class="control-btn" id="fullscreenBtn" aria-label="Fullscreen">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="speed-menu" id="speedMenu">
                        <button data-speed="0.5">0.5x</button><button data-speed="0.75">0.75x</button>
                        <button data-speed="1" class="active">1x</button><button data-speed="1.25">1.25x</button>
                        <button data-speed="1.5">1.5x</button><button data-speed="2">2x</button>
                    </div>
                </div>
            </div>
        </div>

        <h1 class="video-title">Sample Video Title - ORBIT Platform</h1>
        <div class="video-meta">
            <span class="video-views">1.2M views</span>
            <span class="video-upload-time">2 days ago</span>
        </div>

        <div class="video-actions">
            <div class="channel-info">
                <div class="channel-avatar">CN</div>
                <div class="channel-text">
                    <span class="channel-name">Channel Name</span>
                    <span class="channel-subs">123K subscribers</span>
                </div>
                <button class="subscribe-btn" id="subscribeBtn">Subscribe</button>
                <button class="notification-bell-btn" id="notificationBellBtn" title="Get notified" style="display: none;">
                    <svg class="bell-on" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 13.18V10a6 6 0 0 0-5-5.91V3a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 10v3.18A3 3 0 0 0 4 16v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a3 3 0 0 0-2-2.82zM12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/></svg>
                    <svg class="bell-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8v7"/><path d="M18 8a6 6 0 0 0-9.33-5"/><path d="M4 17H2"/><path d="M22 17h-2"/><path d="M17 2l5 5"/><path d="M2 2l20 20"/></svg>
                </button>
            </div>
            <div class="action-buttons">
                <button class="action-btn like-btn" id="likeBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    <span id="likeCount">123K</span>
                </button>
                <button class="action-btn dislike-btn" id="dislikeBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                </button>
                <button class="action-btn share-btn" id="shareBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    Share
                </button>
                <button class="action-btn save-btn" id="saveBtn">
                    <svg class="save-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <svg class="save-icon-filled" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="display:none;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    Save
                </button>
            </div>
        </div>

        <div class="video-description">
            <div class="desc-preview" id="descPreview">
                <p>This is a sample video description. #ORBIT #Space #VideoPlatform</p>
            </div>
            <button class="show-more-btn" id="showDescBtn">Show more</button>
        </div>

        <div class="comments-section">
            <div class="comments-header">
                <h2>Comments <span class="comment-count">245</span></h2>
                <div class="sort-container">
                    <button class="sort-btn" id="sortBtn">Sort by: <span id="sortLabel">Top comments</span></button>
                    <div class="sort-dropdown" id="sortDropdown">
                        <button data-sort="top">Top comments</button>
                        <button data-sort="newest">Newest first</button>
                    </div>
                </div>
            </div>
            <div class="add-comment">
                <div class="user-avatar">U</div>
                <div class="comment-input-wrapper">
                    <input type="text" class="comment-input" id="commentInput" placeholder="Add a comment..." maxlength="400">
                    <button class="emoji-btn" id="emojiBtn" aria-label="Emoji">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    </button>
                    <button class="send-btn" id="sendCommentBtn" aria-label="Send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-12z"/></svg>
                    </button>
                </div>
                <span class="char-counter" id="charCounter">0 / 400</span>
                <div class="emoji-menu" id="emojiMenu"></div>
            </div>
            <div class="comment-list" id="commentList">
                <div class="comment" data-comment-id="1">
                    <div class="comment-avatar">A</div>
                    <div class="comment-body">
                        <div class="comment-author">User One <span class="comment-time">1 day ago</span></div>
                        <p>Great video! Keep it up.</p>
                        <div class="comment-actions-row">
                            <button class="comment-action-btn like-comment-btn">👍 <span>12</span></button>
                            <button class="comment-action-btn">👎</button>
                            <button class="comment-action-btn reply-toggle-btn">Reply</button>
                        </div>
                        <div class="reply-form" style="display:none;">
                            <input type="text" class="reply-input" placeholder="Write a reply..." maxlength="400">
                            <button class="reply-send-btn">Reply</button>
                        </div>
                        <div class="reply-list"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="watch-secondary">
        <div class="ad-banner-container" id="adBannerContainer">
            <a href="#" target="_blank" rel="nofollow sponsored">
                <img src="assets/ad.png" alt="Advertisement" class="ad-banner-img">
            </a>
            <button class="ad-close-btn" id="adCloseBtn" aria-label="Close ad">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        <div class="related-videos">
            <h3>Related Videos</h3>
            <div class="related-list" id="relatedList"></div>
        </div>
    </div>
</main>

<!-- UNSUBSCRIBE POPUP -->
<div class="popup" id="unsubscribePopup" role="dialog" aria-modal="true">
    <div class="popup__panel popup__panel--small">
        <button class="popup__close" data-close="unsubscribePopup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 class="popup__title">Unsubscribe?</h2>
        <p class="popup__subtitle">Are you sure you want to unsubscribe from Channel Name?</p>
        <div class="popup__form" style="gap:12px;">
            <button class="btn btn--primary btn--full" id="confirmUnsubscribe">Unsubscribe</button>
            <button class="btn btn--text btn--full" data-close="unsubscribePopup">Cancel</button>
        </div>
    </div>
</div>

<!-- SHARE POPUP -->
<div class="popup" id="sharePopup" role="dialog" aria-modal="true">
    <div class="popup__panel popup__panel--small">
        <button class="popup__close" data-close="sharePopup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 class="popup__title">Share Video</h2>
        <div class="share-url-box">
            <input type="text" id="shareUrlInput" readonly class="share-url-input" value="">
            <button id="copyLinkBtn" class="btn btn--primary" style="padding: 8px 16px; font-size: 0.85rem;">Copy Link</button>
        </div>
        <div class="share-socials">
            <a href="#" id="shareTwitter" target="_blank" class="share-social-btn twitter" title="Share on Twitter">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" id="shareFacebook" target="_blank" class="share-social-btn facebook" title="Share on Facebook">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" id="shareReddit" target="_blank" class="share-social-btn reddit" title="Share on Reddit">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M16.5 8.5a2.5 2.5 0 1 1 4 2.5 2.5 2.5 0 0 1-4-2.5z"/><path d="M7.5 8.5a2.5 2.5 0 1 0-4 2.5 2.5 2.5 0 0 0 4-2.5z"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8.5 14a3.5 3.5 0 0 0 7 0"/></svg>
            </a>
            <button id="shareCopyBtn" class="share-social-btn copy" title="Copy Link" style="background: none; border: none; cursor: pointer;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
<script src="js/video.js"></script>
</body>
</html>