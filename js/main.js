// ===== DOM Elements =====
const body = document.body;
const html = document.documentElement;
const overlay = document.getElementById('overlay');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const createBtn = document.getElementById('createBtn');
const createDropdown = document.getElementById('createDropdown');
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const forgotPopup = document.getElementById('forgotPopup');
const uploadPopup = document.getElementById('uploadPopup');
const shortPopup = document.getElementById('shortPopup');
const postPopup = document.getElementById('postPopup');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const videoGrid = document.getElementById('videoGrid');
const toastContainer = document.getElementById('toastContainer');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
let currentPopup = null;

// ===== Theme Management =====
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('orbit-theme', theme);
    updateThemeLabel(theme);
}
function updateThemeLabel(theme) { themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'; }
const savedTheme = localStorage.getItem('orbit-theme') || 'dark';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// ===== Sidebar Toggle (icon/normal) =====
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--collapsed');
});

// ===== Show More Channels =====
const showMoreBtn = document.getElementById('showMoreChannels');
const hiddenChannels = document.querySelectorAll('.hidden-channel');
let channelsExpanded = false;
showMoreBtn.addEventListener('click', () => {
    channelsExpanded = !channelsExpanded;
    hiddenChannels.forEach(ch => ch.style.display = channelsExpanded ? 'flex' : 'none');
    showMoreBtn.textContent = channelsExpanded ? 'Show less' : 'Show more';
});

// ===== Dropdown Toggles =====
profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
    createDropdown.classList.remove('active');
});
createBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    createDropdown.classList.toggle('active');
    profileDropdown.classList.remove('active');
});
document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && e.target !== profileBtn) profileDropdown.classList.remove('active');
    if (!createDropdown.contains(e.target) && e.target !== createBtn) createDropdown.classList.remove('active');
});

// ===== Popup Management =====
function openPopup(popup) { closeAllPopups(); popup.classList.add('active'); overlay.classList.add('active'); currentPopup = popup; document.body.style.overflow = 'hidden'; }
function closeAllPopups() { [loginPopup, signupPopup, forgotPopup, uploadPopup, shortPopup, postPopup].forEach(p => p.classList.remove('active')); overlay.classList.remove('active'); document.body.style.overflow = ''; currentPopup = null; }
overlay.addEventListener('click', closeAllPopups);
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        const popupId = btn.getAttribute('data-close');
        document.getElementById(popupId)?.classList.remove('active');
        overlay.classList.remove('active'); document.body.style.overflow = ''; currentPopup = null;
    });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && currentPopup) closeAllPopups(); });

// Handle dropdown actions
document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = el.getAttribute('data-action');
        profileDropdown.classList.remove('active');
        createDropdown.classList.remove('active');
        if (action === 'login') openPopup(loginPopup);
        else if (action === 'signup') openPopup(signupPopup);
        else if (action === 'forgotPassword') { closeAllPopups(); openPopup(forgotPopup); }
        else if (action === 'switchToSignup') { closeAllPopups(); openPopup(signupPopup); }
        else if (action === 'switchToLogin') { closeAllPopups(); openPopup(loginPopup); }
        else if (action === 'backToLogin') { closeAllPopups(); openPopup(loginPopup); }
        else if (action === 'uploadVideo') openPopup(uploadPopup);
        else if (action === 'uploadShort') openPopup(shortPopup);
        else if (action === 'newPost') openPopup(postPopup);
    });
});

// ===== Description (Video Upload) =====
const descriptionDiv = document.getElementById('videoDescription');
const descCounter = document.getElementById('descCounter');
const MAX_CHARS = 5000;

