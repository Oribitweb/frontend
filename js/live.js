// live.js – Live Stream Page
(function() {
    const gifEmojiList = window.gifEmojis || [];
    const gifEmojiSet = new Set(gifEmojiList);

    // ===== DOM Elements =====
    const video = document.getElementById('mainVideo');
    const playerWrapper = document.getElementById('playerWrapper');
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn?.querySelector('.play-icon');
    const pauseIcon = playBtn?.querySelector('.pause-icon');
    const volumeBtn = document.getElementById('volumeBtn');
    const volOnIcon = volumeBtn?.querySelector('.vol-on');
    const volOffIcon = volumeBtn?.querySelector('.vol-off');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    const likeBtn = document.getElementById('likeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    const saveBtn = document.getElementById('saveBtn');
    const showDescBtn = document.getElementById('showDescBtn');
    const descPreview = document.getElementById('descPreview');
    const shareBtn = document.getElementById('shareBtn');
    const toastContainer = document.getElementById('toastContainer');
    const unsubscribePopup = document.getElementById('unsubscribePopup');
    const sharePopup = document.getElementById('sharePopup');
    const orbshipPopup = document.getElementById('orbshipPopup');
    const orbshipBtn = document.getElementById('orbshipBtn');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessages = document.getElementById('chatMessages');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiMenu = document.getElementById('emojiMenu');
    const confirmUnsubscribe = document.getElementById('confirmUnsubscribe');
    const shareUrlInput = document.getElementById('shareUrlInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareReddit = document.getElementById('shareReddit');
    const shareCopyBtn = document.getElementById('shareCopyBtn');
    const mutedIndicator = document.getElementById('mutedIndicator');

    // ===== Emoji List =====
    const emojiList = [
        'happy.png', 'sad.png', 'shocked.png', 'like.png', 'dislike.png',
        'thank.png', 'angry.png', 'stupid.png', 'ok.png', 'iran.png',
        '01_Pepe_laugh.webp', '02_Pepe_smile.webp', '03_Pepe_cry.webp',
        '04_Pepe_ostentation.webp', '05_Pepe_sad.webp', '06_Pepe_rage.webp',
        '07_Pepe_suggestive.webp', '09_Pepe_foreveralone.webp', '10_Pepe_cute.webp',
        '11_Pepe_malicious.webp', '13_Pepe_anxious.webp', '15_Pepe_ghost.webp', '16_Pepe_joker.webp',
        '17_Pepe_resistance.webp', '19_Pepe_desolate.webp', '20_Pepe_logan.webp', '21_Pepe_thoughtful.webp'
    ];

    // ===== Video Player =====
    playBtn?.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
    });
    video?.addEventListener('play', () => { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
    video?.addEventListener('pause', () => { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });

    volumeSlider?.addEventListener('input', () => { video.volume = volumeSlider.value; updateVolIcon(); });
    volumeBtn?.addEventListener('click', () => {
        if (video.volume > 0) { video.muted = !video.muted; updateVolIcon(); }
        else { video.muted = false; video.volume = 1; volumeSlider.value = 1; updateVolIcon(); }
    });
    let muteFadeTimeout;
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
    fullscreenBtn?.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else playerWrapper.requestFullscreen();
    });
    mutedIndicator?.addEventListener('click', () => {
        video.muted = false;
        if (video.volume === 0) {
            video.volume = 1;
            volumeSlider.value = 1;
        }
        updateVolIcon();
    });

    // ===== Like =====
    let liked = false;
    likeBtn?.addEventListener('click', () => {
        liked = !liked;
        likeBtn.classList.toggle('liked', liked);
        likeCountSpan.textContent = liked ? '12.4K' : '12.3K';
    });

    // ===== Subscribe & Notification =====
    let subscribed = false;
    let notificationOn = true;
    subscribeBtn?.addEventListener('click', () => {
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
    notificationBellBtn?.addEventListener('click', () => {
        notificationOn = !notificationOn;
        notificationBellBtn.classList.toggle('active', !notificationOn);
        window.showToast(notificationOn ? 'Notifications on' : 'Notifications off');
    });
    confirmUnsubscribe?.addEventListener('click', () => {
        subscribed = false;
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.classList.remove('subscribed');
        notificationBellBtn.style.display = 'none';
        window.closeAllPopups();
        window.showToast('Unsubscribed');
    });

    // ===== Save =====
    let saved = false;
    saveBtn?.addEventListener('click', () => {
        saved = !saved;
        saveBtn.classList.toggle('saved', saved);
        if (saved) window.showToast('Saved to library');
    });

    // ===== Orbship =====
    orbshipBtn?.addEventListener('click', () => window.openPopup(orbshipPopup));
    document.querySelectorAll('.orbship-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.dataset.plan;
            window.showToast(`You selected: ${plan}`);
            window.closeAllPopups();
        });
    });

    // ===== Description Toggle =====
    showDescBtn?.addEventListener('click', () => {
        descPreview.classList.toggle('expanded');
        showDescBtn.textContent = descPreview.classList.contains('expanded') ? 'Show less' : 'Show more';
    });

    // ===== Share =====
    const currentUrl = window.location.href.split('?')[0];
    shareUrlInput.value = currentUrl;
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => window.showToast('Link copied!'));
    }
    shareBtn?.addEventListener('click', () => {
        shareUrlInput.value = currentUrl;
        window.openPopup(sharePopup);
    });
    copyLinkBtn?.addEventListener('click', () => copyToClipboard(shareUrlInput.value));
    shareCopyBtn?.addEventListener('click', () => copyToClipboard(currentUrl));
    shareTwitter?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Live now on ORBIT!')}`, '_blank');
    });
    shareFacebook?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    });
    shareReddit?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}`, '_blank');
    });

    // ===== Chat =====
    function formatChatText(text) {
        return escapeHtml(text).replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
            const gifFilename = name + '.gif';
            if (gifEmojiSet.has(gifFilename)) {
                return `<img class="emoji-inline" src="assets/emoji/gif/${gifFilename}" alt="${name}">`;
            }
            const pngName = name + '.png';
            const webpName = name + '.webp';
            const hasPng = emojiList.includes(pngName);
            const hasWebp = emojiList.includes(webpName);
            if (!hasPng && !hasWebp) return match;
            if (hasPng && hasWebp) {
                return `<picture><source srcset="assets/emoji/${webpName}" type="image/webp"><img class="emoji-inline" src="assets/emoji/${pngName}" alt="${name}"></picture>`;
            } else if (hasWebp) {
                return `<img class="emoji-inline" src="assets/emoji/${webpName}" alt="${name}">`;
            } else {
                return `<img class="emoji-inline" src="assets/emoji/${pngName}" alt="${name}">`;
            }
        });
    }
    function addChatMessage(author, text, verified = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        const formatted = formatChatText(text);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const verifiedBadge = verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>` : '';
        msgDiv.innerHTML = `
            <div class="chat-avatar">${escapeHtml(author[0])}</div>
            <div class="chat-content">
                <div><span class="chat-author">${escapeHtml(author)}${verifiedBadge}</span><span class="chat-time"> ${now}</span></div>
                <div class="chat-text">${formatted}</div>
            </div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        // Assume the streamer is verified
        addChatMessage('You', text, true);
        chatInput.value = '';
    }
    sendMessageBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

    // ===== Emoji Menu =====
    function buildEmojiMenu() {
        emojiMenu.innerHTML = '';
        emojiList.forEach(filename => {
            const img = document.createElement('img');
            img.src = `assets/emoji/${filename}`;
            img.alt = filename.split('.')[0];
            img.title = img.alt;
            img.addEventListener('click', () => {
                chatInput.value += `:${img.alt}:`;
                emojiMenu.classList.remove('active');
                chatInput.focus();
            });
            emojiMenu.appendChild(img);
        });
        gifEmojiList.forEach(filename => {
            const img = document.createElement('img');
            img.src = `assets/emoji/gif/${filename}`;
            img.alt = filename.split('.')[0];
            img.title = img.alt;
            img.addEventListener('click', () => {
                chatInput.value += `:${img.alt}:`;
                emojiMenu.classList.remove('active');
                chatInput.focus();
            });
            emojiMenu.appendChild(img);
        });
    }
    buildEmojiMenu();
    emojiBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!emojiMenu.contains(e.target) && e.target !== emojiBtn) emojiMenu.classList.remove('active');
    });

    // ===== Auto-play video on load (muted) =====
    window.addEventListener('load', () => {
        video.muted = true;
        video.play().catch(() => {});
        updateVolIcon();
    });
})();