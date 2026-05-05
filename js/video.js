// ===== DOM Elements =====
const html = document.documentElement;
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
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
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const speedLabel = document.querySelector('.speed-label');
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

// ===== Emoji List =====
const emojiList = [
    'happy.png', 'sad.png', 'shocked.png', 'like.png', 'dislike.png',
    'thank.png', 'angry.png', 'stupid.png', 'ok.png', 'iran.png'
];

// ===== Theme =====
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('orbit-theme', theme);
    themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}
setTheme(localStorage.getItem('orbit-theme') || 'dark');
themeToggle.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ===== Sidebar (collapsed default) =====
sidebar.classList.add('sidebar--collapsed');
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('sidebar--collapsed'));

// ===== Show More Channels =====
let channelsExpanded = false;
const hiddenChannels = document.querySelectorAll('.sidebar__channel.hidden-channel');
if (showMoreChannelsBtn) {
    showMoreChannelsBtn.addEventListener('click', () => {
        channelsExpanded = !channelsExpanded;
        hiddenChannels.forEach(ch => ch.style.display = channelsExpanded ? 'flex' : 'none');
        showMoreChannelsBtn.textContent = channelsExpanded ? 'Show less' : 'Show more';
    });
}

// ===== Dropdowns =====
const createBtn = document.getElementById('createBtn');
const createDropdown = document.getElementById('createDropdown');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
createBtn.addEventListener('click', (e) => { e.stopPropagation(); createDropdown.classList.toggle('active'); profileDropdown.classList.remove('active'); });
profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('active'); createDropdown.classList.remove('active'); });
document.addEventListener('click', (e) => {
    if (!createDropdown.contains(e.target)) createDropdown.classList.remove('active');
    if (!profileDropdown.contains(e.target)) profileDropdown.classList.remove('active');
});

// ===== Popup Management =====
function openPopup(p) { p.classList.add('active'); overlay.classList.add('active'); }
function closeAllPopups() { 
    unsubscribePopup.classList.remove('active'); 
    sharePopup.classList.remove('active'); 
    overlay.classList.remove('active'); 
}
overlay.addEventListener('click', closeAllPopups);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeAllPopups()));

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

// Volume
volumeSlider.addEventListener('input', () => { video.volume = volumeSlider.value; updateVolIcon(); });
volumeBtn.addEventListener('click', () => {
    if (video.volume > 0) { video.muted = !video.muted; updateVolIcon(); }
    else { video.muted = false; video.volume = 1; volumeSlider.value = 1; updateVolIcon(); }
});
function updateVolIcon() {
    if (video.muted || video.volume === 0) {
        volOnIcon.style.display = 'none';
        volOffIcon.style.display = 'block';
    } else {
        volOnIcon.style.display = 'block';
        volOffIcon.style.display = 'none';
    }
}

// Speed
speedBtn.addEventListener('click', () => speedMenu.classList.toggle('active'));
speedMenu.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
        video.playbackRate = parseFloat(b.dataset.speed);
        speedLabel.textContent = b.dataset.speed + 'x';
        speedMenu.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        speedMenu.classList.remove('active');
    });
});
document.addEventListener('click', (e) => { if (!speedMenu.contains(e.target) && e.target !== speedBtn) speedMenu.classList.remove('active'); });

// PiP, Theater, Fullscreen
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

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) return;
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            video.paused ? video.play() : video.pause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
            break;
        case 'ArrowUp':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.05);
            volumeSlider.value = video.volume;
            updateVolIcon();
            break;
        case 'ArrowDown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.05);
            volumeSlider.value = video.volume;
            updateVolIcon();
            break;
    }
});

// ===== Like / Dislike =====
let liked = false, disliked = false;
likeBtn.addEventListener('click', () => {
    if (!liked) {
        liked = true;
        disliked = false;
        likeBtn.classList.add('liked');
        dislikeBtn.classList.remove('disliked');
        likeCountSpan.textContent = '124K';
    } else {
        liked = false;
        likeBtn.classList.remove('liked');
        likeCountSpan.textContent = '123K';
    }
});
dislikeBtn.addEventListener('click', () => {
    if (!disliked) {
        disliked = true;
        liked = false;
        dislikeBtn.classList.add('disliked');
        likeBtn.classList.remove('liked');
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
        showToast('Subscribed! 🎉');
    } else {
        openPopup(unsubscribePopup);
    }
});

notificationBellBtn.addEventListener('click', () => {
    notificationOn = !notificationOn;
    if (notificationOn) {
        notificationBellBtn.classList.remove('active');
        showToast('Notifications turned on');
    } else {
        notificationBellBtn.classList.add('active');
        showToast('Notifications turned off');
    }
});

document.getElementById('confirmUnsubscribe').addEventListener('click', () => {
    subscribed = false;
    subscribeBtn.textContent = 'Subscribe';
    subscribeBtn.classList.remove('subscribed');
    notificationBellBtn.style.display = 'none';
    closeAllPopups();
    showToast('Unsubscribed');
});

// ===== Save Button =====
let saved = false;
saveBtn.addEventListener('click', () => {
    if (!saved) {
        saved = true;
        saveBtn.classList.add('saved');
        showToast('Saved to library');
    } else {
        saved = false;
        saveBtn.classList.remove('saved');
    }
});

// ===== Share =====
const currentUrl = window.location.href.split('?')[0];
shareUrlInput.value = currentUrl;

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Link copied!'));
}

shareBtn.addEventListener('click', () => {
    shareUrlInput.value = currentUrl;
    openPopup(sharePopup);
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

// ===== Ad Banner Close (no persistence – reappears on refresh) =====
adCloseBtn.addEventListener('click', () => {
    adBannerContainer.style.display = 'none';
    showToast('Ad closed');
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

// ===== Emoji Replacement Function =====
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
        showToast('Comment too long (max 400 characters)');
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

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}