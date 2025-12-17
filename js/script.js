document.addEventListener('DOMContentLoaded', () => {
  // Boot screen
  setTimeout(() => document.body.classList.add('loaded'), 2200);

  // HOME stagger fade (runs on load reliably)
  const homeElems = document.querySelectorAll('#home .home-elem');
  homeElems.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 220));

  // Reveal hero image after text starts
const heroRight = document.querySelector('.hero-right');
setTimeout(() => heroRight?.classList.add('reveal'), 550);

  // Typing effect
  const typingEl = document.querySelector('.typing');
  const words = ['Software Developer', 'Web Developer', 'Cyber Enthusiast'];
  let w = 0, c = 0, del = false;

  function typeLoop() {
    if (!typingEl) return;
    const word = words[w];

    c = del ? c - 1 : c + 1;
    typingEl.textContent = word.substring(0, c);

    let speed = del ? 55 : 120;
    if (!del && c === word.length) { del = true; speed = 1100; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; speed = 500; }

    setTimeout(typeLoop, speed);
  }
  typeLoop();

  // Fade-in sections
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.18 });

  document.querySelectorAll('.fade-section').forEach(s => fadeObserver.observe(s));

  // Nav active link
  const navLinks = document.querySelectorAll('.nav-link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector(`a[href="#${e.target.id}"]`)?.classList.add('active');
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('section').forEach(sec => spy.observe(sec));

  // ==========================
  // MATRIX (mouse reactive)
  // ==========================
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const body = document.body;

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  let burstUntil = 0; // timestamp for burst mode


  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  });

  window.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  const logo = document.querySelector('.logo');

logo?.addEventListener('mouseenter', () => {
  // burst for 650ms
  burstUntil = Date.now() + 650;
  // center burst near logo
  const r = logo.getBoundingClientRect();
  mouseX = r.left + r.width / 2;
  mouseY = r.top + r.height / 2;
  mouseActive = true;
});

logo?.addEventListener('mouseleave', () => {
  // let it fade naturally
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

  // scroll-based speed (stable + safe)
  let matrixInterval = 50;
  let matrixTimer = null;

  function drawMatrix() {
    // fade trail
    ctx.fillStyle = 'rgba(2,6,23,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // base color
    ctx.fillStyle = '#22c55e';
    ctx.font = `${fontSize}px monospace`;

    // mouse influence radius
    const now = Date.now();
    const bursting = now < burstUntil;
    const radius = bursting ? 260 : 140;

    for (let i = 0; i < drops.length; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Mouse-reactive brightness + “push”
      if (mouseActive) {
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          // brighten near mouse
        ctx.fillStyle = bursting ? '#38bdf8' : '#22c55e';

          // push the stream upward slightly near mouse
          drops[i] = Math.max(0, drops[i] - (bursting ? 6 : 2));
        } else {
          ctx.fillStyle = '#22c55e';
        }
      }

      const ch = chars[(Math.random() * chars.length) | 0];
      ctx.fillText(ch, x, y);

      // reset with randomness
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

  // Matrix per-section visibility
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

  document.querySelectorAll('section').forEach(sec => matrixObserver.observe(sec));

  // Mobile optimization (turn matrix off)
  if (window.innerWidth < 768) {
    if (matrixTimer) clearInterval(matrixTimer);
    body.classList.add('matrix-hidden');
    body.classList.remove('matrix-visible');
  }

  // ==========================
  // 3D tilt project cards
  // ==========================
  document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.project-card').forEach(card => {
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
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
  }, { passive: true });

  // ==========================
  // Projects loader (safe)
  // ==========================
  const container = document.getElementById('projectsContainer');
  const loadLocalBtn = document.getElementById('loadLocal');
  const loadGitHubBtn = document.getElementById('loadGitHub');

  function renderProjects(projects) {
    if (!container) return;
    container.innerHTML = '';
    projects.forEach(p => {
      const div = document.createElement('div');
      div.className = 'project-card fade-section visible';
      div.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p><a href="${p.link}" target="_blank" rel="noreferrer">View</a>`;
      container.appendChild(div);
    });
  }

  async function loadLocal() {
    const res = await fetch('data/projects.json');
    const data = await res.json();
    renderProjects(data);
  }

  async function loadGitHub() {
    const res = await fetch('https://api.github.com/users/HernandezCui/repos');
    const data = await res.json();
    renderProjects(data.slice(0, 6).map(repo => ({
      title: repo.name,
      description: repo.description || 'No description',
      link: repo.html_url
    })));
  }

  loadLocalBtn?.addEventListener('click', loadLocal);
  loadGitHubBtn?.addEventListener('click', loadGitHub);

  // initial load
  loadLocal().catch(() => {});
});

// ==========================
//      CURSOR TRAIL
// ==========================
const trailWrap = document.getElementById('cursorTrail');
if (trailWrap) {
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
