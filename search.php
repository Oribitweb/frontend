<?php
$pageTitle = "ORBIT — Search Results";
$extraCSS = '<link rel="stylesheet" href="css/main.css"><link rel="stylesheet" href="css/search.css">';
$activePage = '';
include 'includes/header.php';
include 'includes/sidebar.php';

$searchQuery = isset($_GET['q']) ? trim($_GET['q']) : '';
?>

<main class="main-content" id="searchMain">
    <div class="search-header">
        <h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Results for:
            <span><?php echo htmlspecialchars($searchQuery ?: '(empty)'); ?></span>
        </h1>
        <p class="results-count" id="resultsCount"></p>
    </div>

    <div class="video-grid" id="searchVideoGrid"></div>
    <div id="searchLoader">🔍 Searching...</div>
    <div id="noResults" style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="12"/>
            <line x1="11" y1="16" x2="11.01" y2="16"/>
        </svg>
        <p>No videos found</p>
        <small>Try a different keyword</small>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
<script>
    const searchQuery = <?php echo json_encode($searchQuery); ?>;
</script>
<script src="js/search.js"></script>
</body>
</html>