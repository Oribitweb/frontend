// ===== DOM References =====
const html = document.documentElement;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
const featuredCard = document.getElementById('featuredCard');
const featuredDots = document.getElementById('featuredDots');
const topStreamsGrid = document.getElementById('topStreamsGrid');
const remainingStreamsGrid = document.getElementById('remainingStreamsGrid');
const liveSearchInput = document.getElementById('liveSearchInput');
const toastContainer = document.getElementById('toastContainer');

// ===== Live Data =====
const liveStreams = [
    { title: "Exploring the Cosmos", channel: "Channel Name", category: "Minecraft", viewers: 42.0, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "League of Legends Finals", channel: "Esports Arena", category: "FiveM", viewers: 33.7, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Late Night Jazz", channel: "Music Lounge", category: "Just Chatting", viewers: 5.7, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Morning Talk Show", channel: "Daily Chat", category: "Just Chatting", viewers: 3.1, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "SpaceX Launch", channel: "Space Today", category: "Just Chatting", viewers: 15.3, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "FIFA Tournament", channel: "Sports Central", category: "Gaming", viewers: 12.4, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Minecraft Build Battle", channel: "BlockMaster", category: "Just Chatting", viewers: 6.9, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "COD Mobile Ranked", channel: "ProSniper", category: "Call of Duty Mobile", viewers: 9.5, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Philosophy Roundtable", channel: "Deep Thinkers", category: "Just Chatting", viewers: 2.4, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Acoustic Session", channel: "Indie Vibes", category: "Just Chatting", viewers: 1.8, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Speedrun Any%", channel: "SpeedDemon", category: "Music", viewers: 4.2, thumbnail: "assets/thumbnail.png", url: "live.php" },
    { title: "Cooking Masterclass", channel: "ChefLive", category: "IRL", viewers: 7.3, thumbnail: "assets/thumbnail.png", url: "live.php" }
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

// ===== Featured Section (Top 3 autoplay) =====
const sorted = [...liveStreams].sort((a, b) => b.viewers - a.viewers);
const top3 = sorted.slice(0, 3);
let currentIndex = 0;
let featuredInterval;

function renderFeatured(index) {
    const stream = top3[index];
    featuredCard.style.backgroundImage = `url(${stream.thumbnail})`;
    featuredCard.innerHTML = `
        <div class="featured-info">
            <div class="live-badge-large"><span class="live-dot"></span> LIVE</div>
            <h2>${stream.title}</h2>
            <div class="channel">${stream.channel}</div>
            <div class="viewers">${stream.viewers}K watching</div>
        </div>
    `;
    featuredCard.onclick = () => window.location.href = stream.url;

    featuredDots.innerHTML = top3.map((_, i) => 
        `<span class="featured-dot ${i === index ? 'active' : ''}"></span>`
    ).join('');
}

function nextFeatured() {
    currentIndex = (currentIndex + 1) % top3.length;
    renderFeatured(currentIndex);
}

function startFeaturedCycle() {
    featuredInterval = setInterval(nextFeatured, 4000);
}
function stopFeaturedCycle() {
    clearInterval(featuredInterval);
}

renderFeatured(0);
startFeaturedCycle();
featuredCard.addEventListener('mouseenter', stopFeaturedCycle);
featuredCard.addEventListener('mouseleave', startFeaturedCycle);

// ===== Small Card Rendering =====
function createSmallCard(stream) {
    return `
        <div class="live-card-small" onclick="window.location.href='${stream.url}'">
            <div class="thumb" style="background-image:url(${stream.thumbnail})">
                <div class="live-badge"><span class="live-dot"></span> LIVE</div>
            </div>
            <div class="info">
                <div class="title">${stream.title}</div>
                <div class="channel">${stream.channel}</div>
                <div class="meta">
                    <span>${stream.viewers}K watching</span>
                    <span>${stream.category}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== Update all sections =====
function renderAllSections(streams) {
    const sortedStreams = [...streams].sort((a, b) => b.viewers - a.viewers);
    // Top streams (exclude top 3), next 6
    topStreamsGrid.innerHTML = sortedStreams.slice(3, 9).map(createSmallCard).join('');
    // Remaining streams
    remainingStreamsGrid.innerHTML = sortedStreams.slice(9).map(createSmallCard).join('');
    
    // Delegates category rendering to categories.js
    if (typeof window.updateCategories === 'function') {
        window.updateCategories(streams);
    }
}

renderAllSections(liveStreams);

// ===== Search =====
liveSearchInput.addEventListener('input', () => {
    const query = liveSearchInput.value.toLowerCase();
    const filtered = liveStreams.filter(s =>
        s.title.toLowerCase().includes(query) || s.channel.toLowerCase().includes(query)
    );
    renderAllSections(filtered);
});

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}