function getCursorOffset(container) {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0).cloneRange();
    range.selectNodeContents(container);
    range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
    return range.toString().length;
}
function setCursorOffset(container, offset) {
    const sel = window.getSelection();
    const range = document.createRange();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let node, currentPos = 0;
    while ((node = walker.nextNode())) {
        const len = node.textContent.length;
        if (currentPos + len >= offset) {
            range.setStart(node, offset - currentPos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
        }
        currentPos += len;
    }
    range.selectNodeContents(container);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}
function highlightHashtagsInElement(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/#[\w\u0600-\u06FF]+/g.test(node.textContent)) nodesToReplace.push(node);
    }
    nodesToReplace.forEach(textNode => {
        const fragment = document.createDocumentFragment();
        const text = textNode.textContent;
        const regex = /#[\w\u0600-\u06FF]+/g;
        let lastIdx = 0, match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIdx) fragment.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
            const span = document.createElement('span');
            span.className = 'hashtag';
            span.textContent = match[0];
            fragment.appendChild(span);
            lastIdx = regex.lastIndex;
        }
        if (lastIdx < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
        textNode.parentNode.replaceChild(fragment, textNode);
    });
}
function enforceMaxLength() {
    let text = descriptionDiv.innerText;
    if (text.length > MAX_CHARS) {
        descriptionDiv.innerText = text.substring(0, MAX_CHARS);
        setCursorOffset(descriptionDiv, MAX_CHARS);
    }
    descCounter.textContent = `${descriptionDiv.innerText.length} / ${MAX_CHARS}`;
}
descriptionDiv.addEventListener('input', () => {
    const cursorPos = getCursorOffset(descriptionDiv);
    enforceMaxLength();
    descriptionDiv.querySelectorAll('.hashtag').forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
    highlightHashtagsInElement(descriptionDiv);
    setCursorOffset(descriptionDiv, cursorPos);
});

// ===== Thumbnail & Video File =====
const thumbUploadArea = document.getElementById('thumbUploadArea');
const thumbUploadInput = document.getElementById('thumbUploadInput');
const chooseFrameBtn = document.getElementById('chooseFrameBtn');
const videoFileArea = document.getElementById('videoFileArea');
const videoFileInput = document.getElementById('videoFileInput');
const videoFileName = document.getElementById('videoFileName');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

thumbUploadArea.addEventListener('click', () => thumbUploadInput.click());
thumbUploadInput.addEventListener('change', () => { if (thumbUploadInput.files[0]) showToast('Thumbnail selected.'); });
chooseFrameBtn.addEventListener('click', () => showToast('Frame selection simulated.'));

videoFileArea.addEventListener('click', () => videoFileInput.click());
videoFileInput.addEventListener('change', () => {
    if (videoFileInput.files[0]) {
        videoFileName.textContent = videoFileInput.files[0].name;
        progressContainer.style.display = 'flex';
        let prog = 0;
        const interval = setInterval(() => {
            prog += Math.floor(Math.random()*15)+5;
            if (prog >= 100) { prog = 100; clearInterval(interval); progressFill.style.width = '100%'; progressText.textContent = '100%'; showToast('File ready.'); }
            else { progressFill.style.width = prog+'%'; progressText.textContent = prog+'%'; }
        }, 300);
    } else { videoFileName.textContent = 'Click to select a video file'; progressContainer.style.display = 'none'; }
});

// ===== Tags =====
const tagDisplay = document.getElementById('tagDisplay');
const tagInput = document.getElementById('tagInput');
const addTagBtn = document.getElementById('addTagBtn');
const tagCounter = document.getElementById('tagCounter');
let tags = [];
const MAX_TAGS = 500;

function renderTags() {
    tagDisplay.innerHTML = tags.map((t, i) => `<span class="tag-chip">${t}<button type="button" data-index="${i}">×</button></span>`).join('');
    tagCounter.textContent = `${tags.length} / ${MAX_TAGS} tags`;
    document.querySelectorAll('.tag-chip button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            tags.splice(idx, 1);
            renderTags();
        });
    });
}
function addTag(text) {
    text = text.trim();
    if (text === '' || tags.includes(text) || tags.length >= MAX_TAGS) return;
    tags.push(text);
    renderTags();
    tagInput.value = '';
}
tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.value); }
});
addTagBtn.addEventListener('click', () => addTag(tagInput.value));
tagInput.addEventListener('keyup', (e) => { if (e.key === ',') addTag(tagInput.value.replace(',', '')); });

