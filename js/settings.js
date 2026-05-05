// ===== DOM Elements =====
const html = document.documentElement;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const showMoreChannelsBtn = document.getElementById('showMoreChannels');
const settingsContent = document.getElementById('settingsContent');
const groupHeaders = document.querySelectorAll('.settings-group-header');
const subItems = document.querySelectorAll('.settings-sub-item');
const toastContainer = document.getElementById('toastContainer');

// ===== Videos Data for Featured selection =====
const videosData = [
    { id: 1, title: "How to Explore Space", views: "1.2M", thumbnail: "assets/thumbnail.png" },
    { id: 2, title: "ORBIT Platform Overview", views: "856K", thumbnail: "assets/thumbnail.png" },
    { id: 3, title: "Live Q&A Session", views: "432K", thumbnail: "assets/thumbnail.png" },
    { id: 4, title: "New Features Update", views: "298K", thumbnail: "assets/thumbnail.png" }
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

// ===== Group expand/collapse =====
groupHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const group = header.dataset.group;
        const items = document.getElementById(group + 'Group');
        if (items) {
            const isOpen = items.style.display !== 'none';
            if (isOpen) {
                items.style.display = 'none';
                header.classList.remove('open');
            } else {
                items.style.display = 'flex';
                header.classList.add('open');
            }
        }
    });
});

// ===== Featured Select Generator =====
function getFeaturedSelect() {
    let options = videosData.map(v => `<option value="${v.id}">${v.title}</option>`).join('');
    return `
        <div class="form-group">
            <label>Featured Video</label>
            <select class="form-input" id="featuredVideoSelect">
                <option value="">-- Select a video --</option>
                ${options}
            </select>
        </div>
    `;
}

// ===== Category Select from ORBIT_CATEGORIES =====
function getCategorySelect() {
    const cats = window.ORBIT_CATEGORIES || [];
    let options = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    return `
        <select class="form-input" id="liveCategorySelect">
            <option value="">-- Select category --</option>
            ${options}
        </select>
    `;
}

