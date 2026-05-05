<?php
$pageTitle = "ORBIT — Live Streams";
$extraCSS = '<link rel="stylesheet" href="css/lives.css">';
$logoImg = 'assets/img/logolive.png';
$activePage = 'Live';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="lives-grid" id="livesGrid">
    <section class="featured-section" id="featuredSection">
        <div class="featured-card" id="featuredCard"></div>
        <div class="featured-dots" id="featuredDots"></div>
        <a href="#" class="go-live-btn" id="goLiveBtn">GO LIVE!</a>
    </section>

    <section class="top-streams">
        <h2 class="section-title">Top Live Now</h2>
        <div class="streams-grid" id="topStreamsGrid"></div>
    </section>

    <section class="categories-row">
        <h2 class="section-title">Categories</h2>
        <div class="categories-grid" id="categoriesGrid"></div>
        <button class="btn btn--text show-more-categories" id="showMoreCategories" style="display:none;">Show more</button>
    </section>

    <section class="remaining-streams">
        <h2 class="section-title">More Streams</h2>
        <div class="streams-grid" id="remainingStreamsGrid"></div>
    </section>
</main>

<?php include 'includes/footer.php'; ?>
<script src="js/categories.js"></script>
<script src="js/lives.js"></script>
</body>
</html>