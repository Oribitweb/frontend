// dashboard.js – Video & Comment Management Dashboard
(function () {
    'use strict';

    const API_BASE = window.API_BASE;
    const TOAST_LIFETIME = 4000;
    const PAGE_SIZE = 24;

    // ================= DOM refs =================
    const statVideos = document.getElementById('statVideos');
    const statComments = document.getElementById('statComments');
    const statPending = document.getElementById('statPending');
    const refreshBtn = document.getElementById('refreshDashboard');
    const commentsTabBadge = document.getElementById('commentsTabBadge');

    const videoSearch = document.getElementById('videoSearch');
    const filterStatus = document.getElementById('filterStatus');
    const filterVisibility = document.getElementById('filterVisibility');
    const sortVideos = document.getElementById('sortVideos');
    const viewToggleBtns = document.querySelectorAll('.dash-view-toggle__btn');
    const selectModeToggle = document.getElementById('selectModeToggle');
    const filterResult = document.getElementById('filterResult');
    const clearFiltersBtn = document.getElementById('clearFilters');

    const videoBulkBar = document.getElementById('videoBulkBar');
    const videoBulkCount = document.getElementById('videoBulkCount');
    const bulkVisibility = document.getElementById('bulkVisibility');
    const bulkVisibilityApply = document.getElementById('bulkVisibilityApply');
    const bulkClear = document.getElementById('bulkClear');

    const videoGrid = document.getElementById('videoGrid');
    const videoSkeleton = document.getElementById('videoSkeleton');
    const videoEmpty = document.getElementById('videoGridEmpty');
    const videoError = document.getElementById('videoGridError');
    const retryBtn = document.getElementById('retryVideos');
    const sentinel = document.getElementById('videoGridSentinel');
    const videoLoadingMore = document.getElementById('videoLoadingMore');

    const commentSelector = document.getElementById('commentVideoSelector');
    const commentSearch = document.getElementById('commentSearch');
    const commentFilterChips = document.getElementById('commentFilterChips');
    const commentBulkBar = document.getElementById('commentBulkBar');
    const selectAllPending = document.getElementById('selectAllPending');
    const approveSelectedBtn = document.getElementById('approveSelectedBtn');
    const commentsContainer = document.getElementById('commentsContainer');

    const editVideoForm = document.getElementById('editVideoForm');
    const editVideoId = document.getElementById('editVideoId');
    const editTitle = document.getElementById('editTitle');
    const editTitleCount = document.getElementById('editTitleCount');
    const editDescription = document.getElementById('editDescription');
    const editVisibility = document.getElementById('editVisibility');
    const editCategory = document.getElementById('editCategory');
    const editLanguage = document.getElementById('editLanguage');
    const editLicense = document.getElementById('editLicense');
    const editScheduledAt = document.getElementById('editScheduledAt');
    const editAllowComments = document.getElementById('editAllowComments');
    const editMadeForKids = document.getElementById('editMadeForKids');
    const editVideoSubmit = document.getElementById('editVideoSubmit');

    const editCommentForm = document.getElementById('editCommentForm');
    const editCommentId = document.getElementById('editCommentId');
    const editCommentBody = document.getElementById('editCommentBody');
    const editCommentApproved = document.getElementById('editCommentApproved');
    const editCommentPinned = document.getElementById('editCommentPinned');

    const confirmTitle = document.getElementById('confirmTitle');
    const confirmBody = document.getElementById('confirmBody');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    // ================= State =================
    let allVideos = [];
    let totalVideos = 0;
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;
    let filters = { status: '', visibility: '' };
    let searchTerm = '';
    let sortMode = 'newest';
    let viewMode = 'list';
    let selectMode = false;
    let selectedVideoIds = new Set();

    let allComments = {};        // videoId -> comments[]
    let pendingCountByVideo = {}; // videoId -> pending count
    let currentVideoIdForComments = null;
    let commentFilter = 'all';   // all | pending | approved
    let commentSearchTerm = '';
    let selectedCommentIds = new Set();

    let categories = [];
    let categoriesLoaded = false;

    // ================= Generic helpers =================
    function apiHeaders() {
        return { 'Content-Type': 'application/json' };
    }

    async function apiFetch(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : API_BASE + endpoint;
        const resp = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: { ...apiHeaders(), ...(options.headers || {}) },
        });

        if (resp.status === 401 || resp.status === 403) {
            const errMsg = 'Session expired or not logged in. Please log in again.';
            showToast(errMsg, 'error');
            throw new Error(errMsg);
        }
        if (!resp.ok) {
            let errText = await resp.text().catch(() => '');
            try {
                const jsonErr = JSON.parse(errText);
                errText = jsonErr.detail || jsonErr.message || errText;
            } catch (e) { /* ignore */ }
            throw new Error(`API error ${resp.status}: ${errText || resp.statusText}`);
        }
        if (resp.status === 204) return null;
        return resp.json();
    }

    function debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        const icons = {
            success: '<span style="color:var(--accent);font-size:1.2rem;">✓</span>',
            error: '<span style="color:var(--db-danger);font-size:1.2rem;">✕</span>',
            info: '<span style="color:var(--db-info);font-size:1.2rem;">ℹ</span>',
        };
        toast.innerHTML = `
            <span class="toast__icon">${icons[type] || icons.info}</span>
            <span>${escapeHtml(message)}</span>
            <button class="toast__close" aria-label="Dismiss">&times;</button>
        `;
        toast.querySelector('.toast__close').addEventListener('click', () => toast.remove());
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, TOAST_LIFETIME);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function formatDateShort(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return null;
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const m = Math.floor(seconds / 60);
        return `${m}:${s}`;
    }

    function initials(name) {
        if (!name) return '?';
        const parts = String(name).trim().split(/\s+/);
        const first = parts[0] ? parts[0][0] : '';
        const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (first + second).toUpperCase() || '?';
    }

    function getVisibilityBadge(vis) {
        const cls = vis === 'public' ? 'dash-badge--public' :
            vis === 'private' ? 'dash-badge--private' :
            vis === 'scheduled' ? 'dash-badge--scheduled' : 'dash-badge--unlisted';
        return `<span class="dash-badge ${cls}">${escapeHtml(vis || '—')}</span>`;
    }

    function isCommentApproved(comment) {
        if (typeof comment.is_approved === 'boolean') return comment.is_approved;
        if (typeof comment.status === 'string') return comment.status === 'approved';
        return false;
    }

    function isCommentPinned(comment) {
        return comment.is_pinned === true || comment.pinned === true;
    }

    // ================= Confirm dialog (reusable) =================
    let confirmActiveResolve = null;
    function askConfirm({ title = 'Are you sure?', body = "This action can't be undone.", okText = 'Delete' } = {}) {
        confirmTitle.textContent = title;
        confirmBody.textContent = body;
        confirmOkBtn.textContent = okText;
        openPopup('confirmPopup');
        return new Promise((resolve) => {
            confirmActiveResolve = resolve;
        });
    }
    function resolveConfirm(result) {
        closePopup('confirmPopup');
        if (confirmActiveResolve) {
            const r = confirmActiveResolve;
            confirmActiveResolve = null;
            r(result);
        }
    }
    confirmOkBtn.addEventListener('click', () => resolveConfirm(true));
    confirmCancelBtn.addEventListener('click', () => resolveConfirm(false));
    document.getElementById('confirmPopup').addEventListener('click', (e) => {
        if (e.target.id === 'confirmPopup' || e.target.closest('[data-close="confirmPopup"]')) {
            resolveConfirm(false);
        }
    });

    // ================= Popup helpers =================
    function openPopup(id) {
        if (typeof window.openPopupById === 'function') {
            window.openPopupById(id);
            return;
        }
        const el = document.getElementById(id);
        if (el) { el.style.display = 'flex'; el.classList.add('active'); }
    }
    function closePopup(id) {
        if (typeof window.closePopupById === 'function') {
            window.closePopupById(id);
            return;
        }
        const el = document.getElementById(id);
        if (el) { el.style.display = 'none'; el.classList.remove('active'); }
    }
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closePopup(btn.dataset.close));
    });
    document.querySelectorAll('.popup').forEach(p => {
        p.addEventListener('click', (e) => { if (e.target === p) closePopup(p.id); });
    });

    // ================= Videos: fetch + client-side view =================
    function getVisibleVideos() {
        let list = allVideos.slice();
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(v => (v.title || '').toLowerCase().includes(q));
        }
        switch (sortMode) {
            case 'oldest':
                list.sort((a, b) => new Date(a.created_at || a.uploaded_at || 0) - new Date(b.created_at || b.uploaded_at || 0));
                break;
            case 'views':
                list.sort((a, b) => (b.view_count || b.views || 0) - (a.view_count || a.views || 0));
                break;
            case 'title':
                list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'newest':
            default:
                list.sort((a, b) => new Date(b.created_at || b.uploaded_at || 0) - new Date(a.created_at || a.uploaded_at || 0));
        }
        return list;
    }

    async function fetchVideos(page = 1, append = false) {
        if (isLoading) return;
        isLoading = true;

        if (!append) {
            currentPage = 1;
            hasMore = true;
            videoGrid.innerHTML = '';
            videoEmpty.hidden = true;
            videoError.hidden = true;
            videoSkeleton.style.display = 'grid';
        } else {
            videoLoadingMore.hidden = false;
        }

        try {
            const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
            if (filters.status) params.append('status', filters.status);
            if (filters.visibility) params.append('visibility', filters.visibility);

            const data = await apiFetch(`/me/videos?${params.toString()}`);
            const items = data.items || [];
            const total = data.total || 0;
            hasMore = data.has_next || false;

            if (append) {
                allVideos = allVideos.concat(items);
            } else {
                allVideos = items;
                totalVideos = total;
                populateVideoSelector(allVideos);
            }

            renderVideos();
            updateVideoStat(total);
            currentPage = page;

            if (filterResult) {
                const visibleCount = getVisibleVideos().length;
                filterResult.textContent = searchTerm
                    ? `Showing ${visibleCount} of ${allVideos.length} loaded videos matching "${searchTerm}"`
                    : `Showing ${allVideos.length} of ${total} videos`;
            }

            if (!append) fetchCommentStats(allVideos);

        } catch (err) {
            const isAuthError = err.message && err.message.includes('logged in');
            if (isAuthError) {
                console.error('User is not authenticated:', err);
                videoError.hidden = false;
            } else {
                console.error('Fetch videos error:', err);
                videoError.hidden = false;
            }
        } finally {
            videoSkeleton.style.display = 'none';
            videoLoadingMore.hidden = true;
            isLoading = false;
        }
    }

    function updateVideoStat(total) {
        statVideos.textContent = total !== undefined ? total : allVideos.length;
    }

    async function fetchCommentStats(videos) {
        let totalComments = 0;
        let pendingComments = 0;
        for (const v of videos) {
            const pubId = v.public_id || v.id;
            try {
                const data = await apiFetch(`/comments/video/${pubId}`);
                const comments = Array.isArray(data) ? data : (data.data || data.comments || []);
                allComments[pubId] = comments;
                const pending = comments.filter(c => !isCommentApproved(c)).length;
                pendingCountByVideo[pubId] = pending;
                totalComments += comments.length;
                pendingComments += pending;
            } catch (e) { /* ignore per-video errors */ }
        }
        statComments.textContent = totalComments;
        statPending.textContent = pendingComments;
        if (pendingComments > 0) {
            commentsTabBadge.hidden = false;
            commentsTabBadge.textContent = pendingComments;
        } else {
            commentsTabBadge.hidden = true;
        }
        renderVideos(); // re-render so per-card pending badges reflect fresh counts
    }

    function populateVideoSelector(videos) {
        const currentVal = commentSelector.value;
        commentSelector.innerHTML = '<option value="">— Select a video —</option>';
        if (!videos || videos.length === 0) {
            commentSelector.disabled = true;
            return;
        }
        commentSelector.disabled = false;
        videos.forEach(v => {
            const pubId = v.public_id || v.id;
            const opt = document.createElement('option');
            opt.value = pubId;
            opt.textContent = v.title || pubId;
            commentSelector.appendChild(opt);
        });
        if (currentVal && commentSelector.querySelector(`option[value="${currentVal}"]`)) {
            commentSelector.value = currentVal;
        }
    }

    // ================= Render video cards =================
    function renderVideos() {
        const visible = getVisibleVideos();

        if (!visible.length) {
            videoGrid.innerHTML = '';
            videoEmpty.hidden = false;
            return;
        }
        videoEmpty.hidden = true;
        videoError.hidden = true;

        videoGrid.innerHTML = visible.map(renderVideoCard).join('');
    }

    function renderVideoCard(v) {
        const thumb = v.thumbnail_url || 'assets/img/thumbnail.png';
        const title = escapeHtml(v.title || 'Untitled');
        const views = v.view_count || v.views || 0;
        const date = formatDate(v.created_at || v.uploaded_at);
        const vis = v.visibility || 'public';
        const pubId = v.public_id || v.id;
        const duration = formatDuration(v.duration);
        const pending = pendingCountByVideo[pubId] || 0;
        const isSelected = selectedVideoIds.has(String(pubId));

        return `
            <div class="dash-video-card${isSelected ? ' is-selected' : ''}" data-id="${pubId}">
                <button type="button" class="dash-video-card__check" data-action="toggle-select" data-id="${pubId}" aria-label="Select video">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <div class="dash-video-card__thumb">
                    <img src="${thumb}" alt="${title}" loading="lazy" onerror="this.src='assets/img/thumbnail.png'">
                    ${v.status ? `<span class="dash-video-card__status">${escapeHtml(v.status)}</span>` : ''}
                    ${duration ? `<span class="dash-video-card__duration">${duration}</span>` : ''}
                </div>
                <div class="dash-video-card__body">
                    <div class="dash-video-card__title">${title}</div>
                    <div class="dash-video-card__meta">
                        <span>${views.toLocaleString ? views.toLocaleString() : views} views</span>
                        <span>${date}</span>
                        ${getVisibilityBadge(vis)}
                        ${pending > 0 ? `<span class="dash-video-card__pending">${pending} pending</span>` : ''}
                    </div>
                    <div class="dash-video-card__actions">
                        <button class="btn--small btn--primary" data-action="edit-video" data-id="${pubId}">✎ Edit</button>
                        <button class="btn--small" data-action="manage-comments" data-id="${pubId}">💬 Comments${pending > 0 ? ` (${pending})` : ''}</button>
                        <div class="dash-video-card__menu-wrap">
                            <button class="dash-video-card__menu-btn" data-action="toggle-menu" data-id="${pubId}" aria-label="More actions">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                            </button>
                            <div class="dash-video-card__menu" data-menu="${pubId}">
                                <button data-action="copy-id" data-id="${pubId}">Copy video ID</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ---- Video grid delegation ----
    videoGrid.addEventListener('click', (e) => {
        const menuBtn = e.target.closest('[data-action="toggle-menu"]');
        if (menuBtn) {
            e.stopPropagation();
            const menu = videoGrid.querySelector(`.dash-video-card__menu[data-menu="${menuBtn.dataset.id}"]`);
            document.querySelectorAll('.dash-video-card__menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
            if (menu) menu.classList.toggle('open');
            return;
        }

        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit-video') {
            openEditVideo(id);
        } else if (action === 'manage-comments') {
            document.querySelector('[data-tab="comments"]').click();
            commentSelector.value = id;
            commentSelector.dispatchEvent(new Event('change'));
        } else if (action === 'toggle-select') {
            toggleVideoSelection(id);
        } else if (action === 'copy-id') {
            navigator.clipboard?.writeText(id).then(() => showToast('Video ID copied.', 'success'))
                .catch(() => showToast('Could not copy to clipboard.', 'error'));
            document.querySelectorAll('.dash-video-card__menu.open').forEach(m => m.classList.remove('open'));
        }
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dash-video-card__menu-wrap')) {
            document.querySelectorAll('.dash-video-card__menu.open').forEach(m => m.classList.remove('open'));
        }
    });

    // ================= Video selection & bulk actions =================
    function toggleVideoSelection(id) {
        const key = String(id);
        if (selectedVideoIds.has(key)) selectedVideoIds.delete(key);
        else selectedVideoIds.add(key);

        const card = videoGrid.querySelector(`.dash-video-card[data-id="${id}"]`);
        if (card) card.classList.toggle('is-selected', selectedVideoIds.has(key));

        updateVideoBulkBar();
    }

    function updateVideoBulkBar() {
        const count = selectedVideoIds.size;
        videoBulkCount.textContent = count;
        videoBulkBar.hidden = !(selectMode && count > 0);
    }

    selectModeToggle.addEventListener('click', () => {
        selectMode = !selectMode;
        videoGrid.classList.toggle('select-mode', selectMode);
        selectModeToggle.classList.toggle('is-active', selectMode);
        selectModeToggle.textContent = selectMode ? 'Cancel select' : 'Select';
        if (!selectMode) {
            selectedVideoIds.clear();
            videoGrid.querySelectorAll('.dash-video-card.is-selected').forEach(c => c.classList.remove('is-selected'));
        }
        updateVideoBulkBar();
    });

    bulkClear.addEventListener('click', () => {
        selectedVideoIds.clear();
        videoGrid.querySelectorAll('.dash-video-card.is-selected').forEach(c => c.classList.remove('is-selected'));
        updateVideoBulkBar();
    });

    bulkVisibilityApply.addEventListener('click', async () => {
        const newVis = bulkVisibility.value;
        if (!newVis) { showToast('Choose a visibility to apply.', 'error'); return; }
        const ids = Array.from(selectedVideoIds);
        if (!ids.length) return;

        bulkVisibilityApply.disabled = true;
        bulkVisibilityApply.textContent = 'Applying…';

        const results = await Promise.allSettled(ids.map(id => {
            const video = allVideos.find(v => String(v.public_id || v.id) === id);
            if (!video) return Promise.reject(new Error('not found'));
            const payload = buildVideoPayload(video, { visibility: newVis });
            return apiFetch(`/videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        }));

        const ok = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - ok;
        if (ok) showToast(`Updated visibility for ${ok} video${ok !== 1 ? 's' : ''}.`, 'success');
        if (failed) showToast(`${failed} update${failed !== 1 ? 's' : ''} failed.`, 'error');

        bulkVisibilityApply.disabled = false;
        bulkVisibilityApply.textContent = 'Apply';
        bulkVisibility.value = '';
        selectedVideoIds.clear();
        updateVideoBulkBar();
        await fetchVideos(1, false);
    });

    function buildVideoPayload(video, overrides = {}) {
        const payload = {
            title: video.title || '',
            description: video.description || '',
            visibility: video.visibility || 'public',
            scheduled_at: video.scheduled_at || null,
            language: video.language || 'en',
            license: video.license || 'standard',
            allow_comments: video.allow_comments !== false,
            is_made_for_kids: video.is_made_for_kids === true,
            ...overrides,
        };
        // Omit category_id unless it's a real id — 0 violates the FK and an
        // unparseable value would silently clear the video's category.
        const categoryId = parseInt(video.category_id ?? video.category);
        if (categoryId) payload.category_id = categoryId;
        return payload;
    }

    // ================= Toolbar: search / filters / sort / view =================
    videoSearch.addEventListener('input', debounce(() => {
        searchTerm = videoSearch.value.trim();
        renderVideos();
        if (filterResult) {
            const visibleCount = getVisibleVideos().length;
            filterResult.textContent = searchTerm
                ? `Showing ${visibleCount} of ${allVideos.length} loaded videos matching "${searchTerm}"`
                : `Showing ${allVideos.length} of ${totalVideos} videos`;
        }
    }, 250));

    function refetchWithFilters() {
        filters.status = filterStatus.value;
        filters.visibility = filterVisibility.value;
        fetchVideos(1, false);
    }
    filterStatus.addEventListener('change', refetchWithFilters);
    filterVisibility.addEventListener('change', refetchWithFilters);

    sortVideos.addEventListener('change', () => {
        sortMode = sortVideos.value;
        renderVideos();
    });

    clearFiltersBtn.addEventListener('click', () => {
        filterStatus.value = '';
        filterVisibility.value = '';
        videoSearch.value = '';
        searchTerm = '';
        filters = { status: '', visibility: '' };
        fetchVideos(1, false);
    });

    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewMode = btn.dataset.view;
            viewToggleBtns.forEach(b => {
                b.classList.toggle('dash-view-toggle__btn--active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            videoGrid.dataset.view = viewMode;
        });
    });

    retryBtn.addEventListener('click', () => fetchVideos(1, false));

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('is-spinning');
        await fetchVideos(1, false);
        setTimeout(() => refreshBtn.classList.remove('is-spinning'), 400);
    });

    // ================= Infinite scroll =================
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchVideos(currentPage + 1, true);
        }
    }, { rootMargin: '200px' });
    if (sentinel) observer.observe(sentinel);

    // ================= Edit Video =================
    async function openEditVideo(videoId) {
        const video = allVideos.find(v => String(v.public_id || v.id) === String(videoId));
        if (!video) { showToast('Video not found.', 'error'); return; }

        editVideoId.value = videoId;
        editTitle.value = video.title || '';
        updateTitleCount();
        editDescription.value = video.description || '';
        editVisibility.value = video.visibility || 'public';
        editLanguage.value = video.language || 'en';
        editLicense.value = video.license || 'standard';
        editScheduledAt.value = video.scheduled_at ? new Date(video.scheduled_at).toISOString().slice(0, 16) : '';
        editAllowComments.checked = video.allow_comments !== false;
        editMadeForKids.checked = video.is_made_for_kids === true;

        await loadCategories();
        renderCategoryOptions(video.category_id || video.category || '');

        openPopup('editVideoPopup');
        editTitle.focus();
    }

    function updateTitleCount() {
        editTitleCount.textContent = `${editTitle.value.length} characters`;
    }
    editTitle.addEventListener('input', updateTitleCount);

    editVideoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editVideoId.value;
        if (!id) return;

        const payload = {
            title: editTitle.value.trim(),
            description: editDescription.value.trim(),
            visibility: editVisibility.value,
            scheduled_at: editScheduledAt.value ? new Date(editScheduledAt.value).toISOString() : null,
            language: editLanguage.value,
            license: editLicense.value,
            allow_comments: editAllowComments.checked,
            is_made_for_kids: editMadeForKids.checked,
        };
        // Only send category_id when a real category is selected — sending 0
        // violates the FK constraint, and null would clear an existing one.
        const selectedCategoryId = parseInt(editCategory.value);
        if (selectedCategoryId) payload.category_id = selectedCategoryId;

        editVideoSubmit.disabled = true;
        editVideoSubmit.textContent = 'Saving…';
        try {
            await apiFetch(`/videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('Video updated!', 'success');
            closePopup('editVideoPopup');
            await fetchVideos(1, false);
        } catch (err) {
            if (!err.message.includes('log in')) showToast('Failed to update video: ' + err.message, 'error');
        } finally {
            editVideoSubmit.disabled = false;
            editVideoSubmit.textContent = 'Save Changes';
        }
    });

    // ================= Categories =================
    async function loadCategories(force = false) {
        if (categoriesLoaded && !force) return categories;
        try {
            const data = await apiFetch('/categories/');
            categories = Array.isArray(data) ? data : (data.items || data.categories || []);
            categoriesLoaded = true;
        } catch (err) {
            console.error('Failed to load categories:', err);
            showToast('Could not load categories.', 'error');
        }
        return categories;
    }

    function renderCategoryOptions(selectedValue) {
        if (!editCategory) return;
        const previousValue = selectedValue !== undefined ? selectedValue : editCategory.value;
        editCategory.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        if (previousValue) editCategory.value = previousValue;
    }

    // ================= Tabs =================
    const tabs = document.querySelectorAll('.dash-tab');
    const panels = { videos: document.getElementById('tabVideos'), comments: document.getElementById('tabComments') };
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => { t.classList.remove('dash-tab--active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('dash-tab--active');
            tab.setAttribute('aria-selected', 'true');
            Object.keys(panels).forEach(key => panels[key].classList.toggle('dash-panel--active', key === target));
        });
    });

    // ================= Comments: selection & video change =================
    commentSelector.addEventListener('change', () => {
        const val = commentSelector.value;
        selectedCommentIds.clear();
        if (val) {
            loadCommentsForVideo(val);
        } else {
            currentVideoIdForComments = null;
            commentSearch.disabled = true;
            commentSearch.value = '';
            commentSearchTerm = '';
            renderCommentsPanel();
        }
    });

    async function loadCommentsForVideo(videoId) {
        currentVideoIdForComments = videoId;
        commentSearch.disabled = false;
        commentsContainer.innerHTML = `<div class="dash-loadmore"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/></svg>Loading comments…</div>`;

        try {
            const data = await apiFetch(`/comments/video/${videoId}`);
            const comments = Array.isArray(data) ? data : (data.data || data.comments || []);
            allComments[videoId] = comments;
            pendingCountByVideo[videoId] = comments.filter(c => !isCommentApproved(c)).length;
            renderCommentsPanel();
        } catch (err) {
            console.error('Load comments error:', err);
            commentsContainer.innerHTML = `
                <div class="dash-empty dash-empty--error">
                    <p>Could not load comments.</p>
                    <button type="button" class="btn btn--primary btn--small" id="retryComments">Retry</button>
                </div>`;
            document.getElementById('retryComments')?.addEventListener('click', () => loadCommentsForVideo(videoId));
            if (!err.message.includes('log in')) showToast('Failed to load comments: ' + err.message, 'error');
        }
    }

    // ---- Filter chips ----
    commentFilterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.dash-chip');
        if (!chip) return;
        commentFilterChips.querySelectorAll('.dash-chip').forEach(c => c.classList.remove('dash-chip--active'));
        chip.classList.add('dash-chip--active');
        commentFilter = chip.dataset.filter;
        selectedCommentIds.clear();
        renderCommentsPanel();
    });

    commentSearch.addEventListener('input', debounce(() => {
        commentSearchTerm = commentSearch.value.trim().toLowerCase();
        renderCommentsPanel();
    }, 200));

    function getFilteredComments() {
        const comments = allComments[currentVideoIdForComments] || [];
        return comments.filter(c => {
            const approved = isCommentApproved(c);
            if (commentFilter === 'pending' && approved) return false;
            if (commentFilter === 'approved' && !approved) return false;
            if (commentSearchTerm) {
                const author = (c.author_username || c.author || '').toLowerCase();
                const body = (c.body || c.content || '').toLowerCase();
                if (!author.includes(commentSearchTerm) && !body.includes(commentSearchTerm)) return false;
            }
            return true;
        });
    }

    // ================= Render comments panel =================
    function renderCommentsPanel() {
        if (!currentVideoIdForComments) {
            commentsContainer.innerHTML = `
                <div class="dash-empty dash-empty--inline">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <p>Select a video on the left to view and moderate its comments.</p>
                </div>`;
            commentBulkBar.hidden = true;
            return;
        }

        const allForVideo = allComments[currentVideoIdForComments] || [];
        const pendingTotal = allForVideo.filter(c => !isCommentApproved(c)).length;
        commentBulkBar.hidden = !(commentFilter === 'pending' && pendingTotal > 0);
        if (commentBulkBar.hidden) { selectedCommentIds.clear(); selectAllPending.checked = false; }
        updateApproveSelectedBtn();

        const filtered = getFilteredComments();

        if (!filtered.length) {
            const msg = commentSearchTerm ? 'No comments match your search.' :
                commentFilter === 'pending' ? 'Nothing pending — you\'re all caught up.' :
                commentFilter === 'approved' ? 'No approved comments yet.' :
                'No comments yet on this video.';
            commentsContainer.innerHTML = `<div class="dash-empty dash-empty--inline"><p>${escapeHtml(msg)}</p></div>`;
            return;
        }

        commentsContainer.innerHTML = `<div class="dash-comment-list">${filtered.map(renderCommentCard).join('')}</div>`;
    }

    function renderCommentCard(c) {
        const cid = c.id || c.comment_id;
        const author = c.author_username || c.author || 'Anonymous';
        const body = escapeHtml(c.body || c.content || '');
        const date = formatDateShort(c.created_at || c.createdAt || c.timestamp);
        const approved = isCommentApproved(c);
        const pinned = isCommentPinned(c);
        const hasReplies = c.reply_count > 0 || (c.replies && c.replies.length > 0);
        const replyId = `dash-replies-${cid}`;
        const showBulkCheckbox = !commentBulkBar.hidden && !approved;
        const isSelected = selectedCommentIds.has(String(cid));

        let actions = '';
        if (!approved) {
            actions += `<button class="btn--icon approve" data-action="approve-comment" data-id="${cid}">✓ Approve</button>`;
            actions += `<button class="btn--icon reject" data-action="reject-comment" data-id="${cid}">✕ Reject</button>`;
        } else {
            actions += `<button class="btn--icon unapprove" data-action="unapprove-comment" data-id="${cid}">↺ Unapprove</button>`;
            actions += `<button class="btn--icon delete" data-action="delete-comment" data-id="${cid}">🗑 Delete</button>`;
        }
        actions += `<button class="btn--icon edit" data-action="edit-comment" data-id="${cid}">✎ Edit</button>`;

        return `
            <div class="dash-comment-card ${approved ? 'is-approved' : 'is-pending'}${isSelected ? ' is-selected' : ''}" data-comment-id="${cid}">
                ${showBulkCheckbox ? `
                <div class="dash-comment-card__select">
                    <input type="checkbox" data-comment-select="${cid}" ${isSelected ? 'checked' : ''} aria-label="Select comment">
                </div>` : ''}
                <div class="dash-comment-avatar">${escapeHtml(initials(author))}</div>
                <div class="dash-comment-card__body">
                    <div class="dash-comment-card__head">
                        <span class="dash-comment-card__author">${escapeHtml(author)}</span>
                        <span class="dash-comment-status ${approved ? 'dash-comment-status--approved' : 'dash-comment-status--pending'}">${approved ? 'Approved' : 'Pending'}</span>
                        ${pinned ? '<span class="dash-comment-card__pin">📌 Pinned</span>' : ''}
                        <span class="dash-comment-card__date">${date}</span>
                    </div>
                    <p class="dash-comment-card__text">${body}</p>
                    <div class="dash-comment-card__actions">
                        ${actions}
                        ${hasReplies ? `<button class="dash-replies-toggle" data-target="${replyId}" data-comment="${cid}">▶ Show replies</button>` : ''}
                    </div>
                    <div class="dash-replies-list" id="${replyId}"></div>
                </div>
            </div>
        `;
    }

    // ---- Comments container delegation ----
    commentsContainer.addEventListener('click', async (e) => {
        const repliesBtn = e.target.closest('.dash-replies-toggle');
        if (repliesBtn) {
            await toggleReplies(repliesBtn.dataset.comment, repliesBtn);
            return;
        }

        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!id) return;

        if (action === 'approve-comment') await approveComment(id);
        else if (action === 'unapprove-comment') await setCommentApproval(id, false);
        else if (action === 'reject-comment') await rejectComment(id);
        else if (action === 'delete-comment') await confirmAndDeleteComment(id);
        else if (action === 'edit-comment') openEditComment(id);
    });

    commentsContainer.addEventListener('change', (e) => {
        const cb = e.target.closest('[data-comment-select]');
        if (!cb) return;
        const id = cb.dataset.commentSelect;
        if (cb.checked) selectedCommentIds.add(String(id));
        else selectedCommentIds.delete(String(id));
        cb.closest('.dash-comment-card').classList.toggle('is-selected', cb.checked);
        updateApproveSelectedBtn();
        syncSelectAllPendingState();
    });

    function updateApproveSelectedBtn() {
        approveSelectedBtn.disabled = selectedCommentIds.size === 0;
        approveSelectedBtn.textContent = selectedCommentIds.size > 0
            ? `Approve selected (${selectedCommentIds.size})`
            : 'Approve selected';
    }

    function syncSelectAllPendingState() {
        const pendingIds = getFilteredComments().filter(c => !isCommentApproved(c)).map(c => String(c.id || c.comment_id));
        selectAllPending.checked = pendingIds.length > 0 && pendingIds.every(id => selectedCommentIds.has(id));
    }

    selectAllPending.addEventListener('change', () => {
        const pendingIds = getFilteredComments().filter(c => !isCommentApproved(c)).map(c => String(c.id || c.comment_id));
        if (selectAllPending.checked) pendingIds.forEach(id => selectedCommentIds.add(id));
        else pendingIds.forEach(id => selectedCommentIds.delete(id));
        renderCommentsPanel();
    });

    approveSelectedBtn.addEventListener('click', async () => {
        const ids = Array.from(selectedCommentIds);
        if (!ids.length) return;
        approveSelectedBtn.disabled = true;
        const results = await Promise.allSettled(ids.map(id => apiFetch(`/comments/${id}/approve`, { method: 'POST' })));
        const ok = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - ok;
        if (ok) showToast(`Approved ${ok} comment${ok !== 1 ? 's' : ''}.`, 'success');
        if (failed) showToast(`${failed} approval${failed !== 1 ? 's' : ''} failed.`, 'error');
        selectedCommentIds.clear();
        if (currentVideoIdForComments) await loadCommentsForVideo(currentVideoIdForComments);
    });

    // ---- Single comment actions ----
    async function approveComment(commentId) {
        try {
            await apiFetch(`/comments/${commentId}/approve`, { method: 'POST' });
            showToast('Comment approved!', 'success');
            if (currentVideoIdForComments) await loadCommentsForVideo(currentVideoIdForComments);
        } catch (err) {
            if (!err.message.includes('log in')) showToast('Failed to approve comment: ' + err.message, 'error');
        }
    }

    async function setCommentApproval(commentId, isApproved) {
        const comment = findCachedComment(commentId);
        if (!comment) { showToast('Comment not found. Please refresh.', 'error'); return; }
        try {
            await apiFetch(`/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    body: comment.body || comment.content || '',
                    is_pinned: isCommentPinned(comment),
                    is_approved: isApproved,
                }),
            });
            showToast(isApproved ? 'Comment approved!' : 'Comment moved back to pending.', 'success');
            if (currentVideoIdForComments) await loadCommentsForVideo(currentVideoIdForComments);
        } catch (err) {
            if (!err.message.includes('log in')) showToast('Failed to update comment: ' + err.message, 'error');
        }
    }

    async function rejectComment(commentId) {
        const ok = await askConfirm({
            title: 'Reject this comment?',
            body: 'The comment will be permanently deleted and the author will no longer see it.',
            okText: 'Reject & delete',
        });
        if (!ok) return;
        await deleteComment(commentId);
    }

    async function confirmAndDeleteComment(commentId) {
        const ok = await askConfirm({
            title: 'Delete this comment?',
            body: 'This will permanently remove the comment and any replies to it.',
            okText: 'Delete',
        });
        if (!ok) return;
        await deleteComment(commentId);
    }

    async function deleteComment(commentId) {
        try {
            await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
            showToast('Comment deleted.', 'success');
            selectedCommentIds.delete(String(commentId));
            if (currentVideoIdForComments) await loadCommentsForVideo(currentVideoIdForComments);
        } catch (err) {
            if (!err.message.includes('log in')) showToast('Failed to delete comment: ' + err.message, 'error');
        }
    }

    function findCachedComment(commentId) {
        for (const vid in allComments) {
            const found = (allComments[vid] || []).find(c => String(c.id || c.comment_id) === String(commentId));
            if (found) return found;
        }
        return null;
    }

    // ---- Edit comment modal ----
    function openEditComment(commentId) {
        const comment = findCachedComment(commentId);
        if (!comment) { showToast('Comment not found. Please refresh.', 'error'); return; }

        editCommentId.value = commentId;
        editCommentBody.value = comment.body || comment.content || '';
        editCommentApproved.checked = isCommentApproved(comment);
        editCommentPinned.checked = isCommentPinned(comment);
        openPopup('editCommentPopup');
        editCommentBody.focus();
    }

    editCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editCommentId.value;
        if (!id) { showToast('Invalid comment ID.', 'error'); return; }

        const payload = {
            body: editCommentBody.value.trim(),
            is_pinned: editCommentPinned.checked,
            is_approved: editCommentApproved.checked,
        };

        try {
            await apiFetch(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('Comment updated!', 'success');
            closePopup('editCommentPopup');
            if (currentVideoIdForComments) await loadCommentsForVideo(currentVideoIdForComments);
        } catch (err) {
            if (!err.message.includes('log in')) showToast('Failed to update comment: ' + err.message, 'error');
        }
    });

    // ---- Replies ----
    async function toggleReplies(commentId, toggleBtn) {
        const list = document.getElementById(`dash-replies-${commentId}`);
        if (!list) return;

        if (list.classList.contains('open')) {
            list.classList.remove('open');
            toggleBtn.textContent = '▶ Show replies';
            return;
        }

        if (!list.dataset.loaded) {
            list.innerHTML = `<div class="dash-loadmore" style="padding:8px 0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/></svg>Loading…</div>`;
            try {
                const data = await apiFetch(`/comments/${commentId}/replies`);
                const replies = Array.isArray(data) ? data : (data.data || data.replies || []);
                renderReplies(list, replies);
                list.dataset.loaded = '1';
            } catch (err) {
                list.innerHTML = `<p style="color:var(--db-danger);font-size:0.8rem;">Failed to load replies.</p>`;
                if (!err.message.includes('log in')) showToast('Failed to load replies: ' + err.message, 'error');
            }
        }
        list.classList.add('open');
        toggleBtn.textContent = '▼ Hide replies';
    }

    function renderReplies(container, replies) {
        if (!replies || !replies.length) {
            container.innerHTML = `<p style="color:var(--text-secondary);font-size:0.8rem;padding:6px 0;">No replies.</p>`;
            return;
        }
        container.innerHTML = replies.map(r => {
            const author = escapeHtml(r.author_username || r.author || 'Anonymous');
            const body = escapeHtml(r.body || r.content || '');
            const date = formatDateShort(r.created_at || r.createdAt);
            const approved = isCommentApproved(r);
            return `
                <div class="dash-reply-item">
                    <span class="reply-author">${author}</span>
                    <span class="reply-time">${date}</span>
                    ${approved ? '' : '<span class="reply-pending">Pending</span>'}
                    <span class="reply-body">${body}</span>
                </div>`;
        }).join('');
    }

    // ================= Init =================
    // Wait for auth state to be resolved (core.js fetches user on DOMContentLoaded)
    async function initDashboard() {
        // Ensure currentUser is fetched
        if (window.fetchCurrentUser) {
            await window.fetchCurrentUser();
        }

        // Check authentication - show login if not authenticated
        if (!window.currentUser) {
            window.openPopupById('loginPopup');
            return; // Stop further initialization
        }

        // Reset filter UI to defaults on load (avoid restored select values showing empty results)
        filterStatus.value = '';
        filterVisibility.value = '';
        videoSearch.value = '';
        filters = { status: '', visibility: '' };
        searchTerm = '';

        fetchVideos(1, false);
        loadCategories();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }
})();