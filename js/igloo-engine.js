/**
 * igloo.inc Experience Engine — Native Scroll Edition
 * Uses native browser scroll (zero lag/stutter).
 * Drives reveals, parallax, breadcrumb from the scroll event.
 */

export function initIglooEngine() {
  try { _init(); } catch (err) { console.warn('[igloo-engine]', err); }
}

function _init() {

  /* ══════════════════════════════════════════════
     Warp API (used by scroll-loop.js)
  ══════════════════════════════════════════════ */
  window.__iglooWarp = {
    isWarping: false,
    startWarp()      { this.isWarping = true; },
    endWarp(toY = 0) {
      window.scrollTo(0, toY);
      this.isWarping = false;
    }
  };

  /* ══════════════════════════════════════════════
     1.  NATIVE SCROLL — drive all effects
  ══════════════════════════════════════════════ */
  function onScroll() {
    if (window.__iglooWarp.isWarping) return;
    const scrollY = window.scrollY;
    tickReveal();
    tickBreadcrumb(scrollY);
    tickParallax(scrollY);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ══════════════════════════════════════════════
     2.  AURORA CURSOR (desktop only, never blocks clicks)
  ══════════════════════════════════════════════ */
  const halo      = document.getElementById('cursor-aurora');
  const haloOuter = document.getElementById('cursor-aurora-outer');
  const isTouch   = window.matchMedia('(pointer: coarse)').matches;

  if (halo && haloOuter && !isTouch) {
    halo.style.pointerEvents      = 'none';
    haloOuter.style.pointerEvents = 'none';
    halo.style.display      = 'block';
    haloOuter.style.display = 'block';

    /* Hide native cursor only on desktop via JS */
    document.body.style.cursor = 'none';
    document.querySelectorAll('button, .memory-tag, a').forEach(el => {
      el.style.cursor = 'none';
    });

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let hx = mx, hy = my, ox = mx, oy = my;
    let pressing = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });
    window.addEventListener('mousedown', () => { pressing = true; },  { passive: true });
    window.addEventListener('mouseup',   () => { pressing = false; }, { passive: true });

    function animHalo() {
      hx = lerp(hx, mx, 0.20); hy = lerp(hy, my, 0.20);
      ox = lerp(ox, mx, 0.09); oy = lerp(oy, my, 0.09);
      const s = pressing ? 0.7 : 1;
      halo.style.transform =
        `translate3d(${(hx-10).toFixed(1)}px,${(hy-10).toFixed(1)}px,0) scale(${s})`;
      haloOuter.style.transform =
        `translate3d(${(ox-32).toFixed(1)}px,${(oy-32).toFixed(1)}px,0)`;
      requestAnimationFrame(animHalo);
    }
    animHalo();

    document.querySelectorAll('button, .memory-tag, a, [data-cursor-grow]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        halo.classList.add('aurora-grow');
        haloOuter.classList.add('aurora-outer-grow');
      }, { passive: true });
      el.addEventListener('mouseleave', () => {
        halo.classList.remove('aurora-grow');
        haloOuter.classList.remove('aurora-outer-grow');
      }, { passive: true });
    });
  }

  /* ══════════════════════════════════════════════
     3.  PROGRESS BAR + BREADCRUMB
  ══════════════════════════════════════════════ */
  const progressBar     = document.getElementById('scroll-progress-bar');
  const breadcrumbLabel = document.getElementById('breadcrumb-label');
  const chapters = [
    { el: document.querySelector('section.act-one-hero'), label: 'Chapter 01' },
    { el: document.getElementById('act-two'),             label: 'Chapter 02' },
    { el: document.querySelector('#act-two ~ section'),   label: 'Chapter 03' },
  ].filter(s => s.el);
  let lastCh = -1;

  function tickBreadcrumb(scrollY) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar)
      progressBar.style.width = max > 0 ? ((scrollY / max) * 100).toFixed(1) + '%' : '0%';
    let ch = 0;
    chapters.forEach((s, i) => {
      if (s.el.getBoundingClientRect().top <= window.innerHeight * 0.5) ch = i;
    });
    if (ch !== lastCh) {
      lastCh = ch;
      if (breadcrumbLabel && chapters[ch]) {
        breadcrumbLabel.textContent = chapters[ch].label;
        breadcrumbLabel.classList.remove('breadcrumb-flash');
        void breadcrumbLabel.offsetWidth;
        breadcrumbLabel.classList.add('breadcrumb-flash');
      }
    }
  }

  /* ══════════════════════════════════════════════
     4.  SCROLL-DRIVEN REVEALS
  ══════════════════════════════════════════════ */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  function tickReveal() {
    revealEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) el.classList.add('revealed');
      else if (r.top > window.innerHeight) el.classList.remove('revealed');
    });
  }

  /* ══════════════════════════════════════════════
     5.  PARALLAX
  ══════════════════════════════════════════════ */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  function tickParallax(scrollY) {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax') || '0.3');
      el.style.transform = `translateY(${(scrollY * speed).toFixed(1)}px)`;
    });
  }

  /* Initial pass */
  tickReveal();
  tickBreadcrumb(window.scrollY);
}
