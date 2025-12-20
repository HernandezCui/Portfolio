document.addEventListener('DOMContentLoaded', () => {
  // Boot screen
  setTimeout(() => document.body.classList.add('loaded'), 2200);

  // HOME stagger fade
  document.querySelectorAll('#home .home-elem').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 220);
  });

  // Reveal hero image
  const heroRight = document.querySelector('.hero-right');
  setTimeout(() => heroRight?.classList.add('reveal'), 550);

  // Typing effect
  const typingEl = document.querySelector('.typing');
  if (typingEl) {
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

  /* ==========================
     MATRIX (mouse reactive)
  ========================== */
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas?.getContext('2d');
  const body = document.body;

  if (canvas && ctx) {
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

    const logo = document.querySelector('.logo');
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

    // Mobile optimization
    if (window.innerWidth < 768) {
      if (matrixTimer) clearInterval(matrixTimer);
      body.classList.add('matrix-hidden');
      body.classList.remove('matrix-visible');
    }
  }

  /* ==========================
     3D tilt for project cards
  ========================== */
  const canTilt = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (canTilt) {
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

        card.style.transform =
          `perspective(900px)
           rotateY(${x * 10}deg)
           rotateX(${-y * 10}deg)
           translateY(-2px)`;
      });
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.querySelectorAll('.project-card').forEach(card => (card.style.transform = ''));
    });
  }

  /* ==========================
     Projects loader
  ========================== */
  const container = document.getElementById('projectsContainer');
  const loadLocalBtn = document.getElementById('loadLocal');
  const loadGitHubBtn = document.getElementById('loadGitHub');

  function renderProjects(projects) {
    if (!container) return;
    container.innerHTML = '';

    projects.forEach(p => {
      const a = document.createElement('a');
      a.className = 'project-card';
      a.href = p.link;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.setAttribute('aria-label', `Open project: ${p.title}`);

      const tech = Array.isArray(p.tech) ? p.tech : [];
      const techHTML = tech.map(t => `<span>${t}</span>`).join('');

      const imgHTML = p.image
        ? `<img class="project-thumb" src="${p.image}" alt="${p.title} preview" loading="lazy" />`
        : '';

      a.innerHTML = `
        ${imgHTML}
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="project-tech">${techHTML}</div>
        <div class="project-cta">Open Project →</div>
      `;

      container.appendChild(a);
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

    const mapped = data.slice(0, 6).map(repo => ({
      title: repo.name,
      description: repo.description || 'No description yet.',
      link: repo.html_url,
      tech: repo.language ? [repo.language] : [],
      image: '' // GitHub API doesn't give preview images
    }));

    renderProjects(mapped);
  }

  loadLocalBtn?.addEventListener('click', () => loadLocal().catch(() => {}));
  loadGitHubBtn?.addEventListener('click', () => loadGitHub().catch(() => {}));

  // initial load
  loadLocal().catch(() => {});
});

/* ==========================
   CURSOR TRAIL
========================== */
(() => {
  const trailWrap = document.getElementById('cursorTrail');
  if (!trailWrap) return;

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
})();

