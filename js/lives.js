// lives.js – Lives Page (only live streams grid & featured)
(function() {
    const featuredCard = document.getElementById('featuredCard');
    const featuredDots = document.getElementById('featuredDots');
    const topStreamsGrid = document.getElementById('topStreamsGrid');
    const remainingStreamsGrid = document.getElementById('remainingStreamsGrid');
    const liveSearchInput = document.getElementById('liveSearchInput');
    const toastContainer = document.getElementById('toastContainer');

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
            </div>`;
        featuredCard.onclick = () => window.location.href = stream.url;
        featuredDots.innerHTML = top3.map((_, i) => `<span class="featured-dot ${i === index ? 'active' : ''}"></span>`).join('');
    }
    function nextFeatured() { currentIndex = (currentIndex + 1) % top3.length; renderFeatured(currentIndex); }
    function startFeaturedCycle() { featuredInterval = setInterval(nextFeatured, 4000); }
    function stopFeaturedCycle() { clearInterval(featuredInterval); }
    renderFeatured(0);
    startFeaturedCycle();
    featuredCard.addEventListener('mouseenter', stopFeaturedCycle);
    featuredCard.addEventListener('mouseleave', startFeaturedCycle);

    function createSmallCard(stream) {
        return `<div class="live-card-small" onclick="window.location.href='${stream.url}'">
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
        </div>`;
    }

    function renderAllSections(streams) {
        const sortedStreams = [...streams].sort((a, b) => b.viewers - a.viewers);
        topStreamsGrid.innerHTML = sortedStreams.slice(3, 9).map(createSmallCard).join('');
        remainingStreamsGrid.innerHTML = sortedStreams.slice(9).map(createSmallCard).join('');
        if (typeof window.updateCategories === 'function') {
            window.updateCategories(streams);
        }
    }
    renderAllSections(liveStreams);

    liveSearchInput.addEventListener('input', () => {
        const query = liveSearchInput.value.toLowerCase();
        const filtered = liveStreams.filter(s => s.title.toLowerCase().includes(query) || s.channel.toLowerCase().includes(query));
        renderAllSections(filtered);
    });
})();