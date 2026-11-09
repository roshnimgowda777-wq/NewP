/**
 * Interactive Stardust & Meteor Canvas Simulation
 * Renders high-DPI twinkling stars and randomized shooting stars across the cosmic void.
 */

export function initCosmicCanvas(canvasId = 'cosmic-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const starCount = 85;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.8 + 0.2,
    delta: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
  }));

  const meteors = [];

  function spawnMeteor() {
    if (meteors.length < 3 && Math.random() < 0.04) {
      meteors.push({
        x: Math.random() * width * 1.2 - width * 0.1,
        y: Math.random() * (height * 0.5),
        len: Math.random() * 95 + 55,
        speed: Math.random() * 5 + 4,
        thickness: Math.random() * 1.5 + 0.8,
        alpha: 1
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Twinkling Stardust
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.alpha += star.delta;
      if (star.alpha > 0.95 || star.alpha < 0.15) star.delta *= -1;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.alpha.toFixed(3))})`;
      ctx.fill();
    }

    // 2. Realistic Shooting Stars / Meteors
    spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.len, m.y + m.len * 0.6);

      const gradient = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y + m.len * 0.6);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${m.alpha.toFixed(3)})`);
      gradient.addColorStop(0.5, `rgba(181, 197, 249, ${(m.alpha * 0.6).toFixed(3)})`);
      gradient.addColorStop(1, 'rgba(21, 18, 22, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = m.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      m.x += m.speed;
      m.y += m.speed * 0.6;
      m.alpha -= 0.016;

      if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
        meteors.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

