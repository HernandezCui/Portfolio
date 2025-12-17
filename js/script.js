// ===== Scroll Animations =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
});

document.querySelectorAll('.fade-section').forEach(s => observer.observe(s));

// ===== Dark Mode =====
const toggle = document.getElementById('themeToggle');
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

toggle.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

// ===== CONTACT FORM (EmailJS) =====
// 1. Go to https://www.emailjs.com/
// 2. Create a service + template
// 3. Replace the values below

emailjs.init('YOUR_PUBLIC_KEY');

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
    .then(() => {
      status.textContent = 'Message sent successfully.';
      status.style.color = 'green';
      form.reset();
    })
    .catch(() => {
      status.textContent = 'Failed to send message. Try again.';
      status.style.color = 'red';
    });
});

// ===== Project Rendering =====
const container = document.getElementById('projectsContainer');

function renderProjects(projects) {
  container.innerHTML = '';
  projects.forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-card fade-section visible';
    div.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p><a href="${p.link}" target="_blank">View</a>`;
    container.appendChild(div);
  });
}

// Local Projects
fetch('data/projects.json')
  .then(res => res.json())
  .then(renderProjects);

// GitHub Projects
async function loadGitHub() {
  const res = await fetch('https://api.github.com/users/HernandezCui/repos');
  const data = await res.json();
  renderProjects(data.slice(0, 6).map(repo => ({
    title: repo.name,
    description: repo.description || 'No description',
    link: repo.html_url
  })));
}

const navLinks = document.querySelectorAll('.nav-link');

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`a[href="#${entry.target.id}"]`);
      active?.classList.add('active');
    }
  });
}, { threshold: 0.6 });

['about','skills','projects','contact'].forEach(id => {
  const el = document.getElementById(id);
  if (el) spyObserver.observe(el);
});

function staggerChildren(parentSelector, childSelector) {
  document.querySelectorAll(parentSelector).forEach(parent => {
    const children = parent.querySelectorAll(childSelector);
    children.forEach((el, i) => {
      el.style.transitionDelay = `${i * 120}ms`;
    });
  });
}

staggerChildren('.skills-grid', 'span');
staggerChildren('#projectsContainer', '.project-card');

// Controls
document.getElementById('loadLocal').onclick = () => {
  fetch('data/projects.json').then(r => r.json()).then(renderProjects);
};

document.getElementById('loadGitHub').onclick = loadGitHub;
