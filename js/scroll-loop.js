/**
 * Cosmic Loop Engine — igloo.inc Style
 * Uses the Warp API from igloo-engine.js for seamless section loops.
 */

import { playBeaconSound } from './audio.js';

export function initSmoothLoop() {
  const viewport = document.getElementById('app-viewport');
  const loopBtn  = document.getElementById('loop-warp-btn');
  let isLooping  = false;
  let lastLoopTime = 0;

  function triggerCosmicLoop() {
    const now = Date.now();
    if (isLooping || now - lastLoopTime < 1200) return;
    isLooping    = true;
    lastLoopTime = now;

    try { playBeaconSound('hrithik'); } catch (_) {}
    if (navigator.vibrate) navigator.vibrate([15, 25]);

    // Freeze kinetic engine
    if (window.__iglooWarp) window.__iglooWarp.startWarp();

    // igloo.inc-style warp: scale-down + blur + bright flash → jump → scale-up
    if (viewport) {
      viewport.style.transition = 'opacity 0.25s cubic-bezier(0.16,1,0.3,1), filter 0.25s ease, transform 0.25s ease';
      viewport.style.opacity    = '0';
      viewport.style.filter     = 'blur(12px) brightness(2)';
      viewport.style.transform  = 'scale(0.96)';
    }

    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      if (window.__iglooWarp) window.__iglooWarp.endWarp(0);

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = '';
        if (viewport) {
          viewport.style.transition = 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), filter 0.3s ease, transform 0.3s ease';
          viewport.style.opacity    = '1';
          viewport.style.filter     = 'blur(0px) brightness(1)';
          viewport.style.transform  = 'scale(1)';
        }
        setTimeout(() => {
          if (viewport) {
            viewport.style.transition = '';
            viewport.style.transform  = '';
            viewport.style.filter     = '';
          }
          isLooping = false;
        }, 350);
      });
    }, 260);
  }

  // Button
  if (loopBtn) {
    loopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerCosmicLoop();
    });
  }

  // Wheel — trigger when pinned at bottom
  let wheelAcc  = 0;
  let wheelTimer = null;
  window.addEventListener('wheel', (e) => {
    if (e.deltaY <= 0) { wheelAcc = 0; return; }
    const scrollY   = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollY >= maxScroll - 60) {
      wheelAcc += e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAcc = 0; }, 400);
      if (wheelAcc > 25) { wheelAcc = 0; triggerCosmicLoop(); }
    }
  }, { passive: true });

  // Touch swipe-up at bottom
  let tStartY = 0;
  window.addEventListener('touchstart', (e) => {
    tStartY = e.touches[0]?.clientY ?? 0;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const tEndY = e.changedTouches[0]?.clientY ?? tStartY;
    const swipeUp = tStartY - tEndY;
    if (swipeUp < 40) return;
    const scrollY   = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollY >= maxScroll - 100) triggerCosmicLoop();
  }, { passive: true });
}
