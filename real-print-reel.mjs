function initializeRealPrintReel(section) {
  const track = section.querySelector('.real-reel-track');
  const cards = [...section.querySelectorAll('.real-reel-card')];
  const filters = [...section.querySelectorAll('[data-real-reel-filter]')];
  const previous = section.querySelector('[data-real-reel-prev]');
  const next = section.querySelector('[data-real-reel-next]');
  const autoplayButton = section.querySelector('[data-real-reel-autoplay]');
  if (!track || !cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  let autoplay = !reducedMotion.matches;
  let selectedVideo = null, manualVideo = null, measureFrame = 0;

  for (const card of cards) {
    const video = card.querySelector('video');
    if (!video) continue;
    video.autoplay = false;
    states.set(video, {
      card, ratio: 0, hovered: false, manualPaused: false, manualPlaying: false,
      pendingPauses: 0, expectedPlay: false, playRequested: false, autoBlocked: false,
    });
  }

  function updateAutoplayButton() {
    section.dataset.realReelAutoplay = String(autoplay);
    if (!autoplayButton) return;
    autoplayButton.setAttribute('aria-pressed', String(autoplay));
    autoplayButton.textContent = autoplay ? 'Pause previews' : 'Play previews';
    autoplayButton.setAttribute('aria-label', autoplay ? 'Pause automatic video previews' : 'Play automatic video previews');
  }

  function hasKeyboardFocus() {
    const focused = document.activeElement;
    return focused && section.contains(focused) && focused.matches(':focus-visible');
  }

  function isFullscreen(video) {
    return document.fullscreenElement === video || document.fullscreenElement?.contains(video)
      || video.webkitDisplayingFullscreen;
  }

  function pauseVideo(video, clearManual = false) {
    const state = states.get(video);
    if (clearManual) {
      state.manualPlaying = false;
      if (manualVideo === video) manualVideo = null;
    }
    if (!video.paused) {
      state.pendingPauses += 1;
      video.pause();
    }
    state.card.dataset.realReelPlayback = 'paused';
  }

  function playPreview(video) {
    const state = states.get(video);
    if (!video.paused || state.playRequested || state.autoBlocked || video.error) return;
    state.expectedPlay = true;
    state.playRequested = true;
    // Only explicit interaction with the native controls may enable sound.
    video.muted = true;
    const request = video.play();
    Promise.resolve(request).then(() => {
      state.playRequested = false;
      reconcile();
    }).catch(error => {
      state.playRequested = false;
      state.expectedPlay = false;
      if (error.name !== 'AbortError') state.autoBlocked = true;
      state.card.dataset.realReelPlayback = 'paused';
    });
  }

  function reconcile() {
    if (document.hidden) {
      states.forEach((state, video) => pauseVideo(video, true));
      section.dataset.realReelState = 'offscreen';
      return;
    }
    if (manualVideo) {
      const manual = states.get(manualVideo);
      if (manual.card.hidden || manual.ratio <= .01 || !manual.manualPlaying) pauseVideo(manualVideo, true);
    }
    const focused = hasKeyboardFocus();
    let playing = false;
    states.forEach((state, video) => {
      if (state.card.hidden || state.ratio <= .01) {
        pauseVideo(video, true);
        return;
      }
      if (video === manualVideo && state.manualPlaying) {
        state.card.dataset.realReelPlayback = 'manual';
        playing = true;
        return;
      }
      const shouldPreview = autoplay && !manualVideo && video === selectedVideo
        && !state.manualPaused && !state.hovered && !focused && !state.autoBlocked && !video.error;
      if (shouldPreview) {
        playPreview(video);
        state.card.dataset.realReelPlayback = video.paused ? 'loading' : 'preview';
        playing = !video.paused || playing;
      } else {
        pauseVideo(video);
      }
    });
    section.dataset.realReelState = playing ? 'playing' : selectedVideo ? 'paused' : 'offscreen';
  }

  function measure() {
    measureFrame = 0;
    const bounds = track.getBoundingClientRect();
    const left = Math.max(0, bounds.left), right = Math.min(window.innerWidth, bounds.right);
    const top = Math.max(0, bounds.top), bottom = Math.min(window.innerHeight, bounds.bottom);
    let bestRatio = .3, bestVideo = null;
    states.forEach((state, video) => {
      const screen = video.getBoundingClientRect();
      const width = Math.max(0, Math.min(right, screen.right) - Math.max(left, screen.left));
      const height = Math.max(0, Math.min(bottom, screen.bottom) - Math.max(top, screen.top));
      state.ratio = !state.card.hidden && screen.width && screen.height ? width * height / (screen.width * screen.height) : 0;
      if (isFullscreen(video)) state.ratio = 1;
      // Keep the leftmost card when two are equally visible.
      if (state.ratio > bestRatio + .001) {
        bestRatio = state.ratio;
        bestVideo = video;
      }
    });
    selectedVideo = bestVideo;
    states.forEach((state, video) => { state.card.dataset.realReelSelected = String(video === selectedVideo); });
    const end = Math.max(0, track.scrollWidth - track.clientWidth);
    if (previous) previous.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= end - 2;
    reconcile();
  }

  function scheduleMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }

  function selectFilter(kind) {
    if (!filters.some(button => button.dataset.realReelFilter === kind)) return;
    states.forEach((state, video) => pauseVideo(video, true));
    cards.forEach(card => { card.hidden = card.dataset.realReelKind !== kind; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.realReelFilter === kind)));
    section.dataset.realReelFilter = kind;
    track.scrollTo({ left: 0, behavior: 'instant' });
    measure();
  }

  function scrollCards(direction) {
    const visible = cards.find(card => !card.hidden);
    if (!visible) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (visible.getBoundingClientRect().width + gap),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  filters.forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.realReelFilter)));
  previous?.addEventListener('click', () => scrollCards(-1));
  next?.addEventListener('click', () => scrollCards(1));
  autoplayButton?.addEventListener('click', () => {
    autoplay = !autoplay;
    if (!autoplay) states.forEach((state, video) => pauseVideo(video, true));
    else states.forEach(state => { state.autoBlocked = false; });
    updateAutoplayButton();
    reconcile();
  });

  states.forEach((state, video) => {
    state.card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      state.hovered = true;
      reconcile();
    });
    state.card.addEventListener('pointerleave', () => {
      state.hovered = false;
      reconcile();
    });
    video.addEventListener('play', () => {
      if (state.expectedPlay) {
        state.expectedPlay = false;
      } else {
        state.manualPaused = false;
        state.manualPlaying = true;
        state.autoBlocked = false;
        manualVideo = video;
        states.forEach((other, otherVideo) => {
          if (otherVideo !== video) pauseVideo(otherVideo, true);
        });
      }
      measure();
    });
    video.addEventListener('pause', () => {
      if (state.pendingPauses > 0) {
        state.pendingPauses -= 1;
        return;
      }
      // The existing page visibility handler also pauses all videos.
      if (!video.paused) return;
      if (!document.hidden && !state.card.hidden && state.ratio > .01) state.manualPaused = true;
      state.manualPlaying = false;
      if (manualVideo === video) manualVideo = null;
      state.card.dataset.realReelPlayback = 'paused';
      reconcile();
    });
    video.addEventListener('error', () => {
      state.autoBlocked = true;
      pauseVideo(video, true);
      state.card.dataset.realReelPlayback = 'unavailable';
    });
    video.addEventListener('webkitbeginfullscreen', measure);
    video.addEventListener('webkitendfullscreen', measure);
  });

  track.addEventListener('scroll', scheduleMeasure, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      scrollCards(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  section.addEventListener('focusin', reconcile);
  section.addEventListener('focusout', () => queueMicrotask(reconcile));
  window.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  document.addEventListener('visibilitychange', measure);
  document.addEventListener('fullscreenchange', measure);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      autoplay = false;
      states.forEach((state, video) => {
        if (!state.manualPlaying) pauseVideo(video);
      });
    }
    updateAutoplayButton();
    reconcile();
  });
  new ResizeObserver(scheduleMeasure).observe(track);
  const observer = new IntersectionObserver(scheduleMeasure, { threshold: [0, .3, .6, 1] });
  observer.observe(track);
  updateAutoplayButton();
  const initial = filters.find(button => button.getAttribute('aria-pressed') === 'true');
  selectFilter(initial?.dataset.realReelFilter || 'turns');
}

document.querySelectorAll('#real-print-reel').forEach(initializeRealPrintReel);
