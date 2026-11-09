/**
 * Interactive 3D Lunar Crystal Controller (igloo.inc Physics & Specular Lighting)
 * Implements 3D perspective tilt, dynamic specular light refraction,
 * inertial flick physics, and mobile gyroscope orientation.
 */

export function initMoonPhysics(stageId = 'crystal-stage', moonId = 'interactive-moon', surfaceId = 'lunar-surface') {
  const stageEl = document.getElementById(stageId);
  const moonEl = document.getElementById(moonId);
  const surfaceEl = document.getElementById(surfaceId);
  const memoryTags = document.querySelectorAll('.memory-tag');
  if (!moonEl || !surfaceEl) return;

  // Rotational Physics State
  let currentRotation = 0;       // Continuous spin angle (degrees)
  let spinVelocity = 0.08;       // Passive auto-orbit speed
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastMoveTime = 0;
  let deltaHistory = [];

  // 3D Spatial Tilt State (igloo.inc style)
  let targetTiltX = 0;          // Degrees
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let lightX = 42;              // Percentage for specular light spot
  let lightY = 35;
  let targetLightX = 42;
  let targetLightY = 35;

  // Floating oscillation offset
  let floatOffset = 0;

  // 1. Render loop with smooth dampening (lerp)
  function renderLoop() {
    floatOffset += 0.02;
    const floatY = Math.sin(floatOffset) * 4;

    // Smooth tilt interpolation
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;
    lightX += (targetLightX - lightX) * 0.1;
    lightY += (targetLightY - lightY) * 0.1;

    // Update CSS variables for specular light reflection
    document.documentElement.style.setProperty('--light-x', `${lightX.toFixed(1)}%`);
    document.documentElement.style.setProperty('--light-y', `${lightY.toFixed(1)}%`);

    // Spin physics
    if (!isDragging) {
      if (Math.abs(spinVelocity) > 0.08) {
        currentRotation += spinVelocity;
        spinVelocity *= 0.95; // Inertial decay
      } else {
        spinVelocity = 0.08;
        currentRotation = (currentRotation + spinVelocity) % 360;
      }
    }

    // Apply 3D perspective transforms to Moon container
    moonEl.style.transform = `translateY(${floatY.toFixed(2)}px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    surfaceEl.style.transform = `rotate(${currentRotation.toFixed(2)}deg)`;

    // Parallax shift on constellation tags overlay (smooth 2D translation without overwriting individual tag transforms)
    const tagsOverlay = document.getElementById('memory-tags-overlay');
    if (tagsOverlay) {
      const tagShiftX = currentTiltY * 0.4;
      const tagShiftY = currentTiltX * -0.4;
      tagsOverlay.style.transform = `translate(${tagShiftX.toFixed(1)}px, ${tagShiftY.toFixed(1)}px)`;
    }

    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // 2. Pointer / Mouse Movement (Cursor tracking & 3D tilt like igloo.inc)
  window.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = moonEl.getBoundingClientRect();
    const moonCenterX = rect.left + rect.width / 2;
    const moonCenterY = rect.top + rect.height / 2;

    const diffX = e.clientX - moonCenterX;
    const diffY = e.clientY - moonCenterY;
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.6;

    // Convert mouse position to subtle 3D tilt (-18deg to +18deg)
    targetTiltY = (diffX / maxDist) * 22;
    targetTiltX = (-diffY / maxDist) * 22;

    // Shift specular light glint relative to pointer
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    targetLightX = 20 + normX * 60;
    targetLightY = 15 + normY * 60;
  }, { passive: true });

  // Reset tilt gently when mouse leaves window
  document.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
    targetLightX = 42;
    targetLightY = 35;
  });

  // 3. Touch Drag & Inertial Flick Physics
  const onPointerStart = (clientX, clientY) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    spinVelocity = 0;
    lastMoveTime = performance.now();
    deltaHistory = [];
  };

  const onPointerMove = (clientX, clientY) => {
    if (!isDragging) return;
    const now = performance.now();
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    const dt = Math.max(1, now - lastMoveTime);

    const stepDiff = (deltaX - deltaY * 0.3) * 0.75;
    currentRotation += stepDiff;

    // 3D tilt follows drag direction dynamically
    targetTiltY = Math.max(-25, Math.min(25, deltaX * 0.4));
    targetTiltX = Math.max(-25, Math.min(25, -deltaY * 0.4));

    // Calculate instantaneous velocity for flick release
    const instantVelocity = stepDiff / (dt / 16.6);
    deltaHistory.push(instantVelocity);
    if (deltaHistory.length > 5) deltaHistory.shift();

    startX = clientX;
    startY = clientY;
    lastMoveTime = now;
  };

  const onPointerEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    targetTiltX = 0;
    targetTiltY = 0;

    // Average flick momentum
    if (deltaHistory.length > 0) {
      const avg = deltaHistory.reduce((a, b) => a + b, 0) / deltaHistory.length;
      spinVelocity = Math.max(-12, Math.min(12, avg));
    }
  };

  // Mouse Listeners
  moonEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onPointerStart(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', onPointerEnd);

  // Touch Listeners (Mobile)
  moonEl.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      onPointerStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', onPointerEnd, { passive: true });

  // 4. Mobile Gyroscope / Device Orientation Support (igloo.inc physical tilt)
  if (window.DeviceOrientationEvent) {
    const handleOrientation = (e) => {
      if (isDragging) return;
      const gamma = e.gamma || 0; // Left to right [-90, 90]
      const beta = e.beta || 0;   // Front to back [-180, 180]

      // Map phone tilt to 3D lunar crystal angles
      targetTiltY = Math.max(-22, Math.min(22, gamma * 0.7));
      targetTiltX = Math.max(-22, Math.min(22, (beta - 45) * 0.5));
      targetLightX = 50 + targetTiltY * 1.2;
      targetLightY = 50 + targetTiltX * 1.2;
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  }

  // 5. Scroll-Linked Planetary Rotation
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    currentRotation += delta * 0.05;
  }, { passive: true });
}
