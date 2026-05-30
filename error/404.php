<?php
$pageTitle = "404 - Page Not Found";
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | ORBIT</title>
    <link rel="icon" type="image/png" href="../assets/img/favicon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #111111;
            --text-primary: #f1f1f1;
            --text-secondary: #9aa0a6;
            --text-tertiary: #5f6368;
            --accent: #00c853;
            --accent-glow: rgba(0, 200, 83, 0.25);
            --border-color: rgba(255, 255, 255, 0.08);
            --card-bg: #1a1a1e;
            --hover-bg: rgba(255, 255, 255, 0.05);
            --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --text-tertiary: #80868b;
            --accent: #00a844;
            --accent-glow: rgba(0, 168, 68, 0.15);
            --border-color: rgba(0, 0, 0, 0.08);
            --card-bg: #ffffff;
            --hover-bg: rgba(0, 0, 0, 0.03);
            --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Google Sans', Roboto, 'Helvetica Neue', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s, color 0.2s;
        }

        .error-container {
            max-width: 500px;
            padding: 48px 24px;
            text-align: center;
        }

        /* Animated astronaut */
        .error-illustration {
            margin-bottom: 48px;
            position: relative;
        }

        .astronaut {
            width: 160px;
            height: 160px;
            margin: 0 auto;
            position: relative;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .astronaut-helmet {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
            border-radius: 50%;
            margin: 0 auto;
            position: relative;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .astronaut-helmet::before {
            content: '';
            position: absolute;
            width: 60px;
            height: 60px;
            background: #2a2a3a;
            border-radius: 50%;
            top: 10px;
            left: 10px;
        }

        .astronaut-helmet::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            background: var(--accent);
            border-radius: 50%;
            top: 25px;
            left: 25px;
            opacity: 0.8;
            animation: glow 2s infinite;
        }

        @keyframes glow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }

        .astronaut-body {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
            border-radius: 40% 40% 50% 50%;
            margin: -20px auto 0;
            position: relative;
        }

        .stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--text-secondary);
            border-radius: 50%;
            animation: twinkle 2s infinite;
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }

        .search-message {
            font-size: 2rem;
            font-weight: 400;
            color: var(--text-primary);
            margin-bottom: 16px;
        }

        .search-message span {
            font-weight: 500;
            color: var(--accent);
        }

        .error-message {
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .search-box {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 40px;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
            transition: all 0.2s;
        }

        .search-box:focus-within {
            border-color: var(--accent);
            box-shadow: 0 0 0 2px var(--accent-glow);
        }

        .search-box svg {
            flex-shrink: 0;
            color: var(--text-secondary);
        }

        .search-box input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            font-size: 1rem;
            color: var(--text-primary);
            font-family: inherit;
        }

        .search-box input::placeholder {
            color: var(--text-tertiary);
        }

        .search-box button {
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--accent);
            font-weight: 500;
            font-size: 0.875rem;
            font-family: inherit;
        }

        .action-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 48px;
        }

        .btn {
            padding: 10px 24px;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--accent);
            color: #fff;
            border: none;
        }

        .btn-primary:hover {
            background: #00b347;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
        }

        .btn-secondary:hover {
            background: var(--hover-bg);
            border-color: var(--accent);
        }

        .suggestions {
            border-top: 1px solid var(--border-color);
            padding-top: 32px;
        }

        .suggestions p {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 12px;
        }

        .suggestion-links {
            display: flex;
            gap: 24px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .suggestion-links a {
            color: var(--accent);
            text-decoration: none;
            font-size: 0.875rem;
        }

        .suggestion-links a:hover {
            text-decoration: underline;
        }

        .theme-toggle {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .theme-toggle:hover {
            background: var(--hover-bg);
            transform: scale(1.05);
            color: var(--accent);
        }

        [data-theme="light"] .theme-icon-dark { display: none; }
        [data-theme="dark"] .theme-icon-light { display: none; }
        [data-theme="dark"] .theme-icon-dark { display: block; }
        [data-theme="light"] .theme-icon-light { display: block; }

        @media (max-width: 640px) {
            .search-message { font-size: 1.5rem; }
            .astronaut { transform: scale(0.8); }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-illustration">
            <div class="astronaut">
                <div class="astronaut-helmet"></div>
                <div class="astronaut-body"></div>
            </div>
            <div class="stars" id="stars"></div>
        </div>

        <div class="search-message">
            <span>404</span> — Page not found
        </div>
        <p class="error-message">
            The page you're looking for doesn't exist or has been moved to another galaxy.
        </p>

        <div class="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" id="searchInput" placeholder="Search ORBIT...">
            <button id="searchBtn">Search</button>
        </div>

        <div class="action-buttons">
            <button onclick="history.back()" class="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Go back
            </button>
            <a href="../index.php" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H9v7H5a2 2 0 0 1-2-2z"/>
                </svg>
                Explore home
            </a>
        </div>

        <div class="suggestions">
            <p>Suggested pages:</p>
            <div class="suggestion-links">
                <a href="../index.php">Explore</a>
                <a href="../trending.php">Trending</a>
                <a href="../lives.php">Live</a>
                <a href="../channel.php">Channels</a>
            </div>
        </div>
    </div>

    <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <span class="theme-icon-dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
        </span>
        <span class="theme-icon-light">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </span>
    </button>

    <script>
        // Theme handling
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('orbit-theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);

        document.getElementById('themeToggle').addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('orbit-theme', newTheme);
        });

        // Generate stars
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = '../search.php?q=' + encodeURIComponent(query);
            }
        }

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    </script>
</body>
</html>