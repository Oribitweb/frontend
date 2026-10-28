// config.js – Centralized API configuration
// Load this FIRST in all HTML pages before any other scripts

const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(location.hostname);
const useHttps = location.protocol === 'https:' || !isLocal;
window.API_BASE = isLocal ? 'http://localhost:8000' : (useHttps ? 'https://oribt.darkube.ir' : 'http://oribt.darkube.ir');
window.WS_BASE  = isLocal ? 'ws://localhost:8000'  : (useHttps ? 'wss://oribt.darkube.ir' : 'ws://oribt.darkube.ir');