// ===== Short Video Handling =====
const shortFileArea = document.getElementById('shortFileArea');
const shortFileInput = document.getElementById('shortFileInput');
const shortFileName = document.getElementById('shortFileName');
shortFileArea.addEventListener('click', () => shortFileInput.click());
shortFileInput.addEventListener('change', () => {
    shortFileName.textContent = shortFileInput.files[0] ? shortFileInput.files[0].name : 'Click to select a short video';
});

// ===== Post Image Handling =====
const postImageArea = document.getElementById('postImageArea');
const postImageInput = document.getElementById('postImageInput');
const postImageName = document.getElementById('postImageName');
postImageArea.addEventListener('click', () => postImageInput.click());
postImageInput.addEventListener('change', () => {
    postImageName.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Click to add an image';
});

// ===== Form Submits =====
document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value.trim();
    if (!title) { showToast('Please enter a video title.'); return; }
    if (videoFileInput.files.length === 0) { showToast('Please select a video file.'); return; }
    showToast('Upload started!');
    closeAllPopups();
    document.getElementById('uploadForm').reset();
    descriptionDiv.innerHTML = ''; descCounter.textContent = '0 / 5000';
    videoFileName.textContent = 'Click to select a video file'; progressContainer.style.display = 'none';
    tags = []; renderTags();
});
document.getElementById('shortForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('shortTitle').value.trim();
    if (!title) { showToast('Please enter a title.'); return; }
    if (shortFileInput.files.length === 0) { showToast('Please select a short video.'); return; }
    showToast('Short published!');
    closeAllPopups();
    document.getElementById('shortForm').reset();
    shortFileName.textContent = 'Click to select a short video';
});
document.getElementById('postForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('postContent').value.trim();
    if (!content) { showToast('Please write something.'); return; }
    showToast('Post published!');
    closeAllPopups();
    document.getElementById('postForm').reset();
    postImageName.textContent = 'Click to add an image';
});

// ===== Login / Signup / Forgot =====
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    if (!username) { document.querySelector('#loginUsername + .input-group__error').textContent = 'Username required.'; return; }
    showToast('Welcome back, ' + username + '!'); closeAllPopups(); updateProfileAvatar(username.charAt(0).toUpperCase());
});
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    if (!username) { document.querySelector('#signupUsername + .input-group__error').textContent = 'Username required.'; return; }
    showToast('Account created!'); closeAllPopups(); updateProfileAvatar(username.charAt(0).toUpperCase());
});
document.getElementById('forgotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    if (email) { showToast('Reset link sent to ' + email); closeAllPopups(); }
});
document.querySelectorAll('.input-group input, .input-group textarea, .input-group select').forEach(inp => {
    inp.addEventListener('input', () => { const err = inp.parentElement.querySelector('.input-group__error'); if (err) err.textContent = ''; });
});

const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const avatarUploadArea = document.getElementById('avatarUpload');
if (avatarUploadArea) { avatarUploadArea.addEventListener('click', () => avatarInput.click()); }
avatarInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = ev => avatarPreview.innerHTML = `<img src="${ev.target.result}">`; reader.readAsDataURL(file); }
});

