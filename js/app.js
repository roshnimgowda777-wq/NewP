/**
 * Celestial Mobile Application Core — igloo.inc Edition
 * Connects: igloo scroll engine, cursor aurora, 3D moon physics,
 * memory constellations, cosmic audio, infinite loop, secret drawer.
 */

import { initCosmicCanvas }  from './cosmos.js';
import { initMoonPhysics }   from './moon.js';
import { initSmoothLoop }    from './scroll-loop.js';
import { initIglooEngine }   from './igloo-engine.js';
import { playBeaconSound, toggleCosmicLofi } from './audio.js';

// ── Purge stale service workers & caches ──────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

// ── Default Memory Beacons ─────────────────────────────────────────────────
const DEFAULT_MEMORIES = {
  burrito:  "The late night food truck stop when you stole my fries and smiled that unforgettable midnight smile.",
  polar:    "Our silly code for cozying up under three layers of fleece duvets in December.",
  naturals: "Tender coconut and Roasted almond ice creams in paper cup and a cone while walking the quietly eating.",
  dumbass:  "The affectionate whisper right after one of us dropped our keys down the hallway rug again.",
  hrithik:  "Your exaggerated attempt to recreate the 'Kaho Naa Pyaar Hai' hook step inside the empty kitchen.",
  yrc:      "The quiet roof ledge where we watched the city dim its headlights and made wishes on passing flights.",
  bgs:      "Blue skies, green grass, and secret glances exchanged when nobody else was looking our way."
};

function getSavedMemories() {
  try {
    const saved = localStorage.getItem('celestial_memories');
    if (saved) return { ...DEFAULT_MEMORIES, ...JSON.parse(saved) };
  } catch (_) {}
  return { ...DEFAULT_MEMORIES };
}

function saveMemory(key, text) {
  try {
    const current = getSavedMemories();
    current[key] = text;
    localStorage.setItem('celestial_memories', JSON.stringify(current));
  } catch (_) {}
}

