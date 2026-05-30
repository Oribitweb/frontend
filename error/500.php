<?php
$pageTitle = "500 - Internal Server Error";
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Internal Server Error | ORBIT</title>
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
            --shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            --shadow-lg: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
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
            --shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
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
            max-width: 600px;
            padding: 48px 24px;
            text-align: center;
        }

        /* Animated illustration */
        .error-illustration {
            margin-bottom: 48px;
            position: relative;
        }

        .server-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto;
            position: relative;
        }

        .server-rack {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--card-bg), var(--bg-secondary));
            border-radius: 20px;
            border: 2px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }

        .rack-lines {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 20px;
        }

        .rack-lines span {
            display: block;
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            width: 100%;
            animation: pulse 2s infinite;
        }

        .rack-lines span:nth-child(2) { width: 80%; animation-delay: 0.3s; }
        .rack-lines span:nth-child(3) { width: 60%; animation-delay: 0.6s; }
        .rack-lines span:nth-child(4) { width: 70%; animation-delay: 0.9s; }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }

        .warning-light {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            background: #ff3b30;
            border-radius: 50%;
            animation: blink 1s infinite;
            box-shadow: 0 0 10px #ff3b30;
        }

        @keyframes blink {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
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
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 32px;
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
            box-shadow: var(--shadow-sm);
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

        .error-details {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 16px 20px;
            text-align: left;
            margin-bottom: 32px;
        }

        .error-details summary {
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            user-select: none;
        }

        .error-details summary:hover {
            color: var(--accent);
        }

        .error-details code {
            display: block;
            margin-top: 12px;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            overflow-x: auto;
            padding: 8px;
            background: var(--bg-secondary);
            border-radius: 8px;
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

        .theme-toggle svg {
            width: 20px;
            height: 20px;
        }

        [data-theme="light"] .theme-icon-dark { display: none; }
        [data-theme="dark"] .theme-icon-light { display: none; }
        [data-theme="dark"] .theme-icon-dark { display: block; }
        [data-theme="light"] .theme-icon-light { display: block; }

        @media (max-width: 640px) {
            .error-container { padding: 32px 20px; }
            .error-code { font-size: 4rem; }
            .error-title { font-size: 1.35rem; }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-illustration">
            <div class="server-icon">
                <div class="server-rack">
                    <div class="rack-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div class="warning-light"></div>
            </div>
        </div>

        <div class="error-code">500</div>
        <h1 class="error-title">Something went wrong</h1>
        <p class="error-message">
            Our servers are having trouble processing your request. Please try again in a few moments.
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
                Go home
            </a>
        </div>

        <details class="error-details">
            <summary>Technical details</summary>
            <code>Error ID: <?php echo uniqid('ERR_500_'); ?><br>Timestamp: <?php echo date('Y-m-d H:i:s'); ?></code>
        </details>
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
    </script>
</body>
</html>