// main.js – Home page feed with video preview on hover
(function() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    // ===== Helper functions to generate feed data =====
    function generateLongVideo(num, isTrend = false) {
        return {
            type: 'video',
            title: `Video Title ${num}`,
            channel: `Channel Name ${num}`,
            views: '0',
            time: 'Now',
            duration: '10:00',
            isTrend
        };
    }

    function generateShort(num) {
        return {
            type: 'short',
            title: `Short ${num}`,
            channel: `Channel Name ${num}`,
            views: '0'
        };
    }

    function generatePost(num) {
        return {
            type: 'post',
            author: `Channel Name ${num}`,
            time: 'Now',
            content: `Community post content #${num}.`,
            image: null
        };
    }

    // ===== Build sample feed =====
    const feedData = [];

    feedData.push(generateLongVideo(1, true));
    for (let i = 2; i <= 5; i++) feedData.push(generateLongVideo(i));
    for (let i = 6; i <= 10; i++) feedData.push(generateLongVideo(i));
    for (let i = 1; i <= 5; i++) feedData.push(generateShort(i));
    for (let i = 1; i <= 5; i++) feedData.push(generatePost(i));
    for (let i = 11; i <= 25; i++) feedData.push(generateLongVideo(i));

    // ===== Render feed =====
    function renderFeed() {
        videoGrid.innerHTML = feedData.map(item => {
            if (item.type === 'video') {
                const trendClass = item.isTrend ? ' video-card--trend' : '';
                const trendBadge = item.isTrend ? '<span class="trend-badge">Most Trend</span>' : '';
                return `<article class="video-card${trendClass}" data-video-preview="true">
                    <div class="video-card__thumbnail">
                        <div style="background:linear-gradient(135deg,#1a2a3a,#0f3a2b);height:100%"></div>
                        ${trendBadge}
                        <span class="video-card__duration">${item.duration}</span>
                    </div>
                    <div class="video-card__info">
                        <div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div>
                        <div class="video-card__text">
                            <h3>${escapeHtml(item.title)}</h3>
                            <p>${escapeHtml(item.channel)}</p>
                            <p>${escapeHtml(item.views)} views · ${escapeHtml(item.time)}</p>
                        </div>
                    </div>
                </article>`;
            } else if (item.type === 'short') {
                return `<article class="video-card video-card--short">
                    <div class="video-card__thumbnail">
                        <div style="background:linear-gradient(135deg,#2a1a3a,#0f2a2b);height:100%"></div>
                    </div>
                    <div class="video-card__info">
                        <div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div>
                        <div class="video-card__text">
                            <h3>${escapeHtml(item.title)}</h3>
                            <p>${escapeHtml(item.channel)}</p>
                            <p>${escapeHtml(item.views)} views</p>
                        </div>
                    </div>
                </article>`;
            } else {
                return `<article class="post-card">
                    <div class="post-card__header">
                        <div class="post-card__avatar">${escapeHtml(item.author.charAt(0))}</div>
                        <div>
                            <div class="post-card__author">${escapeHtml(item.author)}</div>
                            <div class="post-card__time">${escapeHtml(item.time)}</div>
                        </div>
                    </div>
                    <div class="post-card__content">${escapeHtml(item.content)}</div>
                </article>`;
            }
        }).join('');

        // Attach preview behaviour to all video cards (skip short videos)
        attachPreviewToVideoCards();
    }

    // ===== Video Preview on Hover (after 2 seconds) =====
    const PREVIEW_SRC = 'assets/vid.mp4';
    let activeTimeout = null;
    let currentPreviewCard = null;

    function attachPreviewToVideoCards() {
        const videoCards = document.querySelectorAll('.video-card:not(.video-card--short)');
        videoCards.forEach(card => {
            // Remove any existing listeners to avoid duplicates
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
        });
    }

    function handleMouseEnter(e) {
        const card = e.currentTarget;
        // If preview is already showing on another card, remove it first
        if (currentPreviewCard && currentPreviewCard !== card) {
            removePreviewFromCard(currentPreviewCard);
        }
        // Clear any pending timeout on this card
        if (card._previewTimeout) clearTimeout(card._previewTimeout);
        card._previewTimeout = setTimeout(() => {
            showPreviewOnCard(card);
        }, 2000);
    }

    function handleMouseLeave(e) {
        const card = e.currentTarget;
        if (card._previewTimeout) {
            clearTimeout(card._previewTimeout);
            card._previewTimeout = null;
        }
        removePreviewFromCard(card);
    }

    function showPreviewOnCard(card) {
        if (card._previewActive) return;
        card._previewActive = true;
        currentPreviewCard = card;

        const thumbnailDiv = card.querySelector('.video-card__thumbnail');
        if (!thumbnailDiv) return;

        // Create preview container
        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'video-preview-overlay';
        previewOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10;
            border-radius: 12px;
            overflow: hidden;
        `;

        // Create video element
        const video = document.createElement('video');
        video.src = PREVIEW_SRC;
        video.muted = true;          // default muted
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;    // allow clicks to pass through to the card
        `;

        // Create mute/unmute button
        const muteBtn = document.createElement('button');
        muteBtn.className = 'preview-mute-btn';
        muteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5L6 9H2v6h4l5 4z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
        `;
        muteBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.6);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            z-index: 15;
            backdrop-filter: blur(4px);
            transition: background 0.2s;
        `;
        muteBtn.addEventListener('mouseenter', () => muteBtn.style.background = 'rgba(0,0,0,0.8)');
        muteBtn.addEventListener('mouseleave', () => muteBtn.style.background = 'rgba(0,0,0,0.6)');
        
        let isMuted = true;
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            video.muted = isMuted;
            // Update icon
            if (isMuted) {
                muteBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4z"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>`;
            } else {
                muteBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>`;
            }
        });

        previewOverlay.appendChild(video);
        previewOverlay.appendChild(muteBtn);
        
        // Store reference to remove later
        thumbnailDiv.style.position = 'relative';
        thumbnailDiv.appendChild(previewOverlay);
        card._previewOverlay = previewOverlay;
        card._previewVideo = video;
        
        // Ensure video plays (browsers may block autoplay with sound, but muted is allowed)
        video.play().catch(e => console.log('Preview autoplay failed', e));
    }

    function removePreviewFromCard(card) {
        if (!card._previewActive) return;
        if (card._previewOverlay && card._previewOverlay.parentNode) {
            // Stop video
            if (card._previewVideo) {
                card._previewVideo.pause();
                card._previewVideo.src = '';
            }
            card._previewOverlay.remove();
        }
        card._previewActive = false;
        card._previewOverlay = null;
        card._previewVideo = null;
        if (currentPreviewCard === card) currentPreviewCard = null;
    }

    // ===== Category Pills =====
    function initCategoryPills() {
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', function () {
                document.querySelector('.category-pill--active')?.classList.remove('category-pill--active');
                this.classList.add('category-pill--active');
                // Optional: filter videos here if needed
            });
        });
    }

    renderFeed();
    initCategoryPills();
})();