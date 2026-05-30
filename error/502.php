<?php
$pageTitle = "502 - Bad Gateway";
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>502 - Bad Gateway | ORBIT</title>
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
            --accent: #9c27b0;
            --accent-glow: rgba(156, 39, 176, 0.25);
            --border-color: rgba(255, 255, 255, 0.08);
            --card-bg: #1a1a1e;
            --hover-bg: rgba(255, 255, 255, 0.05);
        }

        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --accent: #7b1fa2;
            --accent-glow: rgba(123, 31, 162, 0.15);
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

        .bridge {
            width: 140px;
            height: 100px;
            margin: 0 auto;
            position: relative;
        }

        .bridge-arch {
            width: 100%;
            height: 60px;
            border: 4px solid var(--accent);
            border-top: none;
            border-radius: 0 0 70px 70px;
            position: relative;
        }

        .bridge-cable {
            position: absolute;
            width: 2px;
            height: 50px;
            background: var(--accent);
            bottom: -50px;
            left: 30%;
        }

        .bridge-cable:nth-child(2) { left: 50%; }
        .bridge-cable:nth-child(3) { left: 70%; }

        .bridge-cable::after {
            content: '●';
            position: absolute;
            bottom: -8px;
            left: -5px;
            color: var(--accent);
            font-size: 10px;
        }

        .signal-wave {
            display: flex;
            gap: 4px;
            justify-content: center;
            margin-top: 20px;
        }

        .signal-wave span {
            width: 4px;
            height: 20px;
            background: var(--accent);
            border-radius: 2px;
            animation: wave 1s infinite;
        }

        .signal-wave span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
        .signal-wave span:nth-child(3) { animation-delay: 0.2s; height: 15px; }
        .signal-wave span:nth-child(4) { animation-delay: 0.3s; height: 25px; }
        .signal-wave span:nth-child(5) { animation-delay: 0.4s; height: 10px; }

        @keyframes wave {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
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
            background: #7b1fa2;
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
            <div class="bridge">
                <div class="bridge-arch"></div>
                <div class="bridge-cable"></div>
                <div class="bridge-cable"></div>
                <div class="bridge-cable"></div>
            </div>
            <div class="signal-wave">
                <span></span><span></span><span></span><span></span><span></span>
            </div>
        </div>

        <div class="error-code">502</div>
        <h1 class="error-title">Bad gateway</h1>
        <p class="error-message">
            The connection between our servers is having issues. Please try again in a few moments.
        </p>

        <div class="action-buttons">
            <button onclick="location.reload()" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                Try again
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
    </script>
</body>
</html>