// ===== Toast =====
function showToast(msg, duration=3000) {
    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

// ===== Feed Generator =====
function generateLongVideo(num, isTrend = false) {
    return {
        type: 'video',
        title: `Video Title ${num}`,
        channel: `Channel Name ${num}`,
        views: '0',
        time: 'Now',
        duration: '10:00',
        isTrend: isTrend
    };
}
function generateShort(num) {
    return { type: 'short', title: `Short ${num}`, channel: `Channel Name ${num}`, views: '0' };
}
function generatePost(num) {
    return { type: 'post', author: `Channel Name ${num}`, time: 'Now', content: `Community post content #${num}.`, image: null };
}

const feedData = [];
// ردیف اول: 5 ویدیوی بلند (اولین Most Trend)
feedData.push(generateLongVideo(1, true));
for (let i = 2; i <= 5; i++) feedData.push(generateLongVideo(i));
// ردیف دوم: 5 ویدیوی بلند
for (let i = 6; i <= 10; i++) feedData.push(generateLongVideo(i));
// ردیف سوم: 5 ویدیوی Short
for (let i = 1; i <= 5; i++) feedData.push(generateShort(i));
// ردیف چهارم: 5 پست انجمن
for (let i = 1; i <= 5; i++) feedData.push(generatePost(i));
// ادامه ویدیوهای بلند
for (let i = 11; i <= 25; i++) feedData.push(generateLongVideo(i));

function renderFeed() {
    videoGrid.innerHTML = feedData.map(item => {
        if (item.type === 'video') {
            const trendClass = item.isTrend ? ' video-card--trend' : '';
            const trendBadge = item.isTrend ? '<span class="trend-badge">Most Trend</span>' : '';
            return `<article class="video-card${trendClass}">
                <div class="video-card__thumbnail"><div style="background:linear-gradient(135deg,#1a2a3a,#0f3a2b);height:100%"></div>${trendBadge}<span class="video-card__duration">${item.duration}</span></div>
                <div class="video-card__info"><div class="video-card__channel-img">${item.channel.charAt(0)}</div><div class="video-card__text"><h3>${item.title}</h3><p>${item.channel}</p><p>${item.views} views · ${item.time}</p></div></div>
            </article>`;
        } else if (item.type === 'short') {
            return `<article class="video-card video-card--short"><div class="video-card__thumbnail"><div style="background:linear-gradient(135deg,#2a1a3a,#0f2a2b);height:100%"></div></div><div class="video-card__info"><div class="video-card__channel-img">${item.channel.charAt(0)}</div><div class="video-card__text"><h3>${item.title}</h3><p>${item.channel}</p><p>${item.views} views</p></div></div></article>`;
        } else if (item.type === 'post') {
            return `<article class="post-card"><div class="post-card__header"><div class="post-card__avatar">${item.author.charAt(0)}</div><div><div class="post-card__author">${item.author}</div><div class="post-card__time">${item.time}</div></div></div><div class="post-card__content">${item.content}</div>${item.image ? `<img src="${item.image}" class="post-card__image" alt="Post image">` : ''}</article>`;
        }
    }).join('');
}
renderFeed();

// ===== Category Pills Active =====
document.querySelectorAll('.category-pill').forEach(p => p.addEventListener('click', function() { document.querySelector('.category-pill--active')?.classList.remove('category-pill--active'); this.classList.add('category-pill--active'); }));

function updateProfileAvatar(initial) {
    const container = document.getElementById('profileAvatar');
    if (container) container.innerHTML = `<span style="font-weight:700;font-size:1rem;">${initial}</span>`;
}

// ===== باز کردن پاپ‌آپ بر اساس پارامتر popup در URL =====
const urlParams = new URLSearchParams(window.location.search);
const popupParam = urlParams.get('popup');
if (popupParam) {
    window.addEventListener('DOMContentLoaded', () => {
        if (popupParam === 'login') openPopup(loginPopup);
        else if (popupParam === 'signup') openPopup(signupPopup);
        else if (popupParam === 'uploadVideo') openPopup(uploadPopup);
        else if (popupParam === 'uploadShort') openPopup(shortPopup);
        else if (popupParam === 'newPost') openPopup(postPopup);
        // پاک کردن پارامتر از URL بدون رفرش
        if (window.history.replaceState) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: cleanUrl}, '', cleanUrl);
        }
    });
}