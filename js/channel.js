// channel.js – Channel Page
(function() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    const videoGrid = document.getElementById('fullVideoGrid');
    const homeVideoGrid = document.getElementById('homeVideoGrid');
    const latestVideoGrid = document.getElementById('latestVideoGrid');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const toastContainer = document.getElementById('toastContainer');

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

    function parseViews(viewStr) {
        const num = parseFloat(viewStr);
        return viewStr.includes('K') ? num * 1000 : num;
    }
    function renderVideoCard(v) {
        return `<div class="video-card">
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
        </div>`;
    }
    function renderVideosSorted(sortType = 'latest') {
        let sorted = [...videos];
        if (sortType === 'popular') sorted.sort((a, b) => parseViews(b.views) - parseViews(a.views));
        else if (sortType === 'oldest') sorted.reverse();
        videoGrid.innerHTML = sorted.map(renderVideoCard).join('');
    }
    function renderAll() {
        const popularSorted = [...videos].sort((a, b) => parseViews(b.views) - parseViews(a.views));
        homeVideoGrid.innerHTML = popularSorted.slice(0, 5).map(renderVideoCard).join('');
        latestVideoGrid.innerHTML = videos.slice(5, 10).map(renderVideoCard).join('');
        renderVideosSorted('latest');
    }
    renderAll();

    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderVideosSorted(btn.dataset.sort);
        });
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            tabContents.forEach(content => content.style.display = 'none');
            document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).style.display = 'block';
        });
    });

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
            window.showToast('Subscribed! 🎉');
        } else {
            subscribed = false;
            subscribeBtn.textContent = 'Subscribe';
            subscribeBtn.classList.remove('subscribed');
            notificationBellBtn.style.display = 'none';
            window.showToast('Unsubscribed');
        }
    });
    notificationBellBtn.addEventListener('click', () => {
        notificationOn = !notificationOn;
        updateBellIcon();
        window.showToast(notificationOn ? 'Notifications turned on' : 'Notifications turned off');
    });
    function updateBellIcon() {
        if (notificationOn) notificationBellBtn.classList.remove('active');
        else notificationBellBtn.classList.add('active');
    }
})();