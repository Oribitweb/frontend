<?php
if (!isset($pageTitle)) $pageTitle = 'ORBIT';
if (!isset($extraCSS)) $extraCSS = '';
if (!isset($logoImg)) $logoImg = 'assets/img/logo.png';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <link rel="icon" type="image/png" href="assets/img/favicon.png">
    <?php echo $extraCSS; ?>
</head>
<body>

    <div class="overlay" id="overlay"></div>

    <header class="header" id="header">
        <div class="header__inner">
            <a href="index.php" class="header__logo" aria-label="ORBIT Home">
                <img src="<?php echo $logoImg; ?>" alt="ORBIT Logo" class="header__logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <span class="header__logo-fallback" style="display:none;">
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="20" cy="20" r="6" fill="currentColor"/><ellipse cx="20" cy="20" rx="17" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(-30 20 20)"/></svg>
                    <span>ORBIT</span>
                </span>
            </a>

            <div class="header__search">
                <input type="text" class="header__search-input" placeholder="Search & Find...">
                <button class="header__search-btn" aria-label="Search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>

            <div class="header__actions">
                <div class="create-container">
                    <button class="header__create-btn" id="createBtn" title="Create">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <div class="create-dropdown" id="createDropdown">
                        <a href="index.php?popup=uploadVideo" class="dropdown__item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Upload Video
                        </a>
                        <a href="index.php?popup=uploadShort" class="dropdown__item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><polyline points="8 13 10 15 12 13"/></svg>
                            Short Video
                        </a>
                        <a href="index.php?popup=newPost" class="dropdown__item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            New Post
                        </a>
                    </div>
                </div>

                <button class="header__profile-btn" id="profileBtn" aria-label="Profile Menu">
                    <div class="header__profile-avatar" id="profileAvatar">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
                    </div>
                </button>

                <!-- منوی پروفایل که توسط جاوااسکریپت پر می‌شود -->
                <div class="dropdown" id="profileDropdown"></div>
            </div>
        </div>
    </header>