<?php
$pageTitle = "403 - Access Forbidden";
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Access Forbidden | ORBIT</title>
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

        /* Lock animation */
        .error-illustration {
            margin-bottom: 48px;
        }

        .lock-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto;
            position: relative;
        }

        .lock-body {
            width: 80px;
            height: 60px;
            background: linear-gradient(135deg, #ff3b30, #cc2a20);
            border-radius: 16px;
            margin: 20px auto 0;
            position: relative;
        }

        .lock-shackle {
            width: 50px;
            height: 50px;
            border: 6px solid #ff3b30;
            border-radius: 50%;
            border-bottom: none;
            margin: 0 auto;
            position: relative;
            top: -25px;
            animation: shake 0.5s ease-in-out infinite;
            animation-play-state: paused;
        }

        .lock-icon:hover .lock-shackle {
            animation-play-state: running;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }

        .lock-keyhole {
            width: 16px;
            height: 16px;
            background: var(--bg-primary);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .lock-keyhole::after {
            content: '';
            position: absolute;
            width: 6px;
            height: 12px;
            background: var(--bg-primary);
            bottom: -12px;
            left: 5px;
        }

        .error-code {
            font-size: 6rem;
            font-weight: 500;
            letter-spacing: -2px;
            background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
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

        .login-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: left;
        }

        .login-card p {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 16px;
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
            <div class="lock-icon">
                <div class="lock-shackle"></div>
                <div class="lock-body">
                    <div class="lock-keyhole"></div>
                </div>
            </div>
        </div>

        <div class="error-code">403</div>
        <h1 class="error-title">Access denied</h1>
        <p class="error-message">
            You don't have permission to access this page. Sign in with an account that has the required permissions.
        </p>

        <div class="login-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px;">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="8" r="4"/>
                <path d="M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
            </svg>
            <p><strong>Need access?</strong> Sign in with your ORBIT account to continue.</p>
            <button onclick="window.location.href='../index.php?login=1'" class="btn btn-primary" style="width: 100%; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign in
            </button>
        </div>

        <div class="action-buttons">
            <button onclick="history.back()" class="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Go back
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