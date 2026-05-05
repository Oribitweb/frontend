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

                <div class="dropdown" id="profileDropdown">
                    <div class="dropdown__section">
                        <p class="dropdown__label">Account</p>
                        <a href="index.php?popup=login" class="dropdown__item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Log In
                        </a>
                        <a href="index.php?popup=signup" class="dropdown__item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                            Sign Up
                        </a>
                    </div>
                    <div class="dropdown__divider"></div>
                    <div class="dropdown__section">
                        <p class="dropdown__label">Appearance</p>
                        <button class="dropdown__item dropdown__theme-toggle" id="themeToggle">
                            <span class="dropdown__theme-icon-dark">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                            </span>
                            <span class="dropdown__theme-icon-light">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            </span>
                            <span id="themeLabel">Light Mode</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>