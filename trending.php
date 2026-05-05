<?php
$pageTitle = "ORBIT — Trending";
$extraCSS = '<link rel="stylesheet" href="css/trending.css">';
$activePage = 'Trending';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="trending-main" id="trendingMain">
    <div class="trending-header">
        <div class="trending-header__info">
            <h1 class="trending-title">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                Trending
            </h1>
            <p class="trending-subtitle">The most popular videos on ORBIT right now</p>
        </div>
        <div class="trending-header__actions">
            <select class="trending-region-select" id="regionSelect">
                <option value="global">🌍 Global</option>
                <option value="ir">🇮🇷 Iran</option>
                <option value="us">🇺🇸 United States</option>
                <option value="uk">🇬🇧 United Kingdom</option>
                <option value="de">🇩🇪 Germany</option>
                <option value="fr">🇫🇷 France</option>
            </select>
        </div>
    </div>

    <div class="category-pills" id="categoryPills">
        <button class="category-pill category-pill--active" data-category="all">All</button>
        <button class="category-pill" data-category="music">Music</button>
        <button class="category-pill" data-category="gaming">Gaming</button>
        <button class="category-pill" data-category="science">Science</button>
        <button class="category-pill" data-category="technology">Technology</button>
        <button class="category-pill" data-category="sports">Sports</button>
        <button class="category-pill" data-category="education">Education</button>
        <button class="category-pill" data-category="entertainment">Entertainment</button>
        <button class="category-pill" data-category="news">News</button>
    </div>

    <div class="trending-list" id="trendingList"></div>

    <div class="trending-load-more" id="trendingLoadMore">
        <button class="btn btn--primary load-more-btn" id="loadMoreBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Load More
        </button>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<script src="js/trending.js"></script>
</body>
</html>