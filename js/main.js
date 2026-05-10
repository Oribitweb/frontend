// main.js – Home page feed and category pills
(function() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    // ===== Helper functions to generate feed data =====
    function generateLongVideo(num, isTrend = false) {
        return {
            type: 'video',
            title: `Video Title ${num}`,
            channel: `Channel Name ${num}`,
            views: '0',
            time: 'Now',
            duration: '10:00',
            isTrend
        };
    }

    function generateShort(num) {
        return {
            type: 'short',
            title: `Short ${num}`,
            channel: `Channel Name ${num}`,
            views: '0'
        };
    }

    function generatePost(num) {
        return {
            type: 'post',
            author: `Channel Name ${num}`,
            time: 'Now',
            content: `Community post content #${num}.`,
            image: null
        };
    }

    // ===== Build sample feed =====
    const feedData = [];

    // First item as trending
    feedData.push(generateLongVideo(1, true));

    // More videos
    for (let i = 2; i <= 5; i++) feedData.push(generateLongVideo(i));
    for (let i = 6; i <= 10; i++) feedData.push(generateLongVideo(i));

    // Shorts
    for (let i = 1; i <= 5; i++) feedData.push(generateShort(i));

    // Community posts
    for (let i = 1; i <= 5; i++) feedData.push(generatePost(i));

    // Even more videos
    for (let i = 11; i <= 25; i++) feedData.push(generateLongVideo(i));

    // ===== Render feed =====
    function renderFeed() {
        videoGrid.innerHTML = feedData.map(item => {
            if (item.type === 'video') {
                const trendClass = item.isTrend ? ' video-card--trend' : '';
                const trendBadge = item.isTrend ? '<span class="trend-badge">Most Trend</span>' : '';
                return `<article class="video-card${trendClass}">
                    <div class="video-card__thumbnail">
                        <div style="background:linear-gradient(135deg,#1a2a3a,#0f3a2b);height:100%"></div>
                        ${trendBadge}
                        <span class="video-card__duration">${item.duration}</span>
                    </div>
                    <div class="video-card__info">
                        <div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div>
                        <div class="video-card__text">
                            <h3>${escapeHtml(item.title)}</h3>
                            <p>${escapeHtml(item.channel)}</p>
                            <p>${escapeHtml(item.views)} views · ${escapeHtml(item.time)}</p>
                        </div>
                    </div>
                </article>`;
            } else if (item.type === 'short') {
                return `<article class="video-card video-card--short">
                    <div class="video-card__thumbnail">
                        <div style="background:linear-gradient(135deg,#2a1a3a,#0f2a2b);height:100%"></div>
                    </div>
                    <div class="video-card__info">
                        <div class="video-card__channel-img">${escapeHtml(item.channel.charAt(0))}</div>
                        <div class="video-card__text">
                            <h3>${escapeHtml(item.title)}</h3>
                            <p>${escapeHtml(item.channel)}</p>
                            <p>${escapeHtml(item.views)} views</p>
                        </div>
                    </div>
                </article>`;
            } else {
                return `<article class="post-card">
                    <div class="post-card__header">
                        <div class="post-card__avatar">${escapeHtml(item.author.charAt(0))}</div>
                        <div>
                            <div class="post-card__author">${escapeHtml(item.author)}</div>
                            <div class="post-card__time">${escapeHtml(item.time)}</div>
                        </div>
                    </div>
                    <div class="post-card__content">${escapeHtml(item.content)}</div>
                </article>`;
            }
        }).join('');
    }

    renderFeed();

    // ===== Category Pills =====
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', function () {
            document.querySelector('.category-pill--active')?.classList.remove('category-pill--active');
            this.classList.add('category-pill--active');
        });
    });

})();