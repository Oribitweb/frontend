// config.js – Centralized API configuration
// Load this FIRST in all HTML pages before any other scripts

const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(location.hostname);
window.API_BASE = isLocal ? 'http://localhost:8000' : 'https://oribt.darkube.ir';
window.WS_BASE  = isLocal ? 'ws://localhost:8000'  : 'wss://oribt.darkube.ir';
