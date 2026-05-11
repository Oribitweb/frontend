// orby.js – Orby Donation System with full feature restrictions
(function() {
    const ORBY_LEVELS = [
        { amount: 30, price: "20,000 T", effect: "none", features: { message: false, emoji: false, gif: false, voice: false }, image: "bronze" },
        { amount: 75, price: "60,000 T", effect: "fire", features: { message: true, emoji: true, gif: false, voice: false }, image: "silver" },
        { amount: 150, price: "150,000 T", effect: "explosion", features: { message: true, emoji: true, gif: false, voice: false }, image: "gold" },
        { amount: 300, price: "300,000 T", effect: "money", features: { message: true, emoji: true, gif: true, voice: false }, image: "diamond" },
        { amount: 900, price: "700,000 T", effect: "explosion+money", features: { message: true, emoji: true, gif: true, voice: true }, image: "mythic" }
    ];

    let currentSelectedLevel = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordedBlob = null;
    let isRecording = false;

    // DOM elements
    const orbyBtn = document.getElementById('orbyBtn');
    const selectionOverlay = document.getElementById('orbySelectionOverlay');
    const levelsGrid = document.getElementById('orbyLevelsGrid');
    const closeSelectionBtn = document.getElementById('orbyCloseBtn');
    const donationModal = document.getElementById('orbyDonationModal');
    const modalClose = document.getElementById('orbyModalCloseBtn');
    const confirmBtn = document.getElementById('orbyConfirmBtn');
    const cancelBtn = document.getElementById('orbyCancelBtn');
    const donationAmountTitle = document.getElementById('donationAmountTitle');
    const orbyMessageInput = document.getElementById('orbyMessageInput');
    const orbyEmojiTools = document.getElementById('orbyEmojiTools');
    const orbyEmojiBtn = document.getElementById('orbyEmojiBtn');
    const orbyGifBtn = document.getElementById('orbyGifBtn');
    const orbyVoiceTool = document.getElementById('orbyVoiceTool');
    const orbyRecordBtn = document.getElementById('orbyRecordBtn');
    const orbyRecordingStatus = document.getElementById('orbyRecordingStatus');
    const orbyEmojiPicker = document.getElementById('orbyEmojiPicker');
    const orbyEmojiGrid = document.getElementById('orbyEmojiGrid');

    function showToast(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Build level cards
    function buildLevelCards() {
        levelsGrid.innerHTML = ORBY_LEVELS.map(level => {
            let featureClass = '';
            if (level.effect === 'fire') featureClass = 'feature-fire';
            if (level.effect === 'explosion') featureClass = 'feature-explosion';
            if (level.effect === 'money') featureClass = 'feature-money';
            if (level.effect === 'explosion+money') featureClass = 'feature-money';
            const imagePath = `assets/img/orby/orby${level.image}.png`;
            return `
                <div class="orby-level-card ${featureClass}" data-amount="${level.amount}">
                    <div class="level-icon" style="background-image: url('${imagePath}');"></div>
                    <div class="level-amount">${level.amount} Orby</div>
                    <div class="level-price">${level.price}</div>
                    <div class="level-feature">${level.features.message ? '📝 Message' : '🔇 No message'}</div>
                    <div class="level-feature">${level.features.emoji ? '😀 Emoji' : '🚫 No emoji'}</div>
                    <div class="level-feature">${level.features.gif ? '🎞️ GIF' : '🚫 No GIF'}</div>
                    <div class="level-feature">${level.features.voice ? '🎙️ Voice note' : '🚫 No voice'}</div>
                </div>
            `;
        }).join('');
        document.querySelectorAll('.orby-level-card').forEach(card => {
            card.addEventListener('click', () => {
                const amount = parseInt(card.dataset.amount);
                selectLevel(amount);
            });
        });
    }

    function selectLevel(amount) {
        const level = ORBY_LEVELS.find(l => l.amount === amount);
        if (!level) return;
        currentSelectedLevel = level;
        selectionOverlay.classList.remove('active');
        
        donationAmountTitle.textContent = `Send ${level.amount} Orby`;
        
        // Handle message input
        if (level.features.message) {
            orbyMessageInput.disabled = false;
            orbyMessageInput.placeholder = "Write a message to the streamer...";
            orbyMessageInput.value = '';
        } else {
            orbyMessageInput.disabled = true;
            orbyMessageInput.placeholder = "Messages not allowed for this level";
            orbyMessageInput.value = '';
        }
        
        // Show/hide emoji tools container (only if either emoji or gif is allowed)
        const showTools = level.features.emoji || level.features.gif;
        orbyEmojiTools.style.display = showTools ? 'flex' : 'none';
        
        // Individual buttons
        if (orbyEmojiBtn) orbyEmojiBtn.style.display = level.features.emoji ? 'inline-flex' : 'none';
        if (orbyGifBtn) orbyGifBtn.style.display = level.features.gif ? 'inline-flex' : 'none';
        
        // Voice tools
        orbyVoiceTool.style.display = level.features.voice ? 'block' : 'none';
        
        // Reset recorded voice
        recordedBlob = null;
        const existingPreview = document.getElementById('orbyAudioPreview');
        if (existingPreview) existingPreview.remove();
        if (orbyRecordingStatus) orbyRecordingStatus.textContent = '';
        
        donationModal.classList.add('active');
    }

    // Visual effects (unchanged)
    function triggerEffect(level) {
        const effect = level.effect;
        const canvas = document.createElement('canvas');
        canvas.className = 'orby-effect-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        if (effect === 'fire') {
            let particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * canvas.width, y: canvas.height - Math.random() * 100,
                    radius: Math.random() * 8 + 2, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 5 - 2,
                    color: `hsl(${Math.random() * 30 + 20}, 100%, 60%)`
                });
            }
            function drawFire() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let alive = false;
                particles.forEach(p => {
                    p.x += p.vx; p.y += p.vy; p.vy += 0.2;
                    if (p.y < canvas.height && p.y > 0) alive = true;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
                    ctx.fillStyle = p.color; ctx.fill();
                });
                if (alive) requestAnimationFrame(drawFire);
                else canvas.remove();
            }
            drawFire();
            setTimeout(() => canvas.remove(), 2000);
        } else if (effect === 'explosion') {
            for (let i = 0; i < 150; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 12 + 2;
                let vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
                let life = 1;
                const div = document.createElement('div');
                div.style.cssText = `position:fixed;width:6px;height:6px;background:hsl(${Math.random()*360},80%,60%);border-radius:50%;left:${canvas.width/2}px;top:${canvas.height/2}px;pointer-events:none;`;
                document.body.appendChild(div);
                function move() {
                    if (life <= 0) { div.remove(); return; }
                    life -= 0.03;
                    div.style.left = (parseFloat(div.style.left) + vx) + 'px';
                    div.style.top = (parseFloat(div.style.top) + vy) + 'px';
                    div.style.opacity = life;
                    requestAnimationFrame(move);
                }
                move();
            }
            setTimeout(() => canvas.remove(), 1000);
        } else if (effect === 'money') {
            for (let i = 0; i < 60; i++) {
                const coin = document.createElement('div');
                coin.innerHTML = '💰';
                coin.style.cssText = `position:fixed;font-size:24px;left:${Math.random()*canvas.width}px;top:-30px;pointer-events:none;opacity:0.8;`;
                document.body.appendChild(coin);
                let y = -30;
                function fall() { y += 5; coin.style.top = y + 'px'; if (y < canvas.height+30) requestAnimationFrame(fall); else coin.remove(); }
                fall();
            }
            setTimeout(() => canvas.remove(), 3000);
        } else {
            canvas.remove();
        }
    }

    // Emoji formatting – only if allowed by level features
    function replaceEmojis(text, gifSet, staticMap, allowEmoji, allowGif) {
        if (!allowEmoji && !allowGif) return text;
        return text.replace(/:([a-zA-Z0-9_]+):/g, (match, name) => {
            const gifFile = name + '.gif';
            if (allowGif && gifSet.has(gifFile)) {
                return `<img class="emoji-inline" src="assets/emoji/gif/${gifFile}" alt="${name}">`;
            }
            if (allowEmoji && staticMap.has(name)) {
                const ext = staticMap.get(name);
                if (ext === 'webp') {
                    return `<img class="emoji-inline" src="assets/emoji/${name}.webp" alt="${name}">`;
                } else {
                    return `<img class="emoji-inline" src="assets/emoji/${name}.png" alt="${name}">`;
                }
            }
            return match;
        });
    }

    function loadStaticEmojiMap() {
        const staticNames = ['happy','sad','shocked','like','dislike','thank','angry','stupid','ok','iran'];
        const map = new Map();
        staticNames.forEach(name => map.set(name, 'png'));
        return map;
    }

    function addOrbyMessage(username, amount, messageText, extraHtml, gifSet, staticMap, allowEmoji, allowGif) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message orby-message';
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let formattedText = replaceEmojis(messageText, gifSet, staticMap, allowEmoji, allowGif);
        msgDiv.innerHTML = `
            <div class="chat-avatar">${escapeHtml(username[0])}</div>
            <div class="chat-content">
                <div><span class="chat-author">${escapeHtml(username)}</span><span class="chat-time"> ${now}</span></div>
                <div class="chat-text">${formattedText}</div>
                ${extraHtml || ''}
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Custom voice player (SVG buttons)
    function createCustomVoicePlayer(blob) {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        const container = document.createElement('div');
        container.className = 'orby-voice-player';
        container.innerHTML = `
            <button class="voice-play-btn">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            </button>
            <div class="voice-progress"><div class="voice-progress-fill"></div></div>
            <span class="voice-time">0:00 / 0:00</span>
        `;
        const playBtn = container.querySelector('.voice-play-btn');
        const progressFill = container.querySelector('.voice-progress-fill');
        const timeSpan = container.querySelector('.voice-time');
        let isPlaying = false;
        let interval;

        function formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }
        function updateProgress() {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = percent + '%';
                timeSpan.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
            }
        }
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                isPlaying = false;
                clearInterval(interval);
            } else {
                audio.play();
                playBtn.innerHTML = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
                isPlaying = true;
                interval = setInterval(updateProgress, 200);
            }
        });
        audio.addEventListener('ended', () => {
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            isPlaying = false;
            clearInterval(interval);
            progressFill.style.width = '0%';
            timeSpan.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });
        audio.addEventListener('loadedmetadata', () => {
            timeSpan.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });
        return container;
    }

    // Voice recording
    function setupVoiceRecording() {
        if (!orbyRecordBtn) return;
        orbyRecordBtn.addEventListener('click', async () => {
            if (!currentSelectedLevel || !currentSelectedLevel.features.voice) {
                showToast('Voice notes not allowed for this level');
                return;
            }
            if (isRecording) {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    isRecording = false;
                    orbyRecordBtn.innerHTML = '🎙️ Record Voice (max 30s)';
                    orbyRecordingStatus.textContent = 'Recording stopped.';
                }
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    recordedBlob = audioBlob;
                    const oldPreview = document.getElementById('orbyAudioPreview');
                    if (oldPreview) oldPreview.remove();
                    const previewDiv = document.createElement('div');
                    previewDiv.id = 'orbyAudioPreview';
                    previewDiv.appendChild(createCustomVoicePlayer(audioBlob));
                    orbyVoiceTool.appendChild(previewDiv);
                    orbyRecordingStatus.textContent = 'Voice recorded!';
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                isRecording = true;
                orbyRecordBtn.innerHTML = '⏹️ Stop Recording';
                orbyRecordingStatus.textContent = 'Recording... max 30s';
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        isRecording = false;
                        orbyRecordBtn.innerHTML = '🎙️ Record Voice (max 30s)';
                        orbyRecordingStatus.textContent = 'Recording timed out (30s).';
                    }
                }, 30000);
            } catch (err) {
                console.error(err);
                showToast('Microphone access denied.');
            }
        });
    }

    // Emoji Picker (static + gif) – only shown when allowed
    function buildOrbyEmojiPicker() {
        const staticNames = ['happy','sad','shocked','like','dislike','thank','angry','stupid','ok','iran'];
        const gifEmojis = window.gifEmojis || [];
        orbyEmojiGrid.innerHTML = '';
        staticNames.forEach(name => {
            const img = document.createElement('img');
            img.src = `assets/emoji/${name}.png`;
            img.alt = name;
            img.title = name;
            img.dataset.name = name;
            img.addEventListener('click', () => {
                if (currentSelectedLevel && !currentSelectedLevel.features.emoji) {
                    showToast('Emojis not allowed for this level');
                    return;
                }
                orbyMessageInput.value += `:${name}:`;
                orbyEmojiPicker.classList.remove('active');
                orbyMessageInput.focus();
            });
            orbyEmojiGrid.appendChild(img);
        });
        gifEmojis.forEach(gifFile => {
            const name = gifFile.split('.')[0];
            const img = document.createElement('img');
            img.src = `assets/emoji/gif/${gifFile}`;
            img.alt = name;
            img.title = name;
            img.dataset.name = name;
            img.addEventListener('click', () => {
                if (currentSelectedLevel && !currentSelectedLevel.features.gif) {
                    showToast('GIF emojis not allowed for this level');
                    return;
                }
                orbyMessageInput.value += `:${name}:`;
                orbyEmojiPicker.classList.remove('active');
                orbyMessageInput.focus();
            });
            orbyEmojiGrid.appendChild(img);
        });
    }

    function initOrbyEmojiTools() {
        if (orbyEmojiBtn) {
            orbyEmojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentSelectedLevel && !currentSelectedLevel.features.emoji) {
                    showToast('Emojis not allowed for this level');
                    return;
                }
                orbyEmojiPicker.classList.toggle('active');
            });
        }
        document.getElementById('orbyEmojiPickerClose')?.addEventListener('click', () => {
            orbyEmojiPicker.classList.remove('active');
        });
        if (orbyGifBtn) {
            orbyGifBtn.addEventListener('click', () => {
                if (currentSelectedLevel && !currentSelectedLevel.features.gif) {
                    showToast('GIF emojis not allowed for this level');
                    return;
                }
                orbyEmojiPicker.classList.toggle('active');
            });
        }
        document.addEventListener('click', (e) => {
            if (!orbyEmojiPicker.contains(e.target) && e.target !== orbyEmojiBtn && e.target !== orbyGifBtn) {
                orbyEmojiPicker.classList.remove('active');
            }
        });
        buildOrbyEmojiPicker();
    }

    // Send donation
    async function sendDonation() {
        if (!currentSelectedLevel) return;
        
        // If message not allowed, ignore any input
        let message = '';
        if (currentSelectedLevel.features.message) {
            message = orbyMessageInput.value.trim();
        } else {
            message = '';
        }
        
        let extraHtml = '';
        if (recordedBlob && currentSelectedLevel.features.voice) {
            const voiceContainer = createCustomVoicePlayer(recordedBlob);
            extraHtml = '<div style="margin-top:8px;"></div>';
            extraHtml += voiceContainer.outerHTML;
        } else if (recordedBlob && !currentSelectedLevel.features.voice) {
            showToast('Voice notes not allowed for this level. Voice will not be sent.');
            recordedBlob = null;
        }
        
        const username = (window.currentUser && window.currentUser.username) ? window.currentUser.username : 'Anonymous';
        const amount = currentSelectedLevel.amount;
        let fullMessage = `${username} sent ${amount} Orby! 🎉`;
        if (message) fullMessage += `\n💬 ${message}`;

        const gifSet = new Set((window.gifEmojis || []).map(f => f));
        const staticMap = loadStaticEmojiMap();
        const allowEmoji = currentSelectedLevel.features.emoji;
        const allowGif = currentSelectedLevel.features.gif;
        
        addOrbyMessage(username, amount, fullMessage, extraHtml, gifSet, staticMap, allowEmoji, allowGif);
        triggerEffect(currentSelectedLevel);
        showToast(`You sent ${amount} Orby! Thank you.`);
        
        donationModal.classList.remove('active');
        currentSelectedLevel = null;
        recordedBlob = null;
        const oldPreview = document.getElementById('orbyAudioPreview');
        if (oldPreview) oldPreview.remove();
        orbyMessageInput.value = '';
        orbyMessageInput.disabled = false;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }

    function init() {
        buildLevelCards();
        orbyBtn.addEventListener('click', () => selectionOverlay.classList.add('active'));
        closeSelectionBtn.addEventListener('click', () => selectionOverlay.classList.remove('active'));
        modalClose.addEventListener('click', () => donationModal.classList.remove('active'));
        cancelBtn.addEventListener('click', () => donationModal.classList.remove('active'));
        confirmBtn.addEventListener('click', sendDonation);
        setupVoiceRecording();
        initOrbyEmojiTools();
        selectionOverlay.addEventListener('click', (e) => { if (e.target === selectionOverlay) selectionOverlay.classList.remove('active'); });
        donationModal.addEventListener('click', (e) => { if (e.target === donationModal) donationModal.classList.remove('active'); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();