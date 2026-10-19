/**
 * videos-feed.js
 * Fetches real videos from the backend and renders them into #videoGrid,
 * using the SAME markup/class names main.css already styles
 * (.video-card, .video-card__thumbnail, .video-card__info,
 *  .video-card__channel-img, .video-card__text) so no second stylesheet
 * is needed.
 *
 * Handles: initial load, category filtering, infinite scroll, skeleton
 * loading, empty state, error/retry, and cancels stale in-flight requests
 * so a slow response can't clobber a newer one.
 */
(function () {
  'use strict';

  // Adjust to wherever your FastAPI app mounts the `public` router,
  // e.g. app.include_router(public.router, prefix="/api/v1").
  const API_BASE = window.API_BASE;
  const PAGE_SIZE = 24;
  const SKELETON_COUNT = 10;

  const els = {
    grid: document.getElementById('videoGrid'),
    empty: document.getElementById('videoGridEmpty'),
    error: document.getElementById('videoGridError'),
    retryBtn: document.getElementById('videoGridRetry'),
    sentinel: document.getElementById('videoGridSentinel'),
    pills: document.getElementById('categoryPills'),
  };

  const state = {
    page: 1,
    categoryId: null,
    isShort: null,
    loading: false,
    hasNext: true,
    abortController: null,
  };

  let observer = null;

  // ---------- formatting helpers ----------

  function formatDuration(totalSeconds) {
    if (totalSeconds === null || totalSeconds === undefined) return '';
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    const ss = String(sec).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function formatCount(n) {
    if (!n) return '0';
    if (n < 1000) return String(n);
    if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
    return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
  }

  function timeAgo(isoString) {
    if (!isoString) return '';
    const then = new Date(isoString).getTime();
    if (Number.isNaN(then)) return '';
    const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

    const units = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];
    for (const [label, secs] of units) {
      const value = Math.floor(seconds / secs);
      if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  // ---------- rendering ----------

  function skeletonCardHtml() {
    return `
      <div class="video-card video-card--skeleton" aria-hidden="true">
        <div class="video-card__thumbnail skeleton-shimmer"></div>
        <div class="video-card__info">
          <div class="video-card__channel-img skeleton-shimmer"></div>
          <div class="video-card__text">
            <div class="skeleton-line skeleton-shimmer" style="width:90%;height:14px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width:60%;height:10px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width:40%;height:10px;"></div>
          </div>
        </div>
      </div>`;
  }

  function renderSkeletons(count) {
    els.grid.insertAdjacentHTML('beforeend', skeletonCardHtml().repeat(count));
  }

  function clearSkeletons() {
    els.grid.querySelectorAll('.video-card--skeleton').forEach((el) => el.remove());
  }

  function videoCardHtml(video) {
    const duration = formatDuration(video.duration_seconds);
    const title = escapeHtml(video.title);
    const channel = escapeHtml(video.channel_name || 'Unknown channel');
    const views = formatCount(video.view_count);
    const published = timeAgo(video.published_at || video.created_at);
    const initial = (video.channel_name || '?').charAt(0).toUpperCase();

    // Card links to GET /videos/{public_id} (the short public ID), not the
    // internal numeric `id`. If a video somehow has no public_id yet, fall
    // back to a non-navigating placeholder rather than linking to
    // "videos/undefined".
    const href = video.public_id
    ? `/video.php?id=${encodeURIComponent(video.public_id)}`
    : '#';

    const thumbImg = video.thumbnail_url
      ? `<img src="${escapeHtml(video.thumbnail_url)}" alt="${title}" loading="lazy">`
      : '';

    return `
      <a class="video-card" href="${href}" data-video-id="${video.id}" data-video-preview="true">
        <div class="video-card__thumbnail">
          ${thumbImg}
          ${duration ? `<span class="video-card__duration">${duration}</span>` : ''}
        </div>
        <div class="video-card__info">
          <div class="video-card__channel-img">${initial}</div>
          <div class="video-card__text">
            <h3>${title}</h3>
            <p>${channel}</p>
            <p>${views} views &middot; ${published}</p>
          </div>
        </div>
      </a>`;
  }

  function renderVideos(videos) {
    if (!videos.length) return;
    els.grid.insertAdjacentHTML('beforeend', videos.map(videoCardHtml).join(''));
  }

  function setEmptyState(isEmpty) {
    if (els.empty) els.empty.hidden = !isEmpty;
  }

  function setErrorState(isError) {
    if (els.error) els.error.hidden = !isError;
  }

  // ---------- data fetching ----------

  function buildUrl() {
    const params = new URLSearchParams();
    params.set('page', String(state.page));
    params.set('page_size', String(PAGE_SIZE));
    if (state.categoryId) params.set('category_id', state.categoryId);
    if (state.isShort !== null) params.set('is_short', String(state.isShort));
    return `${API_BASE}/videos?${params.toString()}`;
  }

  /**
   * Fetches the current state.page and appends the results.
   * Uses an AbortController so that if resetFeed() fires again before this
   * resolves (e.g. rapid category switching), the stale response is
   * discarded instead of racing with — and possibly overwriting — the
   * newer one.
   */
  async function fetchAndRender() {
    state.loading = true;
    setErrorState(false);
    renderSkeletons(state.page === 1 ? SKELETON_COUNT : 6);

    const controller = new AbortController();
    state.abortController = controller;

    try {
      const res = await fetch(buildUrl(), {
        headers: { Accept: 'application/json' },
        credentials: 'include',
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      clearSkeletons();
      renderVideos(data.items || []);
      if (window.OrbitPreview) window.OrbitPreview.attach();

      state.hasNext = Boolean(data.has_next);
      setEmptyState(state.page === 1 && (data.items || []).length === 0);

      if (state.hasNext) {
        state.page += 1;
      } else if (observer) {
        observer.disconnect();
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // superseded by a newer request; ignore silently
      clearSkeletons();
      setErrorState(true);
      console.error('Failed to load videos:', err);
    } finally {
      // Only clear loading/abortController if we're still the "current"
      // request — a stale, aborted request's finally must not stomp on
      // state that a newer fetchAndRender() call has already taken over.
      if (state.abortController === controller) {
        state.loading = false;
        state.abortController = null;
      }
    }
  }

  function loadNextPage() {
    if (state.loading || !state.hasNext) return;
    fetchAndRender();
  }

  /** Cancels any in-flight request, clears the grid, and starts fresh. */
  function resetFeed() {
    if (state.abortController) state.abortController.abort();
    state.page = 1;
    state.hasNext = true;
    state.loading = false;
    els.grid.innerHTML = '';
    setEmptyState(false);
    setErrorState(false);
    if (observer) observer.observe(els.sentinel);
    fetchAndRender();
  }

  // ---------- category pills ----------

  function bindCategoryPills() {
    if (!els.pills) return;
    els.pills.addEventListener('click', (e) => {
      const pill = e.target.closest('.category-pill');
      if (!pill) return;

      els.pills.querySelectorAll('.category-pill').forEach((p) =>
        p.classList.remove('category-pill--active')
      );
      pill.classList.add('category-pill--active');

      const categoryId = pill.dataset.categoryId;
      state.categoryId = categoryId ? categoryId : null;
      resetFeed();
    });
  }

  // ---------- infinite scroll ----------

  function bindInfiniteScroll() {
    if (!els.sentinel || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNextPage();
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(els.sentinel);
  }

  function bindRetry() {
    if (!els.retryBtn) return;
    els.retryBtn.addEventListener('click', () => {
      setErrorState(false);
      loadNextPage();
    });
  }

  // ---------- init ----------

  function init() {
    if (!els.grid) return;
    bindCategoryPills();
    bindRetry();
    bindInfiniteScroll();
    resetFeed(); // clears any placeholder/mock markup and does the first real fetch
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();