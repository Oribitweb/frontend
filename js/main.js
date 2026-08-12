// main.js – Video hover-preview module (shared by any page that renders .video-card elements)
//
// NOTE: this file previously also generated a mock feed and rendered it into
// #videoGrid on load. That's been removed — js/videos-feed.js now owns
// fetching and rendering the real feed from the API. This file only handles
// the "hover a video card for 2s -> play a preview clip" interaction, and
// exposes window.OrbitPreview.attach() so videos-feed.js can re-hook newly
// rendered cards after every fetch (initial load, infinite scroll, category
// switch).
(function () {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    // ===== Video Preview on Hover =====
    const PREVIEW_SRC = 'assets/vid.mp4';
    let currentPreviewCard = null;

    function attachPreviewToVideoCards() {
        const videoCards = document.querySelectorAll('.video-card:not(.video-card--short):not(.video-card--skeleton)');
        videoCards.forEach(card => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
        });
    }

    function handleMouseEnter(e) {
        const card = e.currentTarget;
        if (currentPreviewCard && currentPreviewCard !== card) {
            removePreviewFromCard(currentPreviewCard);
        }
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

        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'video-preview-overlay';

        const video = document.createElement('video');
        video.src = PREVIEW_SRC;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;pointer-events:none;';

        const muteBtn = document.createElement('button');
        muteBtn.className = 'preview-mute-btn';
        muteBtn.type = 'button';
        muteBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

        let isMuted = true;
        muteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isMuted = !isMuted;
            video.muted = isMuted;
            muteBtn.innerHTML = isMuted
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
        });

        previewOverlay.appendChild(video);
        previewOverlay.appendChild(muteBtn);

        thumbnailDiv.appendChild(previewOverlay);
        card._previewOverlay = previewOverlay;
        card._previewVideo = video;

        video.play().catch(e => console.log('Preview autoplay failed', e));
    }

    function removePreviewFromCard(card) {
        if (!card._previewActive) return;
        if (card._previewOverlay && card._previewOverlay.parentNode) {
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

    // Exposed so videos-feed.js can re-attach hover previews after it
    // renders real cards (initial load, infinite scroll, category switch).
    window.OrbitPreview = {
        attach: attachPreviewToVideoCards,
    };
})();