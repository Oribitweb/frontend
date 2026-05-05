// ===== DOM Elements =====
const html = document.documentElement;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
const subscribeBtn = document.getElementById('subscribeBtn');
const notificationBellBtn = document.getElementById('notificationBellBtn');
const videoGrid = document.getElementById('fullVideoGrid');            // Grid in Videos tab
const homeVideoGrid = document.getElementById('homeVideoGrid');        // Popular uploads on Home
const latestVideoGrid = document.getElementById('latestVideoGrid');    // Latest uploads on Home
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const sortBtns = document.querySelectorAll('.sort-btn');
const toastContainer = document.getElementById('toastContainer');

// ===== Channel Data =====
const videos = [
    { title: "How to Explore Space", views: "1.2M", time: "2 weeks ago", duration: "12:34", thumbnail: "assets/thumbnail.png" },
    { title: "ORBIT Platform Overview", views: "856K", time: "1 month ago", duration: "8:20", thumbnail: "assets/thumbnail.png" },
    { title: "Live Q&A Session", views: "432K", time: "3 months ago", duration: "45:10", thumbnail: "assets/thumbnail.png" },
    { title: "New Features Update", views: "298K", time: "5 months ago", duration: "4:55", thumbnail: "assets/thumbnail.png" },
    { title: "Behind the Scenes", views: "187K", time: "7 months ago", duration: "10:15", thumbnail: "assets/thumbnail.png" },
    { title: "Community Highlights", views: "95K", time: "1 year ago", duration: "22:40", thumbnail: "assets/thumbnail.png" },
    { title: "Deep Dive into Stars", views: "64K", time: "1 year ago", duration: "18:05", thumbnail: "assets/thumbnail.png" },
    { title: "ORBIT Shorts Compilation", views: "210K", time: "8 months ago", duration: "6:30", thumbnail: "assets/thumbnail.png" },
    { title: "Tutorial: Getting Started", views: "502K", time: "4 months ago", duration: "14:22", thumbnail: "assets/thumbnail.png" },
    { title: "Live from Space Center", views: "88K", time: "2 months ago", duration: "1:02:15", thumbnail: "assets/thumbnail.png" }
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
themeToggle.addEventListener('click', () => setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

// ===== Sidebar & Dropdowns =====
sidebar.classList.add('sidebar--collapsed');
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('sidebar--collapsed'));
let channelsExpanded = false;
const hiddenChannels = document.querySelectorAll('.sidebar__channel.hidden-channel');
if (showMoreChannelsBtn) {
    showMoreChannelsBtn.addEventListener('click', () => {
        channelsExpanded = !channelsExpanded;
        hiddenChannels.forEach(ch => ch.style.display = channelsExpanded ? 'flex' : 'none');
        showMoreChannelsBtn.textContent = channelsExpanded ? 'Show less' : 'Show more';
    });
}
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
        updateBellIcon();
        showToast('Subscribed! 🎉');
    } else {
        subscribed = false;
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.classList.remove('subscribed');
        notificationBellBtn.style.display = 'none';
        showToast('Unsubscribed');
    }
});
notificationBellBtn.addEventListener('click', () => {
    notificationOn = !notificationOn;
    updateBellIcon();
    showToast(notificationOn ? 'Notifications turned on' : 'Notifications turned off');
});
function updateBellIcon() {
    if (notificationOn) notificationBellBtn.classList.remove('active');
    else notificationBellBtn.classList.add('active');
}

// ===== Utility: parse view count string to number =====
function parseViews(viewStr) {
    const num = parseFloat(viewStr);
    return viewStr.includes('K') ? num * 1000 : num;
}

// ===== Render Video Card =====
function renderVideoCard(v) {
    return `
        <div class="video-card">
            <div class="thumb" style="background-image:url(${v.thumbnail})">
                <span class="duration">${v.duration}</span>
            </div>
            <div class="info">
                <div class="title">${v.title}</div>
                <div class="meta">
                    <span>${v.views} views</span>
                    <span>${v.time}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== Render Videos based on sorting =====
function renderVideosSorted(sortType = 'latest') {
    let sorted = [...videos];
    if (sortType === 'popular') {
        sorted.sort((a, b) => parseViews(b.views) - parseViews(a.views));
    } else if (sortType === 'oldest') {
        // Assuming original order is latest-first, reverse to show oldest first
        sorted.reverse();
    }
    videoGrid.innerHTML = sorted.map(renderVideoCard).join('');
}

// ===== Initial Render =====
function renderAll() {
    // Home tab: popular (top5 by views), latest (next 5)
    const popularSorted = [...videos].sort((a, b) => parseViews(b.views) - parseViews(a.views));
    homeVideoGrid.innerHTML = popularSorted.slice(0, 5).map(renderVideoCard).join('');
    latestVideoGrid.innerHTML = videos.slice(5, 10).map(renderVideoCard).join('');
    // Videos tab: default latest
    renderVideosSorted('latest');
}
renderAll();

// ===== Sort Buttons =====
sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sortBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sortType = btn.dataset.sort;
        renderVideosSorted(sortType);
    });
});

// ===== Tabs =====
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        tabContents.forEach(content => content.style.display = 'none');
        document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).style.display = 'block';
    });
});

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}