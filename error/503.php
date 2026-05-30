<?php
$pageTitle = "503 - Service Unavailable";
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>503 - Service Unavailable | ORBIT</title>
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
            --accent: #ff9800;
            --accent-glow: rgba(255, 152, 0, 0.25);
            --border-color: rgba(255, 255, 255, 0.08);
            --card-bg: #1a1a1e;
            --hover-bg: rgba(255, 255, 255, 0.05);
        }

        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --accent: #e65100;
            --accent-glow: rgba(230, 81, 0, 0.15);
            --border-color: rgba(0, 0, 0, 0.08);
            --card-bg: #ffffff;
            --hover-bg: rgba(0, 0, 0, 0.03);
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

        .error-illustration {
            margin-bottom: 48px;
        }

        .construction {
            width: 140px;
            height: 140px;
            margin: 0 auto;
            position: relative;
        }

        .gear {
            width: 60px;
            height: 60px;
            background: var(--accent);
            border-radius: 50%;
            position: absolute;
            opacity: 0.8;
        }

        .gear::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: var(--bg-primary);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .gear-1 {
            top: 20px;
            left: 20px;
            animation: spin 4s linear infinite;
        }

        .gear-2 {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            animation: spin 3s linear infinite reverse;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .error-code {
            font-size: 6rem;
            font-weight: 500;
            letter-spacing: -2px;
            color: var(--accent);
            margin-bottom: 16px;
        }

        .error-title {
            font-size: 1.75rem;
            font-weight: 400;
            color: var(--text-primary);
            margin-bottom: 16px;
        }

        .error-message {
            color: var(--text-secondary);
            font-size: 0.875rem;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .progress-container {
            background: var(--bg-secondary);
            border-radius: 100px;
            height: 4px;
            width: 100%;
            margin-bottom: 32px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), #ffcc00);
            width: 0%;
            transition: width 0.3s linear;
            border-radius: 100px;
        }

        .action-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
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
            background: #e65100;
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
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-illustration">
            <div class="construction">
                <div class="gear gear-1"></div>
                <div class="gear gear-2"></div>
            </div>
        </div>

        <div class="error-code">503</div>
        <h1 class="error-title">We'll be back soon</h1>
        <p class="error-message">
            ORBIT is currently undergoing maintenance or experiencing high traffic. We're working to restore service as quickly as possible.
        </p>

        <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 32px;" id="retryMessage">Auto-retry in 30 seconds...</p>

        <div class="action-buttons">
            <button onclick="location.reload()" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                Try now
            </button>
            <a href="../index.php" class="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H9v7H5a2 2 0 0 1-2-2z"/>
                </svg>
                Home
            </a>
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
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('orbit-theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);

        document.getElementById('themeToggle').addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('orbit-theme', newTheme);
        });

        let seconds = 30;
        const progressBar = document.getElementById('progressBar');
        const retryMessage = document.getElementById('retryMessage');

        const interval = setInterval(() => {
            seconds--;
            const percent = ((30 - seconds) / 30) * 100;
            progressBar.style.width = percent + '%';
            retryMessage.textContent = `Auto-retry in ${seconds} seconds...`;

            if (seconds <= 0) {
                clearInterval(interval);
                location.reload();
            }
        }, 1000);
    </script>
</body>
</html>