// ===== Section Templates (only Channel and Live remain) =====
const sectionTemplates = {
    // Channel settings
    'channel-basic': `
        <div class="settings-section active"><h2>Basic Info</h2><p class="desc">Manage channel name, handle, and description.</p>
            <div class="form-group"><label>Channel Name</label><input class="form-input" value="Channel Name"></div>
            <div class="form-group"><label>Handle</label><input class="form-input" value="@channelname"></div>
            <div class="form-group"><label>Description</label><textarea class="form-textarea">Welcome to the official ORBIT channel.</textarea></div>
            <button class="btn btn-primary" onclick="showToast('Basic info saved!')">Save</button>
        </div>`,

    'channel-branding': `
        <div class="settings-section active"><h2>Branding</h2><p class="desc">Update profile picture and banner.</p>
            <div class="form-group"><label>Profile Picture</label><input type="file" class="form-input" accept="image/*"></div>
            <div class="form-group"><label>Banner Image</label><input type="file" class="form-input" accept="image/*"></div>
            <button class="btn btn-primary" onclick="showToast('Branding updated!')">Upload</button>
        </div>`,

    'channel-upload': `
        <div class="settings-section active"><h2>Upload Defaults</h2><p class="desc">Default visibility and options for new uploads.</p>
            <div class="form-group"><label>Visibility</label><select class="form-input"><option>Public</option><option>Unlisted</option><option>Private</option></select></div>
            <div class="toggle-row"><span class="toggle-label">Allow comments by default</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            <button class="btn btn-primary" onclick="showToast('Upload defaults saved!')">Save</button>
        </div>`,

    'channel-permissions': `
        <div class="settings-section active"><h2>Permissions</h2><p class="desc">Manage channel managers.</p>
            <div class="form-group"><label>Add Manager (email)</label><input class="form-input" placeholder="manager@orbit.com"></div>
            <button class="btn btn-primary" onclick="showToast('Invitation sent!')">Add</button>
        </div>`,

    'channel-featured': `
        <div class="settings-section active"><h2>Featured Sections</h2><p class="desc">Choose which sections appear on your channel home.</p>
            <div class="toggle-row"><span class="toggle-label">Popular uploads</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            <div class="toggle-row"><span class="toggle-label">Latest videos</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            ${getFeaturedSelect()}
            <button class="btn btn-primary" onclick="showToast('Sections updated!')">Save</button>
        </div>`,

    'channel-links': `
        <div class="settings-section active"><h2>Links & Contact</h2><p class="desc">Social links and contact info.</p>
            <div class="form-group"><label>Website</label><input class="form-input" value="https://orbit.com"></div>
            <div class="form-group"><label>Contact Email</label><input class="form-input" value="contact@orbit.com"></div>
            <button class="btn btn-primary" onclick="showToast('Links saved!')">Save</button>
        </div>`,

    // Live Streaming sections
    'live-stream-key': `
        <div class="settings-section active"><h2>🔑 Stream Key & Server</h2><p class="desc">Configure your broadcast connection.</p>
            <div class="form-group"><label>Stream Key</label><input class="form-input" value="abcd-1234-efgh-5678" readonly></div>
            <div class="form-group"><label>Stream Server</label><input class="form-input" value="rtmp://live.orbit.com/live"></div>
            <button class="btn btn-secondary" onclick="showToast('Key rotated!')">Rotate Key</button>
            <button class="btn btn-primary" style="margin-left:12px;" onclick="showToast('Stream settings saved!')">Save</button>
        </div>`,

    'live-stream-info': `
        <div class="settings-section active">
            <h2>📡 Stream Info & Stickers</h2>
            <p class="desc">Configure title, description, category, and Orbship stickers.</p>
            <div class="form-group">
                <label>Stream Title</label>
                <input class="form-input" value="My Live Stream" placeholder="Enter stream title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-textarea" placeholder="Describe your stream...">Join me live!</textarea>
            </div>
            <div class="form-group">
                <label>Category</label>
                ${getCategorySelect()}
            </div>
            <div class="form-group">
                <label>Donate Link</label>
                <input class="form-input" value="https://donofa.ir" placeholder="Donation URL">
            </div>

            <h3 style="margin-top:24px;">🛡️ Orbship Stickers</h3>
            <div class="toggle-row">
                <span class="toggle-label">Enable Custom Stickers</span>
                <label class="switch">
                    <input type="checkbox" id="enableStickers" checked>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Upload Sticker (PNG, max 100KB)</label>
                <input type="file" class="form-input" accept="image/png">
            </div>
            <div class="orb-sticker-list">
                <span style="color:var(--text-secondary);">Current stickers:</span>
                <div class="orb-sticker-item">⭐ Sticker1.png</div>
                <div class="orb-sticker-item">🚀 Rocket.png</div>
            </div>
            <button class="btn btn-primary" style="margin-top:20px;" onclick="showToast('Stream info & stickers saved!')">Save</button>
        </div>`,

    'live-dvr': `
        <div class="settings-section active"><h2>Enable DVR</h2><p class="desc">Allow viewers to rewind during live streams.</p>
            <div class="toggle-row"><span class="toggle-label">DVR</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            <button class="btn btn-primary" onclick="showToast('DVR setting saved!')">Save</button>
        </div>`,

    'live-latency': `
        <div class="settings-section active"><h2>Latency Settings</h2><p class="desc">Choose stream latency mode.</p>
            <div class="radio-group"><label class="radio-label"><input type="radio" name="latency" checked> Normal</label><label class="radio-label"><input type="radio" name="latency"> Low</label><label class="radio-label"><input type="radio" name="latency"> Ultra Low</label></div>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="showToast('Latency saved!')">Save</button>
        </div>`,

    'live-chat-replay': `
        <div class="settings-section active"><h2>Chat Replay</h2><p class="desc">Show live chat alongside video replay.</p>
            <div class="toggle-row"><span class="toggle-label">Enable Chat Replay</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            <button class="btn btn-primary" onclick="showToast('Chat replay saved!')">Save</button>
        </div>`,

    'live-chat': `
        <div class="settings-section active"><h2>Live Chat Settings</h2><p class="desc">Configure moderation and restrictions for live chat.</p>
            <div class="toggle-row"><span class="toggle-label">Slow Mode</span><label class="switch"><input type="checkbox"><span class="slider"></span></label></div>
            <div class="toggle-row"><span class="toggle-label">Subscribers Only Mode</span><label class="switch"><input type="checkbox"><span class="slider"></span></label></div>
            <div class="form-group"><label>Blocked Words</label><textarea class="form-textarea" placeholder="Comma-separated words"></textarea></div>
            <div class="form-group"><label>Moderators</label><input class="form-input" placeholder="Usernames, comma-separated"></div>
            <button class="btn btn-primary" onclick="showToast('Live chat settings saved!')">Save</button>
        </div>`
};

// ===== Load Section =====
function loadSection(sectionId) {
    settingsContent.innerHTML = sectionTemplates[sectionId] || `<div class="settings-section active"><h2>${sectionId}</h2><p>Settings will appear here.</p></div>`;
}

// ===== Navigation Logic =====
subItems.forEach(item => {
    item.addEventListener('click', () => {
        subItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const section = item.dataset.section;
        loadSection(section);
    });
});

// Load default first section
loadSection('channel-basic');

// ===== Toast =====
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}