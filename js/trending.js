// ===== DOM Elements =====
const html = document.documentElement;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const trendingList = document.getElementById('trendingList');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoryPills = document.querySelectorAll('.category-pill');
const regionSelect = document.getElementById('regionSelect');
const toastContainer = document.getElementById('toastContainer');

// ===== Sample Trending Data =====
const allTrendingData = [
    { rank: 1, title: "Exploring Deep Space with James Webb", channel: "Nebula Studios", channelAvatar: "N", views: "2.4M", time: "1 day ago", duration: "18:42", thumbnail: "assets/thumbnail.png", category: "science" },
    { rank: 2, title: "Chill Lo-fi Beats to Study to", channel: "Galaxy Music", channelAvatar: "G", views: "1.8M", time: "3 days ago", duration: "1:02:15", thumbnail: "assets/thumbnail.png", category: "music" },
    { rank: 3, title: "NEW Fortnite Season - First Victory", channel: "ProSniper", channelAvatar: "P", views: "1.5M", time: "5 hours ago", duration: "22:10", thumbnail: "assets/thumbnail.png", category: "gaming" },
    { rank: 4, title: "Quantum Computing Explained Simply", channel: "Quantum Tech", channelAvatar: "Q", views: "1.3M", time: "2 weeks ago", duration: "15:33", thumbnail: "assets/thumbnail.png", category: "technology" },
    { rank: 5, title: "Morning Motivational Speech 2026", channel: "Daily Chat", channelAvatar: "D", views: "1.1M", time: "4 days ago", duration: "9:17", thumbnail: "assets/thumbnail.png", category: "entertainment" },
    { rank: 6, title: "Last Minute World Cup Goal - Reaction", channel: "Sports Central", channelAvatar: "S", views: "980K", time: "12 hours ago", duration: "6:45", thumbnail: "assets/thumbnail.png", category: "sports" },
    { rank: 7, title: "How AI is Changing Medicine", channel: "Science Today", channelAvatar: "S", views: "875K", time: "6 days ago", duration: "24:18", thumbnail: "assets/thumbnail.png", category: "technology" },
    { rank: 8, title: "Minecraft but I can't touch grass", channel: "BlockMaster", channelAvatar: "B", views: "743K", time: "2 days ago", duration: "31:02", thumbnail: "assets/thumbnail.png", category: "gaming" },
    { rank: 9, title: "The Truth About Crypto 2026", channel: "Crypto Daily", channelAvatar: "C", views: "698K", time: "8 hours ago", duration: "14:55", thumbnail: "assets/thumbnail.png", category: "news" },
    { rank: 10, title: "Learn Persian in 10 Minutes", channel: "Language Hub", channelAvatar: "L", views: "612K", time: "1 month ago", duration: "10:03", thumbnail: "assets/thumbnail.png", category: "education" },
    { rank: 11, title: "Best Indie Games of 2026", channel: "Indie Vibes", channelAvatar: "I", views: "534K", time: "3 days ago", duration: "17:29", thumbnail: "assets/thumbnail.png", category: "gaming" },
    { rank: 12, title: "How to Bake Perfect Sourdough", channel: "ChefLive", channelAvatar: "C", views: "489K", time: "5 days ago", duration: "28:14", thumbnail: "assets/thumbnail.png", category: "entertainment" },
    { rank: 13, title: "SpaceX Starship Launch Highlights", channel: "Space Today", channelAvatar: "S", views: "456K", time: "1 day ago", duration: "8:57", thumbnail: "assets/thumbnail.png", category: "science" },
    { rank: 14, title: "Why Sleep Matters - Neuroscience", channel: "Deep Thinkers", channelAvatar: "D", views: "398K", time: "1 week ago", duration: "19:42", thumbnail: "assets/thumbnail.png", category: "education" },
    { rank: 15, title: "Top 10 Goals of the Season", channel: "Sports Central", channelAvatar: "S", views: "367K", time: "2 days ago", duration: "12:30", thumbnail: "assets/thumbnail.png", category: "sports" }
];

let currentCategory = 'all';
let currentRegion = 'global';
let visibleCount = 8;

// ===== Theme =====
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

// ===== Filter & Render =====
function getFilteredData() {
    return allTrendingData.filter(video => {
        if (currentCategory !== 'all' && video.category !== currentCategory) return false;
        // Region simulation - we can filter by some logic; currently all regions share same data
        return true;
    });
}

function renderTrendingList(data) {
    const toDisplay = data.slice(0, visibleCount);
    trendingList.innerHTML = toDisplay.map(video => `
        <div class="trending-item" data-category="${video.category}">
            <div class="rank">${video.rank}</div>
            <div class="trending-thumb" style="background-image:url(${video.thumbnail})">
                <span class="trending-duration">${video.duration}</span>
            </div>
            <div class="trending-info">
                <h3 class="trending-video-title">${video.title}</h3>
                <div class="trending-channel">
                    <span class="trending-channel-avatar">${video.channelAvatar}</span>
                    ${video.channel}
                </div>
                <div class="trending-meta">
                    <span>${video.views} views</span>
                    <span>${video.time}</span>
                </div>
            </div>
            <div class="trending-item-actions">
                <button class="action-icon-btn like-trending-btn" title="Like">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                </button>
                <button class="action-icon-btn save-trending-btn" title="Save">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    if (data.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-flex';
    } else {
        loadMoreBtn.style.display = 'none';
    }

    // Attach event listeners to action buttons
    attachActionListeners();
}

function attachActionListeners() {
    document.querySelectorAll('.like-trending-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('liked');
            if (btn.classList.contains('liked')) {
                btn.style.color = 'var(--accent)';
            } else {
                btn.style.color = 'var(--text-secondary)';
            }
        });
    });
    document.querySelectorAll('.save-trending-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('saved');
            if (btn.classList.contains('saved')) {
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
                btn.style.color = 'var(--accent)';
                showToast('Saved to library');
            } else {
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
                btn.style.color = 'var(--text-secondary)';
            }
        });
    });
}

function updateTrending() {
    const filtered = getFilteredData();
    renderTrendingList(filtered);
}

// ===== Category Filter =====
categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('category-pill--active'));
        pill.classList.add('category-pill--active');
        currentCategory = pill.dataset.category;
        visibleCount = 8; // reset
        updateTrending();
    });
});

// ===== Region Change =====
regionSelect.addEventListener('change', () => {
    currentRegion = regionSelect.value;
    // Here we could re-fetch or filter data based on region; for now just simulate
    showToast(`Trending for ${regionSelect.options[regionSelect.selectedIndex].text}`);
    visibleCount = 8;
    updateTrending();
});

// ===== Load More =====
loadMoreBtn.addEventListener('click', () => {
    visibleCount += 8;
    updateTrending();
});

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ===== Initial Render =====
updateTrending();