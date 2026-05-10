// ===== متغیرهای سراسری =====
let gifEmojiList = window.gifEmojis || [];
const gifEmojiSet = new Set(gifEmojiList);

// ===== DOM Elements =====
const html = document.documentElement;
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
const video = document.getElementById('mainVideo');
const playerWrapper = document.getElementById('playerWrapper');
const playBtn = document.getElementById('playBtn');
const playIcon = playBtn.querySelector('.play-icon');
const pauseIcon = playBtn.querySelector('.pause-icon');
const volumeBtn = document.getElementById('volumeBtn');
const volOnIcon = volumeBtn.querySelector('.vol-on');
const volOffIcon = volumeBtn.querySelector('.vol-off');
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

// ===== Emoji List (PNG/WEBP ثابت) =====
const emojiList = [
    'happy.png', 'sad.png', 'shocked.png', 'like.png', 'dislike.png',
    'thank.png', 'angry.png', 'stupid.png', 'ok.png', 'iran.png',
    '01_Pepe_laugh.webp', '02_Pepe_smile.webp', '03_Pepe_cry.webp',
    '04_Pepe_ostentation.webp', '05_Pepe_sad.webp', '06_Pepe_rage.webp',
    '07_Pepe_suggestive.webp', '09_Pepe_foreveralone.webp', '10_Pepe_cute.webp',
    '11_Pepe_malicious.webp', '13_Pepe_anxious.webp', '15_Pepe_ghost.webp', '16_Pepe_joker.webp',
    '17_Pepe_resistance.webp', '19_Pepe_desolate.webp', '20_Pepe_logan.webp', '21_Pepe_thoughtful.webp'
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

// ===== Sidebar =====
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
    orbshipPopup.classList.remove('active');
    overlay.classList.remove('active');
}
overlay.addEventListener('click', closeAllPopups);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeAllPopups()));

// ===== Video Player =====
playBtn.addEventListener('click', () => {
    if (video.paused) video.play();
    else video.pause();
});
video.addEventListener('play', () => { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
video.addEventListener('pause', () => { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });

volumeSlider.addEventListener('input', () => { video.volume = volumeSlider.value; updateVolIcon(); });
volumeBtn.addEventListener('click', () => {
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

fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else playerWrapper.requestFullscreen();
});
mutedIndicator.addEventListener('click', () => {
    video.muted = false;
    if (video.volume === 0) {
        video.volume = 1;
        volumeSlider.value = 1;
    }
    updateVolIcon();
});

// ===== Like =====
let liked = false;
likeBtn.addEventListener('click', () => {
    if (!liked) {
        liked = true;
        likeBtn.classList.add('liked');
        likeCountSpan.textContent = '12.4K';
    } else {
        liked = false;
        likeBtn.classList.remove('liked');
        likeCountSpan.textContent = '12.3K';
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
        showToast('Notifications on');
    } else {
        notificationBellBtn.classList.add('active');
        showToast('Notifications off');
    }
});

confirmUnsubscribe.addEventListener('click', () => {
    subscribed = false;
    subscribeBtn.textContent = 'Subscribe';
    subscribeBtn.classList.remove('subscribed');
    notificationBellBtn.style.display = 'none';
    closeAllPopups();
    showToast('Unsubscribed');
});

// ===== Save =====
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

// ===== Orbship =====
orbshipBtn.addEventListener('click', () => {
    openPopup(orbshipPopup);
});

document.querySelectorAll('.orbship-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const plan = btn.dataset.plan;
        showToast(`You selected: ${plan}`);
        closeAllPopups();
    });
});

// ===== Description Toggle =====
showDescBtn.addEventListener('click', () => {
    descPreview.classList.toggle('expanded');
    showDescBtn.textContent = descPreview.classList.contains('expanded') ? 'Show less' : 'Show more';
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
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Live now on ORBIT!')}`;
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

// ===== Chat =====
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatChatText(text) {
    return escapeHtml(text).replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
        // اولویت با GIF
        const gifFilename = name + '.gif';
        if (gifEmojiSet.has(gifFilename)) {
            return `<img class="emoji-inline" src="assets/emoji/gif/${gifFilename}" alt="${name}">`;
        }
        
        // سپس PNG/WEBP
        const pngName = name + '.png';
        const webpName = name + '.webp';
        const hasPng = emojiList.includes(pngName);
        const hasWebp = emojiList.includes(webpName);
        
        if (!hasPng && !hasWebp) return match;
        
        if (hasPng && hasWebp) {
            return `<picture>
                        <source srcset="assets/emoji/${webpName}" type="image/webp">
                        <img class="emoji-inline" src="assets/emoji/${pngName}" alt="${name}">
                    </picture>`;
        } else if (hasWebp) {
            return `<img class="emoji-inline" src="assets/emoji/${webpName}" alt="${name}">`;
        } else {
            return `<img class="emoji-inline" src="assets/emoji/${pngName}" alt="${name}">`;
        }
    });
}

function addChatMessage(author, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    const formatted = formatChatText(text);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.innerHTML = `
        <div class="chat-avatar">${escapeHtml(author[0])}</div>
        <div class="chat-content">
            <div><span class="chat-author">${escapeHtml(author)}</span><span class="chat-time"> ${now}</span></div>
            <div class="chat-text">${formatted}</div>
        </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage('You', text);
    chatInput.value = '';
}

sendMessageBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ===== Emoji Menu (ساخت خودکار از PNG/WEBP و GIF) =====
function buildEmojiMenu() {
    emojiMenu.innerHTML = '';
    // ایموجی‌های PNG/WEBP
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
    // ایموجی‌های GIF (خودکار)
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

emojiBtn.addEventListener('click', (e) => {
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

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}