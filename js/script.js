// ==========================
// Helpers
// ==========================
const isFinePointer = () => window.matchMedia('(hover:hover) and (pointer:fine)').matches;

function $(sel, root = document) {
  return root.querySelector(sel);
}
function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

// ==========================
// Boot + Home Intro
// ==========================
function initBoot() {
  setTimeout(() => document.body.classList.add('loaded'), 2200);
}

function initHomeStagger() {
  $all('#home .home-elem').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 220);
  });

  const heroRight = $('.hero-right');
  setTimeout(() => heroRight?.classList.add('reveal'), 550);
}

function initTyping() {
  const typingEl = $('.typing');
  if (!typingEl) return;

  const words = ['Software Developer', 'Web Developer', 'Cyber Enthusiast'];
  let w = 0, c = 0, del = false;

  (function typeLoop() {
    const word = words[w];
    c = del ? c - 1 : c + 1;
    typingEl.textContent = word.substring(0, c);

    let speed = del ? 55 : 120;
    if (!del && c === word.length) { del = true; speed = 1100; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; speed = 500; }

    setTimeout(typeLoop, speed);
  })();
}

// ==========================
// Section fade + nav active
// ==========================
function initFadeIn() {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.18 });

  $all('.fade-section').forEach(s => fadeObserver.observe(s));
}

function initNavSpy() {
  const navLinks = $all('.nav-link');

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`a[href="#${e.target.id}"]`);
      a?.classList.add('active');
    });
  }, { threshold: 0.6 });

  $all('section').forEach(sec => spy.observe(sec));
}

// ==========================
// Matrix
// ==========================
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const body = document.body;

  let mouseX = -9999, mouseY = -9999;
  let mouseActive = false;
  let burstUntil = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  const logo = $('.logo');
  logo?.addEventListener('mouseenter', () => {
    burstUntil = Date.now() + 650;
    const r = logo.getBoundingClientRect();
    mouseX = r.left + r.width / 2;
    mouseY = r.top + r.height / 2;
    mouseActive = true;
  });

  const chars = '01アカサタナハマヤラワ<>[]{}$#';
  const fontSize = 14;
  let cols = 0;
  let drops = [];

  function setupMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array(cols).fill(1);
  }

  setupMatrix();
  window.addEventListener('resize', setupMatrix);

  let matrixInterval = 50;
  let matrixTimer = null;

  function drawMatrix() {
    ctx.fillStyle = 'rgba(2,6,23,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;

    const now = Date.now();
    const bursting = now < burstUntil;
    const radius = bursting ? 260 : 140;

    for (let i = 0; i < drops.length; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = '#22c55e';

      if (mouseActive) {
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          ctx.fillStyle = bursting ? '#38bdf8' : '#22c55e';
          drops[i] = Math.max(0, drops[i] - (bursting ? 6 : 2));
        }
      }

      const ch = chars[(Math.random() * chars.length) | 0];
      ctx.fillText(ch, x, y);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function restartMatrixTimer() {
    if (matrixTimer) clearInterval(matrixTimer);
    matrixTimer = setInterval(drawMatrix, matrixInterval);
  }
  restartMatrixTimer();

  window.addEventListener('scroll', () => {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const ratio = window.scrollY / maxScroll;
    const newSpeed = Math.round(Math.max(22, 70 - ratio * 45));
    if (newSpeed !== matrixInterval) {
      matrixInterval = newSpeed;
      restartMatrixTimer();
    }
  }, { passive: true });

  // Per-section visibility
  const matrixObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.dataset.matrix === 'on') {
        body.classList.add('matrix-visible');
        body.classList.remove('matrix-hidden');
      } else {
        body.classList.add('matrix-hidden');
        body.classList.remove('matrix-visible');
      }
    });
  }, { threshold: 0.55 });

  $all('section').forEach(sec => matrixObserver.observe(sec));

  // Mobile optimization
  if (window.innerWidth < 768) {
    if (matrixTimer) clearInterval(matrixTimer);
    body.classList.add('matrix-hidden');
    body.classList.remove('matrix-visible');
  }
}

