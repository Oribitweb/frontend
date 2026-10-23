// search.js
(function() {
    const videoGrid = document.getElementById('searchVideoGrid');
    const loader = document.getElementById('searchLoader');
    const noResults = document.getElementById('noResults');
    const resultsCountSpan = document.getElementById('resultsCount');
    const API_BASE = window.API_BASE;

    if (!searchQuery) {
        loader.style.display = 'none';
        noResults.style.display = 'block';
        noResults.innerHTML = 'Please enter a search term.';
        return;
    }

    async function fetchSearchResults() {
        try {
            const url = `${API_BASE}/videos?search=${encodeURIComponent(searchQuery)}`;
            const res = await window.authorizedFetch(url);
            if (!res.ok) throw new Error('Failed to fetch videos');
            const data = await res.json();
            const videos = data.videos || (Array.isArray(data) ? data : []);
            // Add verified flag to some videos (mock for now)
            const videosWithVerified = videos.map((v, idx) => ({ ...v, verified: idx % 3 === 0 }));
            renderResults(videosWithVerified);
        } catch (err) {
            console.error(err);
            loader.style.display = 'none';
            noResults.style.display = 'block';
            noResults.innerHTML = 'Error loading results. Please try again later.';
        }
    }

    function renderResults(videos) {
        loader.style.display = 'none';
        if (!videos.length) {
            noResults.style.display = 'block';
            videoGrid.innerHTML = '';
            resultsCountSpan.textContent = '0 results';
            return;
        }
        noResults.style.display = 'none';
        resultsCountSpan.textContent = `${videos.length} result${videos.length !== 1 ? 's' : ''}`;

        videoGrid.innerHTML = videos.map(video => {
            const verifiedBadge = video.verified ? `<span class="verified-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>` : '';
            return `
                <article class="video-card" data-video-id="${video.id}" onclick="window.location.href='video.html?id=${encodeURIComponent(video.public_id || video.id)}'">
                    <div class="video-card__thumbnail">
                        <img src="${video.thumbnail_url || 'assets/thumbnail.png'}" alt="${escapeHtml(video.title)}">
                        <span class="video-card__duration">${formatDuration(video.duration_seconds)}</span>
                    </div>
                    <div class="video-card__info">
                        <div class="video-card__channel-img">${escapeHtml((video.channel_name || 'U')[0])}</div>
                        <div class="video-card__text">
                            <h3>${escapeHtml(video.title)}</h3>
                            <p>${escapeHtml(video.channel_name || 'Unknown')}${verifiedBadge}</p>
                            <p>${formatViews(video.views)} views • ${formatRelativeTime(video.created_at)}</p>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function formatDuration(seconds) {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        return `${m}:${s.toString().padStart(2,'0')}`;
    }

    function formatViews(views) {
        if (!views) return '0';
        if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
        if (views >= 1_000) return (views / 1_000).toFixed(1) + 'K';
        return views.toString();
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return 'recently';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'today';
        if (diff === 1) return 'yesterday';
        if (diff < 7) return `${diff} days ago`;
        if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
        if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
        return `${Math.floor(diff / 365)} years ago`;
    }

    fetchSearchResults();
})();