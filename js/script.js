document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {
  document.body.classList.add('loaded');
}, 2500);

  /* ==========================
     HOME STAGGER FADE
  ========================== */
  const homeElems = document.querySelectorAll('#home .home-elem');
  homeElems.forEach((el, i) =>
    setTimeout(() => el.classList.add('visible'), i * 250)
  );

  /* ==========================
     TYPING EFFECT
  ========================== */
  const typingEl = document.querySelector('.typing');
  const words = ['Software Developer', 'Web Developer', 'Cyber Enthusiast'];
  let w = 0, c = 0, del = false;

  function typeLoop() {
    const word = words[w];
    c = del ? c - 1 : c + 1;
    typingEl.textContent = word.substring(0, c);

    let speed = del ? 50 : 120;
    if (!del && c === word.length) speed = 1200, del = true;
    else if (del && c === 0) del = false, w = (w + 1) % words.length, speed = 500;

    setTimeout(typeLoop, speed);
  }
  typeLoop();

  /* ==========================
     FADE SECTIONS
  ========================== */
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade-section').forEach(s => fadeObserver.observe(s));

  /* ==========================
     NAV ACTIVE LINK
  ========================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        document
          .querySelector(`a[href="#${e.target.id}"]`)
          ?.classList.add('active');
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('section').forEach(sec => spy.observe(sec));

  /* ==========================
     MATRIX CANVAS
  ========================== */
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01アカサタナハマヤラワ<>[]{}$#';
  const fontSize = 14;
  let cols = Math.floor(canvas.width / fontSize);
  let drops = Array(cols).fill(1);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(2,6,23,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#22c55e';
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.random() * chars.length | 0], i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    });
  }

let matrixInterval = 50;
let matrixTimer = setInterval(drawMatrix, matrixInterval);

window.addEventListener('scroll', () => {
  const scrollRatio = window.scrollY / document.body.scrollHeight;
  const newSpeed = Math.max(20, 80 - scrollRatio * 60);

  if (newSpeed !== matrixInterval) {
    matrixInterval = newSpeed;
    clearInterval(matrixTimer);
    matrixTimer = setInterval(drawMatrix, matrixInterval);
  }
});


  /* ==========================
     MATRIX PER SECTION
  ========================== */
  const body = document.body;

  const matrixObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.dataset.matrix === 'on') {
          body.classList.add('matrix-visible');
          body.classList.remove('matrix-hidden');
        } else {
          body.classList.add('matrix-hidden');
          body.classList.remove('matrix-visible');
        }
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('section').forEach(sec => matrixObserver.observe(sec));
});

document.addEventListener('mousemove', e => {
  document.querySelectorAll('.project-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    if (
      e.clientX > rect.left &&
      e.clientX < rect.right &&
      e.clientY > rect.top &&
      e.clientY < rect.bottom
    ) {
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    } else {
      card.style.transform = '';
    }
  });
});

if (window.innerWidth < 768) {
  clearInterval(drawMatrix);
}