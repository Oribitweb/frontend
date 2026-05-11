// orby.js – Orby Donation System for Live Chat
(function() {
    // Level definitions
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
    const orbyGifBtn = document.getElementById('orbyGifBtn');
    const orbyVoiceTool = document.getElementById('orbyVoiceTool');
    const orbyRecordBtn = document.getElementById('orbyRecordBtn');
    const orbyRecordingStatus = document.getElementById('orbyRecordingStatus');
    const orbyAudioPreview = document.getElementById('orbyAudioPreview');
    const orbyEmojiPicker = document.getElementById('orbyEmojiPicker');
    const orbyEmojiGrid = document.getElementById('orbyEmojiGrid');

    // Helper: Show toast
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
                    <div class="level-feature">${level.features.message ? '📝 Message' : ''}</div>
                    <div class="level-feature">${level.features.emoji ? '😀 Emoji' : ''}</div>
                    <div class="level-feature">${level.features.gif ? '🎞️ GIF' : ''}</div>
                    <div class="level-feature">${level.features.voice ? '🎙️ Voice note' : ''}</div>
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
        
        // Show donation modal if message is allowed
        donationAmountTitle.textContent = `Send ${level.amount} Orby`;
        orbyMessageInput.value = '';
        // Reset tools
        orbyEmojiTools.style.display = level.features.message ? 'flex' : 'none';
        orbyGifBtn.style.display = level.features.gif ? 'inline-flex' : 'none';
        orbyVoiceTool.style.display = level.features.voice ? 'block' : 'none';
        recordedBlob = null;
        if (orbyAudioPreview) {
            orbyAudioPreview.style.display = 'none';
            orbyAudioPreview.src = '';
        }
        if (orbyRecordingStatus) orbyRecordingStatus.textContent = '';
        donationModal.classList.add('active');
    }

    // Effect functions
    function triggerEffect(level) {
        const effect = level.effect;
        const canvas = document.createElement('canvas');
        canvas.className = 'orby-effect-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        if (effect === 'fire') {
            // Fire particles
            let particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height - Math.random() * 100,
                    radius: Math.random() * 8 + 2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 5 - 2,
                    color: `hsl(${Math.random() * 30 + 20}, 100%, 60%)`
                });
            }
            function drawFire() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let alive = false;
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2;
                    if (p.y < canvas.height && p.y > 0) alive = true;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                });
                if (alive) requestAnimationFrame(drawFire);
                else canvas.remove();
            }
            drawFire();
            setTimeout(() => canvas.remove(), 2000);
        } else if (effect === 'explosion') {
            // Explosion burst
            for (let i = 0; i < 150; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 12 + 2;
                const x = canvas.width / 2;
                const y = canvas.height / 2;
                let vx = Math.cos(angle) * speed;
                let vy = Math.sin(angle) * speed;
                let life = 1;
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
                particle.style.borderRadius = '50%';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.pointerEvents = 'none';
                document.body.appendChild(particle);
                function move() {
                    if (life <= 0) { particle.remove(); return; }
                    life -= 0.03;
                    const newX = parseFloat(particle.style.left) + vx;
                    const newY = parseFloat(particle.style.top) + vy;
                    particle.style.left = newX + 'px';
                    particle.style.top = newY + 'px';
                    particle.style.opacity = life;
                    requestAnimationFrame(move);
                }
                move();
            }
            setTimeout(() => canvas.remove(), 1000);
        } else if (effect === 'money') {
            // Coin rain
            for (let i = 0; i < 60; i++) {
                const coin = document.createElement('div');
                coin.innerHTML = '💰';
                coin.style.position = 'fixed';
                coin.style.fontSize = '24px';
                coin.style.left = Math.random() * canvas.width + 'px';
                coin.style.top = '-30px';
                coin.style.pointerEvents = 'none';
                coin.style.opacity = '0.8';
                document.body.appendChild(coin);
                let y = -30;
                function fall() {
                    y += 5;
                    coin.style.top = y + 'px';
                    if (y < canvas.height + 30) requestAnimationFrame(fall);
                    else coin.remove();
                }
                fall();
            }
            setTimeout(() => canvas.remove(), 3000);
        } else {
            // None or default just remove canvas
            canvas.remove();
        }
    }

    // Send Orby donation
    async function sendDonation() {
        if (!currentSelectedLevel) return;
        const message = orbyMessageInput.value.trim();
        let extraHtml = '';
        let voiceUrl = null;
        if (recordedBlob && currentSelectedLevel.features.voice) {
            voiceUrl = URL.createObjectURL(recordedBlob);
            extraHtml += `<div style="margin-top: 8px;"><audio controls src="${voiceUrl}" style="max-width: 200px;"></audio></div>`;
        }
        // Build chat message
        const username = (window.currentUser && window.currentUser.username) ? window.currentUser.username : 'Anonymous';
        const amount = currentSelectedLevel.amount;
        let messageText = `${username} sent ${amount} Orby! 🎉`;
        if (message) {
            messageText += `\n💬 ${message}`;
        }
        // Call existing addChatMessage from live.js if available, else simulate
        if (typeof addChatMessage === 'function') {
            addChatMessage(username, messageText, true, extraHtml);
        } else {
            // Fallback direct DOM insert
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-message orby-message';
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                msgDiv.innerHTML = `
                    <div class="chat-avatar">${username[0]}</div>
                    <div class="chat-content">
                        <div><span class="chat-author">${escapeHtml(username)}</span><span class="chat-time"> ${now}</span></div>
                        <div class="chat-text">${escapeHtml(messageText)}</div>
                        ${extraHtml}
                    </div>
                `;
                chatMessages.appendChild(msgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        // Trigger effect
        triggerEffect(currentSelectedLevel);
        showToast(`You sent ${amount} Orby! Thank you for supporting.`);
        // Close modal and cleanup
        donationModal.classList.remove('active');
        currentSelectedLevel = null;
        if (voiceUrl) URL.revokeObjectURL(voiceUrl);
        recordedBlob = null;
    }

    // Voice recording
    function setupVoiceRecording() {
        if (!orbyRecordBtn) return;
        orbyRecordBtn.addEventListener('click', async () => {
            if (isRecording) {
                // Stop recording
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    isRecording = false;
                    orbyRecordBtn.textContent = '🎙️ Record Voice (max 30s)';
                    orbyRecordingStatus.textContent = 'Recording stopped.';
                }
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    recordedBlob = audioBlob;
                    const audioUrl = URL.createObjectURL(audioBlob);
                    orbyAudioPreview.src = audioUrl;
                    orbyAudioPreview.style.display = 'block';
                    orbyRecordingStatus.textContent = 'Voice recorded!';
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                isRecording = true;
                orbyRecordBtn.textContent = '⏹️ Stop Recording';
                orbyRecordingStatus.textContent = 'Recording... max 30s';
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        isRecording = false;
                        orbyRecordBtn.textContent = '🎙️ Record Voice (max 30s)';
                        orbyRecordingStatus.textContent = 'Recording timed out (30s).';
                    }
                }, 30000);
            } catch (err) {
                console.error('Microphone error:', err);
                showToast('Could not access microphone.');
            }
        });
    }

    // Emoji picker for Orby
    function buildOrbyEmojiPicker() {
        const emojiList = [
            'happy.png', 'sad.png', 'shocked.png', 'like.png', 'dislike.png',
            'thank.png', 'angry.png', 'stupid.png', 'ok.png', 'iran.png'
        ];
        const gifEmojis = window.gifEmojis || [];
        const allItems = [...emojiList.map(f => ({ type: 'static', file: f, name: f.split('.')[0] })),
                          ...gifEmojis.map(f => ({ type: 'gif', file: f, name: f.split('.')[0] }))];
        orbyEmojiGrid.innerHTML = allItems.map(item => {
            let src = `assets/emoji/${item.file}`;
            if (item.type === 'gif') src = `assets/emoji/gif/${item.file}`;
            return `<img src="${src}" alt="${item.name}" title="${item.name}" data-name="${item.name}">`;
        }).join('');
        document.querySelectorAll('#orbyEmojiGrid img').forEach(img => {
            img.addEventListener('click', () => {
                const name = img.dataset.name;
                orbyMessageInput.value += `:${name}:`;
                orbyEmojiPicker.classList.remove('active');
            });
        });
    }

    // Open emoji picker
    function initOrbyEmojiTools() {
        const emojiBtnEl = document.getElementById('orbyEmojiBtn');
        if (emojiBtnEl) {
            emojiBtnEl.addEventListener('click', () => {
                orbyEmojiPicker.classList.toggle('active');
            });
        }
        document.getElementById('orbyEmojiPickerClose')?.addEventListener('click', () => {
            orbyEmojiPicker.classList.remove('active');
        });
        if (orbyGifBtn) {
            orbyGifBtn.addEventListener('click', () => {
                orbyEmojiPicker.classList.toggle('active');
            });
        }
        buildOrbyEmojiPicker();
    }

    // Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
    }

    // Event listeners
    function init() {
        buildLevelCards();
        orbyBtn.addEventListener('click', () => {
            selectionOverlay.classList.add('active');
        });
        closeSelectionBtn.addEventListener('click', () => {
            selectionOverlay.classList.remove('active');
        });
        modalClose.addEventListener('click', () => donationModal.classList.remove('active'));
        cancelBtn.addEventListener('click', () => donationModal.classList.remove('active'));
        confirmBtn.addEventListener('click', sendDonation);
        setupVoiceRecording();
        initOrbyEmojiTools();
        // Close overlay on outside click
        selectionOverlay.addEventListener('click', (e) => {
            if (e.target === selectionOverlay) selectionOverlay.classList.remove('active');
        });
        donationModal.addEventListener('click', (e) => {
            if (e.target === donationModal) donationModal.classList.remove('active');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();