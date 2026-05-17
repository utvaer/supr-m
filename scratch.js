// ── Screen transitions ──────────────────────────────────────────────────────

function showScreen(id) {
  const current = document.querySelector('.screen.active');
  if (current) current.classList.remove('active');

  const next = document.getElementById(id);
  next.classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'screen-scratch') initScratch();
  if (id === 'screen-reveal') launchConfetti();
}

// ── Family cards ─────────────────────────────────────────────────────────────

function revealCard(index) {
  document.getElementById(`reveal-btn-${index}`).style.display = 'none';
  const body = document.getElementById(`body-${index}`);
  body.style.display = 'flex';
  body.style.animation = 'fadeUp 0.45s ease both';
}

function nextFamily(currentIndex) {
  document.getElementById(`card-${currentIndex}`).style.display = 'none';
  const next = document.getElementById(`card-${currentIndex + 1}`);
  next.style.display = 'flex';
  next.style.animation = 'fadeUp 0.4s ease both';
  window.scrollTo(0, 0);
}

// ── Scratch card ─────────────────────────────────────────────────────────────

let scratching = false;
let scratchCanvas, scratchCtx;
let revealed = false;
let drawCount = 0;

function initScratch() {
  scratchCanvas = document.getElementById('scratch-canvas');
  scratchCtx = scratchCanvas.getContext('2d');

  const wrap = scratchCanvas.parentElement;
  scratchCanvas.width = wrap.offsetWidth;
  scratchCanvas.height = wrap.offsetHeight;

  drawCover();

  scratchCanvas.addEventListener('mousedown', onDown);
  scratchCanvas.addEventListener('mousemove', onMove);
  scratchCanvas.addEventListener('mouseup', onUp);
  scratchCanvas.addEventListener('mouseleave', onUp);
  scratchCanvas.addEventListener('touchstart', onDown, { passive: true });
  scratchCanvas.addEventListener('touchmove', onMove, { passive: false });
  scratchCanvas.addEventListener('touchend', onUp);
}

function drawCover() {
  const w = scratchCanvas.width;
  const h = scratchCanvas.height;

  // Blue cover
  scratchCtx.fillStyle = '#4a7ca8';
  scratchCtx.fillRect(0, 0, w, h);

  // Subtle dot grid texture
  scratchCtx.fillStyle = '#3d6d98';
  for (let x = 16; x < w; x += 14) {
    for (let y = 16; y < h; y += 14) {
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, 1.2, 0, Math.PI * 2);
      scratchCtx.fill();
    }
  }

  // Center label
  scratchCtx.fillStyle = 'rgba(255,255,255,0.75)';
  scratchCtx.font = '500 13px "DM Sans", system-ui, sans-serif';
  scratchCtx.textAlign = 'center';
  scratchCtx.textBaseline = 'middle';
  scratchCtx.fillText('Gratte ici', w / 2, h / 2);
}

function getXY(e) {
  const rect = scratchCanvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * (scratchCanvas.width / rect.width),
    y: (src.clientY - rect.top) * (scratchCanvas.height / rect.height),
  };
}

function onDown(e) {
  scratching = true;
  erase(getXY(e));
}

function onMove(e) {
  if (!scratching) return;
  if (e.cancelable) e.preventDefault();
  erase(getXY(e));
}

function onUp() {
  scratching = false;
}

function erase({ x, y }) {
  scratchCtx.globalCompositeOperation = 'destination-out';
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 24, 0, Math.PI * 2);
  scratchCtx.fill();

  drawCount++;
  if (drawCount % 15 === 0) checkReveal();
}

function checkReveal() {
  if (revealed) return;

  const data = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
  let cleared = 0;
  // Sample every 4th pixel for performance
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 128) cleared++;
  }
  const ratio = cleared / (data.length / 16);

  if (ratio > 0.6) {
    revealed = true;
    finishReveal();
  }
}

function restartExperience() {
  // Reset scratch state
  revealed = false;
  drawCount = 0;
  scratching = false;

  // Reset family cards
  for (let i = 0; i < 3; i++) {
    const card = document.getElementById(`card-${i}`);
    const body = document.getElementById(`body-${i}`);
    const btn  = document.getElementById(`reveal-btn-${i}`);
    card.style.display = i === 0 ? 'flex' : 'none';
    card.style.animation = '';
    body.style.display = 'none';
    body.style.animation = '';
    btn.style.display = '';
  }

  showScreen('screen-intro');
}

function finishReveal() {
  // Remove listeners
  scratchCanvas.removeEventListener('mousedown', onDown);
  scratchCanvas.removeEventListener('mousemove', onMove);
  scratchCanvas.removeEventListener('touchstart', onDown);
  scratchCanvas.removeEventListener('touchmove', onMove);

  // Wipe remaining cover then transition
  scratchCtx.globalCompositeOperation = 'destination-out';
  scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

  setTimeout(() => showScreen('screen-reveal'), 900);
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#4a7ca8', '#e8c46a', '#c87a7a', '#7ab87a', '#c8a460', '#a87ac8'];
  const pieces = Array.from({ length: 110 }, () => ({
    x:      Math.random() * canvas.width,
    y:      -12 - Math.random() * 180,
    w:      7  + Math.random() * 7,
    h:      4  + Math.random() * 4,
    color:  COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:     (Math.random() - 0.5) * 2.5,
    vy:     1.8 + Math.random() * 3.5,
    angle:  Math.random() * Math.PI * 2,
    spin:   (Math.random() - 0.5) * 0.18,
    alpha:  1,
  }));

  let frame = 0;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    let any = false;
    for (const p of pieces) {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.07;
      p.angle += p.spin;
      if (frame > 90) p.alpha = Math.max(0, p.alpha - 0.014);

      if (p.y < canvas.height + 20 && p.alpha > 0) any = true;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (any) requestAnimationFrame(tick);
    else canvas.remove();
  }

  requestAnimationFrame(tick);
}
