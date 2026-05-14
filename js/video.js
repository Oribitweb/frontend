// video.js – Watch Page (with Settings Menu: Speed + Quality, no standalone speed button)
(function() {
    const video = document.getElementById('mainVideo');
    const playerWrapper = document.getElementById('playerWrapper');
    const ambientCanvas = document.getElementById('ambientCanvas');
    const ambientCtx = ambientCanvas.getContext('2d');
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    const progressTrack = document.getElementById('progressTrack');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressLoaded = document.getElementById('progressLoaded');
    const progressThumb = document.getElementById('progressThumb');
    const progressHoverTime = document.getElementById('progressHoverTime');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeBtn = document.getElementById('volumeBtn');
    const volOnIcon = volumeBtn.querySelector('.vol-on');
    const volOffIcon = volumeBtn.querySelector('.vol-off');
    const volumeSlider = document.getElementById('volumeSlider');
    const pipBtn = document.getElementById('pipBtn');
    const theaterBtn = document.getElementById('theaterBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    const showDescBtn = document.getElementById('showDescBtn');
    const descPreview = document.getElementById('descPreview');
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortLabel = document.getElementById('sortLabel');
    const relatedList = document.getElementById('relatedList');
    const toastContainer = document.getElementById('toastContainer');
    const unsubscribePopup = document.getElementById('unsubscribePopup');
    const sharePopup = document.getElementById('sharePopup');
    const commentInput = document.getElementById('commentInput');
    const sendCommentBtn = document.getElementById('sendCommentBtn');
    const commentList = document.getElementById('commentList');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiMenu = document.getElementById('emojiMenu');
    const charCounter = document.getElementById('charCounter');
    const shareBtn = document.getElementById('shareBtn');
    const saveBtn = document.getElementById('saveBtn');
    const adBannerContainer = document.getElementById('adBannerContainer');
    const adCloseBtn = document.getElementById('adCloseBtn');
    const shareUrlInput = document.getElementById('shareUrlInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareReddit = document.getElementById('shareReddit');
    const shareCopyBtn = document.getElementById('shareCopyBtn');
    const mutedIndicator = document.getElementById('mutedIndicator');

    // ===== Settings Menu Elements =====
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    let currentQuality = '1080p';

    // Quality mapping
    const qualitySources = {
        '8K': 'assets/vid_8k.mp4',
        '4K': 'assets/vid_4k.mp4',
        '2K': 'assets/vid_2k.mp4',
        '1080p': 'assets/vid_1080p.mp4',
        '720p': 'assets/vid_720p.mp4',
        '480p': 'assets/vid_480p.mp4',
        '360p': 'assets/vid_360p.mp4',
        '240p': 'assets/vid_240p.mp4'
    };
    const originalSrc = video.querySelector('source')?.src || video.src || 'assets/vid.mp4';

    // Emoji list
    const emojiList = ['happy.png', 'sad.png', 'shocked.png', 'like.png', 'dislike.png', 'thank.png', 'angry.png', 'stupid.png', 'ok.png', 'iran.png'];

    // ===== Ambient Light =====
    function drawAmbient() {
        if (!video.paused) {
            ambientCtx.drawImage(video, 0, 0, ambientCanvas.width, ambientCanvas.height);
            requestAnimationFrame(drawAmbient);
        }
    }
    video.addEventListener('play', () => {
        ambientCanvas.width = video.videoWidth / 4;
        ambientCanvas.height = video.videoHeight / 4;
        drawAmbient();
    });
    video.addEventListener('pause', () => ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height));

    // ===== Player Controls =====
    function formatTime(s) { const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; }
    function updateProgress() {
        if (video.duration) {
            const pct = (video.currentTime / video.duration) * 100;
            progressCurrent.style.width = pct + '%';
            progressThumb.style.left = pct + '%';
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    }
    playBtn.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
    });
    video.addEventListener('play', () => { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
    video.addEventListener('pause', () => { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });
    video.addEventListener('timeupdate', () => {
        updateProgress();
        if (video.buffered.length)
            progressLoaded.style.width = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100 + '%';
    });
    progressTrack.addEventListener('click', (e) => {
        const rect = progressTrack.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });
    progressTrack.addEventListener('mousemove', (e) => {
        const rect = progressTrack.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        progressHoverTime.style.left = (e.clientX - rect.left) + 'px';
        progressHoverTime.textContent = formatTime(pos * video.duration);
        progressHoverTime.style.display = 'block';
    });
    progressTrack.addEventListener('mouseleave', () => (progressHoverTime.style.display = 'none'));

    volumeSlider.addEventListener('input', () => { video.volume = volumeSlider.value; updateVolIcon(); });
    volumeBtn.addEventListener('click', () => {
        if (video.volume > 0) { video.muted = !video.muted; updateVolIcon(); }
        else { video.muted = false; video.volume = 1; volumeSlider.value = 1; updateVolIcon(); }
    });
    let muteFadeTimeout;
    function updateVolIcon() {
        if (video.muted || video.volume === 0) {
            volOnIcon.style.display = 'none';
            volOffIcon.style.display = 'block';
        } else {
            volOnIcon.style.display = 'block';
            volOffIcon.style.display = 'none';
        }
        updateMuteIndicator();
    }
    function updateMuteIndicator() {
        clearTimeout(muteFadeTimeout);
        mutedIndicator.classList.remove('fade-out');
        if (video.muted) {
            mutedIndicator.style.display = 'flex';
            mutedIndicator.style.opacity = '1';
        } else {
            mutedIndicator.classList.add('fade-out');
            muteFadeTimeout = setTimeout(() => {
                mutedIndicator.style.display = 'none';
                mutedIndicator.classList.remove('fade-out');
                mutedIndicator.style.opacity = '1';
            }, 400);
        }
    }
    mutedIndicator.addEventListener('click', () => {
        video.muted = false;
        if (video.volume === 0) {
            video.volume = 1;
            volumeSlider.value = 1;
        }
        updateVolIcon();
    });

    pipBtn.addEventListener('click', async () => {
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
        } catch (e) {}
    });
    theaterBtn.addEventListener('click', () => playerWrapper.classList.toggle('theater'));
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else playerWrapper.requestFullscreen();
    });

    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) return;
        switch (e.code) {
            case 'Space': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
            case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 5); break;
            case 'ArrowLeft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); break;
            case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.05); volumeSlider.value = video.volume; updateVolIcon(); break;
            case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.05); volumeSlider.value = video.volume; updateVolIcon(); break;
        }
    });

    // ===== Like / Dislike =====
    let liked = false, disliked = false;
    likeBtn.addEventListener('click', () => {
        if (!liked) {
            liked = true; disliked = false;
            likeBtn.classList.add('liked'); dislikeBtn.classList.remove('disliked');
            likeCountSpan.textContent = '124K';
        } else {
            liked = false;
            likeBtn.classList.remove('liked');
            likeCountSpan.textContent = '123K';
        }
    });
    dislikeBtn.addEventListener('click', () => {
        if (!disliked) {
            disliked = true; liked = false;
            dislikeBtn.classList.add('disliked'); likeBtn.classList.remove('liked');
            likeCountSpan.textContent = '122K';
        } else {
            disliked = false;
            dislikeBtn.classList.remove('disliked');
            likeCountSpan.textContent = '123K';
        }
    });

    // ===== Subscribe & Notification =====
    let subscribed = false;
    let notificationOn = true;
    subscribeBtn.addEventListener('click', () => {
        if (!subscribed) {
            subscribed = true;
            subscribeBtn.textContent = 'Subscribed';
            subscribeBtn.classList.add('subscribed');
            notificationBellBtn.style.display = 'flex';
            notificationOn = true;
            notificationBellBtn.classList.remove('active');
            window.showToast('Subscribed! 🎉');
        } else {
            window.openPopup(unsubscribePopup);
        }
    });
    notificationBellBtn.addEventListener('click', () => {
        notificationOn = !notificationOn;
        if (notificationOn) {
            notificationBellBtn.classList.remove('active');
            window.showToast('Notifications turned on');
        } else {
            notificationBellBtn.classList.add('active');
            window.showToast('Notifications turned off');
        }
    });
    document.getElementById('confirmUnsubscribe').addEventListener('click', () => {
        subscribed = false;
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.classList.remove('subscribed');
        notificationBellBtn.style.display = 'none';
        window.closeAllPopups();
        window.showToast('Unsubscribed');
    });

    // ===== Save Button =====
    let saved = false;
    saveBtn.addEventListener('click', () => {
        if (!saved) {
            saved = true;
            saveBtn.classList.add('saved');
            window.showToast('Saved to library');
        } else {
            saved = false;
            saveBtn.classList.remove('saved');
        }
    });

    // ===== Share =====
    const currentUrl = window.location.href.split('?')[0];
    shareUrlInput.value = currentUrl;
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => window.showToast('Link copied!'));
    }
    shareBtn.addEventListener('click', () => {
        shareUrlInput.value = currentUrl;
        window.openPopup(sharePopup);
    });
    copyLinkBtn.addEventListener('click', () => copyToClipboard(shareUrlInput.value));
    shareCopyBtn.addEventListener('click', () => copyToClipboard(currentUrl));
    shareTwitter.addEventListener('click', (e) => {
        e.preventDefault();
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Check this video!')}`;
        window.open(twitterUrl, '_blank');
    });
    shareFacebook.addEventListener('click', (e) => {
        e.preventDefault();
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        window.open(fbUrl, '_blank');
    });
    shareReddit.addEventListener('click', (e) => {
        e.preventDefault();
        const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}`;
        window.open(redditUrl, '_blank');
    });

    // ===== Ad Banner Close =====
    adCloseBtn.addEventListener('click', () => {
        adBannerContainer.style.display = 'none';
        window.showToast('Ad closed');
    });

    // ===== Description Toggle =====
    showDescBtn.addEventListener('click', () => {
        descPreview.classList.toggle('expanded');
        showDescBtn.textContent = descPreview.classList.contains('expanded') ? 'Show less' : 'Show more';
    });

    // ===== Hashtag Highlighting =====
    function highlightHashtags(el) {
        if (!el) return;
        el.innerHTML = el.innerText.replace(/#[\w\u0600-\u06FF]+/g, m => `<span class="hashtag">${m}</span>`);
    }
    highlightHashtags(descPreview);

    // ===== Sort =====
    sortBtn.addEventListener('click', () => sortDropdown.classList.toggle('active'));
    sortDropdown.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            sortLabel.textContent = b.dataset.sort === 'top' ? 'Top comments' : 'Newest first';
            sortDropdown.classList.remove('active');
        });
    });
    document.addEventListener('click', (e) => { if (!sortDropdown.contains(e.target) && e.target !== sortBtn) sortDropdown.classList.remove('active'); });

    // ===== Emoji Replacement =====
    function replaceEmojis(text) {
        return text.replace(/:([a-zA-Z]+):/g, (match, name) => {
            const filename = name + '.png';
            if (emojiList.includes(filename)) {
                return `<img src="assets/emoji/${filename}" alt="${name}" class="emoji-inline">`;
            }
            return match;
        });
    }

    // ===== Comment Character Counter =====
    commentInput.addEventListener('input', () => {
        const len = commentInput.value.length;
        charCounter.textContent = `${len} / 400`;
        if (len >= 400) charCounter.style.color = '#ff4444';
        else charCounter.style.color = 'var(--text-secondary)';
    });

    // ===== Emoji Menu =====
    emojiList.forEach(filename => {
        const img = document.createElement('img');
        img.src = `assets/emoji/${filename}`;
        img.alt = filename.split('.')[0];
        img.title = img.alt;
        img.addEventListener('click', () => {
            commentInput.value += `:${img.alt}:`;
            emojiMenu.classList.remove('active');
            commentInput.dispatchEvent(new Event('input'));
            commentInput.focus();
        });
        emojiMenu.appendChild(img);
    });
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!emojiMenu.contains(e.target) && e.target !== emojiBtn) emojiMenu.classList.remove('active');
    });

    // ===== Send Comment =====
    sendCommentBtn.addEventListener('click', sendComment);
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendComment();
        }
    });
    function sendComment() {
        const text = commentInput.value.trim();
        if (!text) return;
        if (text.length > 400) {
            window.showToast('Comment too long (max 400 characters)');
            return;
        }
        addComment('You', 'Just now', text);
        commentInput.value = '';
        commentInput.dispatchEvent(new Event('input'));
    }
    function addComment(author, time, text) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.setAttribute('data-comment-id', Date.now());
        const formattedText = replaceEmojis(text);
        div.innerHTML = `
            <div class="comment-avatar">${author[0]}</div>
            <div class="comment-body">
                <div class="comment-author">${author} <span class="comment-time">${time}</span></div>
                <p>${formattedText}</p>
                <div class="comment-actions-row">
                    <button class="comment-action-btn like-comment-btn">👍 <span>0</span></button>
                    <button class="comment-action-btn">👎</button>
                    <button class="comment-action-btn reply-toggle-btn">Reply</button>
                </div>
                <div class="reply-form" style="display:none;">
                    <input type="text" class="reply-input" placeholder="Write a reply..." maxlength="400">
                    <button class="reply-send-btn">Reply</button>
                </div>
                <div class="reply-list"></div>
            </div>
        `;
        commentList.prepend(div);
        attachCommentListeners(div);
    }
    function attachCommentListeners(commentEl) {
        const toggleBtn = commentEl.querySelector('.reply-toggle-btn');
        const replyForm = commentEl.querySelector('.reply-form');
        const replyInput = commentEl.querySelector('.reply-input');
        const replySendBtn = commentEl.querySelector('.reply-send-btn');
        const replyList = commentEl.querySelector('.reply-list');

        toggleBtn.addEventListener('click', () => {
            replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
        });
        const sendReply = () => {
            const replyText = replyInput.value.trim();
            if (replyText) {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'comment';
                replyDiv.style.marginLeft = '20px';
                replyDiv.innerHTML = `
                    <div class="comment-avatar">U</div>
                    <div class="comment-body">
                        <div class="comment-author">You <span class="comment-time">Just now</span></div>
                        <p>${replaceEmojis(replyText)}</p>
                    </div>
                `;
                replyList.appendChild(replyDiv);
                replyInput.value = '';
                replyForm.style.display = 'none';
            }
        };
        replySendBtn.addEventListener('click', sendReply);
        replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendReply();
        });
    }
    document.querySelectorAll('.comment').forEach(c => attachCommentListeners(c));

    // ===== Related Videos =====
    const relatedVideosData = Array.from({ length: 10 }, (_, i) => ({
        title: `Related Video ${i + 1}`,
        channel: `Channel ${i + 1}`,
        views: `${Math.floor(Math.random() * 500) + 10}K`,
        time: `${Math.floor(Math.random() * 4) + 1} days ago`
    }));
    function renderRelated() {
        relatedList.innerHTML = relatedVideosData.map(v => `
            <div class="related-card">
                <div class="related-thumb" style="background-image:url(assets/thumbnail.png)"></div>
                <div class="related-info">
                    <div class="title">${v.title}</div>
                    <div class="meta">${v.channel}</div>
                    <div class="meta">${v.views} views · ${v.time}</div>
                </div>
            </div>
        `).join('');
    }
    renderRelated();

    // ========== SETTINGS MENU FUNCTIONALITY ==========
    // Change video quality
    function changeQuality(quality) {
        if (!qualitySources[quality]) {
            window.showToast(`Quality file for ${quality} not found. Using default.`);
            return;
        }
        const wasPlaying = !video.paused;
        const currentTime = video.currentTime;
        const newSrc = qualitySources[quality];
        
        video.src = newSrc;
        video.load();
        video.currentTime = currentTime;
        if (wasPlaying) {
            video.play().catch(e => console.log('Auto-play after quality change prevented', e));
        }
        currentQuality = quality;
        
        // Update active class on quality buttons
        document.querySelectorAll('.settings-quality-buttons button').forEach(btn => {
            if (btn.dataset.quality === quality) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        window.showToast(`Quality changed to ${quality}`);
    }

    // Update active speed button in settings menu
    function updateSettingsSpeedActive(speed) {
        const settingsSpeedBtns = document.querySelectorAll('.settings-speed-buttons button');
        settingsSpeedBtns.forEach(btn => {
            if (parseFloat(btn.dataset.speed) === speed) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    // Initialize quality buttons
    function initQualityButtons() {
        const qualityBtns = document.querySelectorAll('.settings-quality-buttons button');
        qualityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const quality = btn.dataset.quality;
                changeQuality(quality);
                settingsMenu.classList.remove('active');
            });
        });
        // Set initial active based on currentQuality
        qualityBtns.forEach(btn => {
            if (btn.dataset.quality === currentQuality) btn.classList.add('active');
        });
    }

    // Initialize settings speed buttons
    function initSettingsSpeedButtons() {
        const settingsSpeedBtns = document.querySelectorAll('.settings-speed-buttons button');
        settingsSpeedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = parseFloat(btn.dataset.speed);
                video.playbackRate = speed;
                // Update active in settings
                settingsSpeedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                settingsMenu.classList.remove('active');
            });
        });
        // Sync initial active with current speed (default 1)
        const currentSpeed = video.playbackRate;
        settingsSpeedBtns.forEach(btn => {
            if (parseFloat(btn.dataset.speed) === currentSpeed) btn.classList.add('active');
        });
    }

    // Toggle settings menu
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('active');
        });
    }
    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
        if (settingsMenu && !settingsMenu.contains(e.target) && e.target !== settingsBtn) {
            settingsMenu.classList.remove('active');
        }
    });

    // Detect current quality from video src (if different from default)
    function detectCurrentQualityFromSrc() {
        const currentSrc = video.currentSrc || video.src;
        for (const [quality, src] of Object.entries(qualitySources)) {
            if (currentSrc.includes(src) || currentSrc === src) {
                currentQuality = quality;
                const qualityBtns = document.querySelectorAll('.settings-quality-buttons button');
                qualityBtns.forEach(btn => {
                    if (btn.dataset.quality === quality) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                break;
            }
        }
    }
    detectCurrentQualityFromSrc();

    // Initialize all settings components
    if (settingsMenu) {
        initQualityButtons();
        initSettingsSpeedButtons();
    }
})();