// ==========================
// Projects
// ==========================
function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  container.innerHTML = '';

  projects.forEach(p => {
    const a = document.createElement('a');
    a.className = 'project-card';
    a.href = p.link || '#';
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.setAttribute('aria-label', `Open project: ${p.title || 'Project'}`);

    const tech = Array.isArray(p.tech) ? p.tech : [];
    const techHTML = tech.map(t => `<span>${t}</span>`).join('');

    const imgHTML = p.image
      ? `<img class="project-thumb" src="${p.image}" alt="${p.title || 'Project'} preview" loading="lazy" />`
      : '';

    a.innerHTML = `
      ${imgHTML}
      <h3>${p.title || 'Untitled Project'}</h3>
      <p>${p.description || ''}</p>
      <div class="project-tech">${techHTML}</div>
      <div class="project-cta">Open Project →</div>
    `;

    container.appendChild(a);
  });
}

async function loadLocalProjects() {
  const res = await fetch('data/projects.json');
  if (!res.ok) throw new Error('Could not load data/projects.json');
  const data = await res.json();
  renderProjects(data);
}

async function loadGitHubProjects() {
  const res = await fetch('https://api.github.com/users/HernandezCui/repos');
  if (!res.ok) throw new Error('Could not load GitHub repos');
  const data = await res.json();

  const mapped = data.slice(0, 6).map(repo => ({
    title: repo.name,
    description: repo.description || 'No description yet.',
    link: repo.html_url,
    tech: repo.language ? [repo.language] : [],
    image: '' // GitHub API doesn't provide preview images
  }));

  renderProjects(mapped);
}

function initProjects() {
  loadLocalProjects().catch(() => {});
}

// ==========================
// 3D tilt
// ==========================
function initProjectTilt() {
  if (!isFinePointer()) return;

  document.addEventListener('mousemove', (e) => {
    $all('.project-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const inside =
        e.clientX > rect.left && e.clientX < rect.right &&
        e.clientY > rect.top && e.clientY < rect.bottom;

      if (!inside) {
        card.style.transform = '';
        return;
      }

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(900px)
         rotateY(${x * 10}deg)
         rotateX(${-y * 10}deg)
         translateY(-2px)`;
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    $all('.project-card').forEach(card => (card.style.transform = ''));
  });
}
/* ==========================
   3D tilt for SKILLS cards
========================== */
const canTiltSkills = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

if (canTiltSkills) {
  document.querySelectorAll('.skills-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      card.style.transform =
        `perspective(900px)
         rotateY(${x * 10}deg)
         rotateX(${-y * 10}deg)
         translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ==========================
// Cursor trail
// ==========================
function initCursorTrail() {
  const trailWrap = document.getElementById('cursorTrail');
  if (!trailWrap) return;
  if (!isFinePointer()) return;

  const dots = [];
  const DOTS = 18;

  for (let i = 0; i < DOTS; i++) {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    trailWrap.appendChild(d);
    dots.push({ el: d, x: -9999, y: -9999 });
  }

  let tx = -9999, ty = -9999;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function animateTrail() {
    let x = tx, y = ty;

    dots.forEach((dot, i) => {
      const speed = Math.max(0.08, 0.28 - i * 0.01);
      dot.x += (x - dot.x) * speed;
      dot.y += (y - dot.y) * speed;

      dot.el.style.left = dot.x + 'px';
      dot.el.style.top = dot.y + 'px';
      dot.el.style.opacity = String(1 - i / DOTS);

      x = dot.x;
      y = dot.y;
    });

    requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

// ==========================
// About: Bitmoji mouse parallax
// ==========================
function initAboutParallax() {
  if (!isFinePointer()) return;

  const aboutSection = document.getElementById('about');
  const bitmoji = document.querySelector('.bitmoji-img');
  if (!aboutSection || !bitmoji) return;

  let bx = 0, by = 0;
  let tx = 0, ty = 0;
  const strength = 14;

  function animate() {
    bx += (tx - bx) * 0.12;
    by += (ty - by) * 0.12;
    bitmoji.style.transform = `translate(${bx}px, ${by}px)`;
    requestAnimationFrame(animate);
  }
  animate();

  aboutSection.addEventListener('mousemove', (e) => {
    const r = aboutSection.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);

    tx = Math.max(-1, Math.min(1, dx)) * strength;
    ty = Math.max(-1, Math.min(1, dy)) * strength;
  });

  aboutSection.addEventListener('mouseleave', () => {
    tx = 0; ty = 0;
  });
}

// ==========================
// Init everything
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initHomeStagger();
  initTyping();
  initFadeIn();
  initNavSpy();

  initMatrix();
  initProjects();
  initProjectTilt();

  initCursorTrail();
  initAboutParallax();
});

