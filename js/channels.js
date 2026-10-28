// channels.js – Fetch and render channels from API
// Provides: window.OrbitChannels = { loadSidebarChannels, loadChannelPage }

(function () {
    'use strict';

    const API_BASE = window.API_BASE;

    // ---------- Helpers ----------
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => (m === '&' ? '&' : m === '<' ? '<' : '>'));
    }

    function getInitial(name) {
        return (name || '?').charAt(0).toUpperCase();
    }

    function getAvatarColor(name) {
        // Generate consistent color from name
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 65%, 45%)`;
    }

    // ---------- Sidebar channels rendering ----------
    async function loadSidebarChannels() {
        const container = document.querySelector('.sidebar__nav + .sidebar__divider + .sidebar__channels-title + *');
        if (!container) return;

        // Find all sidebar channel links (they follow the "Subscriptions" title)
        const channelLinks = document.querySelectorAll('.sidebar__channel:not(.hidden-channel)');
        const hiddenChannelLinks = document.querySelectorAll('.sidebar__channel.hidden-channel');
        const showMoreBtn = document.getElementById('showMoreChannels');

        try {
            // Fetch first 10 channels from API
            const res = await fetch(`${API_BASE}/channels/?page=1&size=10`, {
                headers: { Accept: 'application/json' },
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to load channels: ${res.status}`);
            const data = await res.json();
            const channels = data.items || [];

            // Render first channel in the main slot
            if (channels.length > 0 && channelLinks[0]) {
                renderChannelLink(channelLinks[0], channels[0]);
            }

            // Render up to 2 more in hidden slots
            hiddenChannelLinks.forEach((link, idx) => {
                const channel = channels[idx + 1];
                if (channel) {
                    renderChannelLink(link, channel);
                    link.style.display = 'flex';
                }
            });

            // If more channels exist, show the "Show more" button
            if (channels.length > 3 && showMoreBtn) {
                showMoreBtn.style.display = 'block';
                showMoreBtn.dataset.hasMore = 'true';
            }

        } catch (err) {
            console.error('Failed to load sidebar channels:', err);
            // Keep fallback static channels
        }
    }

    function renderChannelLink(linkEl, channel) {
        const initial = getInitial(channel.name);
        const color = getAvatarColor(channel.name);
        const handle = channel.handle;
        const name = escapeHtml(channel.name);

        linkEl.href = `channel.html?handle=${encodeURIComponent(handle)}`;
        linkEl.innerHTML = `
            <div class="sidebar__channel-avatar" style="background:${color};">${initial}</div>
            <span>${name}</span>
        `;
        linkEl.dataset.channelHandle = handle;
    }

    // ---------- Channel page rendering ----------
    async function loadChannelPage() {
        // Only run on channel.html
        if (!document.getElementById('channelMain')) return;

        const urlParams = new URLSearchParams(window.location.search);
        const handle = urlParams.get('handle');

        if (!handle) {
            showChannelError('No channel specified');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/channels/${encodeURIComponent(handle)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'include'
            });

            if (res.status === 404) {
                showChannelError('Channel not found');
                return;
            }
            if (!res.ok) throw new Error(`Failed to load channel: ${res.status}`);

            const channel = await res.json();
            renderChannelPage(channel);
            initChannelTabs();

        } catch (err) {
            console.error('Failed to load channel page:', err);
            showChannelError('Could not load channel');
        }
    }

    function renderChannelPage(channel) {
        // Update document title
        document.title = `${escapeHtml(channel.name)} — ORBIT`;

        // Banner
        const bannerImg = document.querySelector('.banner-img');
        if (bannerImg) {
            if (channel.banner_url) {
                bannerImg.src = channel.banner_url;
                bannerImg.style.display = 'block';
            } else {
                bannerImg.style.display = 'none';
            }
        }

        // Avatar
        const avatarEl = document.querySelector('.channel-avatar-large');
        if (avatarEl) {
            const initial = getInitial(channel.name);
            const color = getAvatarColor(channel.name);
            avatarEl.textContent = initial;
            avatarEl.style.background = color;
        }

        // Name & verification
        const nameEl = document.querySelector('.channel-name');
        if (nameEl) {
            const verifiedHtml = channel.verified_badge
                ? `<span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>`
                : '';
            nameEl.innerHTML = `${escapeHtml(channel.name)} ${verifiedHtml}`;
        }

        // Handle
        const handleEl = document.querySelector('.channel-handle');
        if (handleEl) {
            handleEl.textContent = `@${escapeHtml(channel.handle)}`;
        }

        // Stats (subscriber count, video count)
        const subscriberEl = document.querySelector('.subscriber-count');
        const videoCountEl = document.querySelector('.video-count');
        if (subscriberEl) subscriberEl.textContent = '— subscribers'; // Would need subscription count API
        if (videoCountEl) videoCountEl.textContent = '— videos'; // Would need video count API

        // Description
        const descEl = document.querySelector('.channel-description');
        if (descEl) {
            descEl.textContent = channel.description || 'No description yet.';
        }

        // Load channel videos
        loadChannelVideos(channel.id, channel.handle);
    }

    async function loadChannelVideos(channelId, channelHandle) {
        const homeGrid = document.getElementById('homeVideoGrid');
        const latestGrid = document.getElementById('latestVideoGrid');
        const fullGrid = document.getElementById('fullVideoGrid');

        try {
            // Fetch first page of videos for this channel
            const res = await fetch(`${API_BASE}/videos?channel_id=${channelId}&page=1&page_size=20`, {
                headers: { Accept: 'application/json' },
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to load videos: ${res.status}`);
            const data = await res.json();
            const videos = data.items || [];

            const popular = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

            if (homeGrid) {
                homeGrid.innerHTML = popular.slice(0, 5).map(videoCardHtml).join('');
            }
            if (latestGrid) {
                latestGrid.innerHTML = videos.slice(5, 10).map(videoCardHtml).join('');
            }
            if (fullGrid) {
                fullGrid.innerHTML = videos.map(videoCardHtml).join('');
            }

            // Re-attach hover previews
            if (window.OrbitPreview) window.OrbitPreview.attach();

        } catch (err) {
            console.error('Failed to load channel videos:', err);
        }
    }

    function videoCardHtml(video) {
        const duration = formatDuration(video.duration_seconds);
        const title = escapeHtml(video.title);
        const channel = escapeHtml(video.channel_name || 'Unknown channel');
        const views = formatCount(video.view_count);
        const published = timeAgo(video.published_at || video.created_at);
        const initial = (video.channel_name || '?').charAt(0).toUpperCase();
        const href = video.public_id
            ? `video.html?id=${encodeURIComponent(video.public_id)}`
            : '#';
        const thumbImg = video.thumbnail_url
            ? `<img src="${escapeHtml(video.thumbnail_url)}" alt="${title}" loading="lazy">`
            : '';

        return `
            <a class="video-card" href="${href}" data-video-id="${video.id}" data-video-preview="true">
                <div class="video-card__thumbnail">
                    ${thumbImg}
                    ${duration ? `<span class="video-card__duration">${duration}</span>` : ''}
                </div>
                <div class="video-card__info">
                    <div class="video-card__channel-img">${initial}</div>
                    <div class="video-card__text">
                        <h3>${title}</h3>
                        <p>${channel}</p>
                        <p>${views} views &middot; ${published}</p>
                    </div>
                </div>
            </a>`;
    }

    function showChannelError(message) {
        const main = document.getElementById('channelMain');
        if (main) {
            main.innerHTML = `
                <div class="dash-empty dash-empty--error" style="padding: 3rem; text-align: center;">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Couldn't load channel</h3>
                    <p>${escapeHtml(message)}</p>
                    <a href="index.html" class="btn btn--primary" style="margin-top: 1rem;">Back to Explore</a>
                </div>`;
        }
    }

    // ---------- Formatting helpers (shared with videos-feed.js) ----------
    function formatDuration(totalSeconds) {
        if (totalSeconds === null || totalSeconds === undefined) return '';
        const s = Math.max(0, Math.floor(totalSeconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
        const ss = String(sec).padStart(2, '0');
        return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    function formatCount(n) {
        if (!n) return '0';
        if (n < 1000) return String(n);
        if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
        return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
    }

    function timeAgo(isoString) {
        if (!isoString) return '';
        const then = new Date(isoString).getTime();
        if (Number.isNaN(then)) return '';
        const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
        const units = [
            ['year', 31536000],
            ['month', 2592000],
            ['week', 604800],
            ['day', 86400],
            ['hour', 3600],
            ['minute', 60],
        ];
        for (const [label, secs] of units) {
            const value = Math.floor(seconds / secs);
            if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
        }
        return 'just now';
    }

    // ---------- Init ----------
    // Load sidebar channels on any page that has the sidebar
    document.addEventListener('DOMContentLoaded', () => {
        loadSidebarChannels();
        loadChannelPage();
    });

    function initChannelTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                tabContents.forEach(content => content.style.display = 'none');
                const target = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
                if (target) target.style.display = 'block';
            });
        });
    }

    // Expose for other modules
    window.OrbitChannels = {
        loadSidebarChannels,
        loadChannelPage
    };
})();