// ── Boot on DOM ready ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const memories = getSavedMemories();

  // 1. igloo.inc scroll engine (kinetic + cursor + reveal + parallax)
  initIglooEngine();

  // 2. Stardust canvas
  initCosmicCanvas('cosmic-canvas');

  // 3. 3D Crystal Moon
  initMoonPhysics('crystal-stage', 'interactive-moon', 'lunar-surface');

  // 4. Cosmic loop engine
  initSmoothLoop();

  // 5. Audio toggle
  const audioBtn  = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCosmicLofi(audioIcon);
    });
  }

  // 6. Memory constellation tags
  const tags        = document.querySelectorAll('.memory-tag');
  const displayTitle = document.getElementById('memory-title');
  const displayText  = document.getElementById('memory-text');
  const displayCard  = document.getElementById('memory-display');
  const editBtn      = document.getElementById('edit-memory-btn');

  let activeBeacon = null;

  tags.forEach(tag => {
    const beacon = tag.getAttribute('data-beacon');
    if (beacon && memories[beacon]) {
      tag.setAttribute('data-memory', memories[beacon]);
    }

    const activateTag = (e) => {
      if (e) { e.stopPropagation(); e.preventDefault(); }

      activeBeacon = tag.getAttribute('data-beacon');
      const currentMem = getSavedMemories();
      const text  = currentMem[activeBeacon] || tag.getAttribute('data-memory');
      const labelEl = tag.querySelector('.tag-label') || tag.querySelector('span:last-child') || tag;
      const label = labelEl.textContent.trim();

      // Sound + haptic
      if (activeBeacon) { try { playBeaconSound(activeBeacon); } catch (_) {} }
      if (navigator.vibrate) navigator.vibrate([20, 45, 20]);

      // Halo ring
      tags.forEach(t => t.classList.remove('halo-active'));
      tag.classList.add('halo-active');
      setTimeout(() => tag.classList.remove('halo-active'), 800);

      // Update card
      if (displayTitle && displayText && displayCard) {
        displayTitle.textContent = label;
        displayText.textContent  = text;
        if (editBtn) {
          editBtn.classList.remove('opacity-0', 'pointer-events-none');
        }
        displayCard.style.transform = 'scale(1.03)';
        displayCard.style.boxShadow  = '0 0 30px rgba(196,208,255,0.18)';
        setTimeout(() => {
          displayCard.style.transform = 'scale(1)';
          displayCard.style.boxShadow = '';
        }, 220);
      }
    };

    tag.addEventListener('click', activateTag);
    tag.addEventListener('touchend', (e) => {
      e.stopPropagation();
      activateTag(e);
    });
    tag.addEventListener('pointerdown', (e) => e.stopPropagation());
    tag.addEventListener('touchstart',  (e) => e.stopPropagation(), { passive: true });
  });

  // 7. Memory Edit Modal
  const editModal    = document.getElementById('memory-edit-modal');
  const modalTitle   = document.getElementById('modal-beacon-title');
  const modalInput   = document.getElementById('modal-memory-input');
  const closeModalBtn = document.getElementById('close-memory-modal');
  const cancelModalBtn = document.getElementById('cancel-memory-edit');
  const saveModalBtn  = document.getElementById('save-memory-edit');

  function openEditModal() {
    if (!activeBeacon || !editModal) return;
    const cur = getSavedMemories();
    const activeTag = document.querySelector(`.memory-tag[data-beacon="${activeBeacon}"]`);
    if (modalTitle && activeTag) {
      const lbl = (activeTag.querySelector('span:last-child') || activeTag).textContent.trim();
      modalTitle.textContent = `Edit "${lbl}"`;
    }
    if (modalInput) modalInput.value = cur[activeBeacon] || '';
    editModal.classList.remove('opacity-0', 'pointer-events-none');
    if (modalInput) modalInput.focus();
  }

  function closeEditModal() {
    if (!editModal) return;
    editModal.classList.add('opacity-0', 'pointer-events-none');
  }

  if (editBtn)      editBtn.addEventListener('click', openEditModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeEditModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeEditModal);
  if (saveModalBtn) {
    saveModalBtn.addEventListener('click', () => {
      if (!activeBeacon || !modalInput) return;
      const newText = modalInput.value.trim();
      if (newText) {
        saveMemory(activeBeacon, newText);
        if (displayText) displayText.textContent = newText;
        const activeTag = document.querySelector(`.memory-tag[data-beacon="${activeBeacon}"]`);
        if (activeTag) activeTag.setAttribute('data-memory', newText);
      }
      closeEditModal();
      if (navigator.vibrate) navigator.vibrate(25);
    });
  }

  // 8. Secret Stardust Drawer
  const drawerToggle   = document.getElementById('drawer-toggle');
  const drawerClose    = document.getElementById('drawer-close');
  const drawer         = document.getElementById('secret-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.remove('translate-y-full');
    drawer.classList.add('pointer-events-auto');
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('pointer-events-none', 'opacity-0');
      drawerBackdrop.classList.add('opacity-100');
    }
    if (navigator.vibrate) navigator.vibrate(25);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add('translate-y-full');
    drawer.classList.remove('pointer-events-auto');
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('opacity-100');
      drawerBackdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  if (drawerToggle)   drawerToggle.addEventListener('click', openDrawer);
  if (drawerClose)    drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Swipe-down to close drawer
  let dTouchStart = 0;
  if (drawer) {
    drawer.addEventListener('touchstart', (e) => { dTouchStart = e.touches[0].clientY; }, { passive: true });
    drawer.addEventListener('touchmove',  (e) => {
      if (e.touches[0].clientY - dTouchStart > 60) closeDrawer();
    }, { passive: true });
  }

  // 9. Desktop viewport mode toggle
  const viewToggle   = document.getElementById('view-mode-toggle');
  const appViewport  = document.getElementById('app-viewport');
  if (viewToggle && appViewport) {
    viewToggle.addEventListener('click', () => {
      const isExp = appViewport.classList.toggle('mode-expanded');
      const lbl   = viewToggle.querySelector('span:last-child');
      if (lbl) lbl.textContent = isExp ? 'Compact Phone Frame' : 'Expand Viewport';
    });
  }
});
