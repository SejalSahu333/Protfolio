/* ====================================================
   main.js — Sejal Sahu | Embedded Systems Engineer
   ==================================================== */

// ── Custom Cursor ──
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
})();
document.querySelectorAll('a,button,.skill-card,.project-card,.tag,.edu-card,.tl-card,.cert-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width = '54px'; ring.style.height = '54px'; ring.style.borderColor = 'rgba(0,229,195,0.8)'; });
  el.addEventListener('mouseleave', () => { ring.style.width = '38px'; ring.style.height = '38px'; ring.style.borderColor = 'rgba(0,229,195,0.5)'; });
});

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 130) current = sec.id; });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ── Hamburger ──
document.getElementById('hamburger').addEventListener('click', () => {
  const ul = document.querySelector('.nav-links');
  const isOpen = ul.style.display === 'flex';
  Object.assign(ul.style, {
    display: isOpen ? 'none' : 'flex', flexDirection: 'column',
    position: 'absolute', top: '66px', left: '0', right: '0',
    background: 'rgba(7,9,15,0.97)', padding: '24px 6%',
    backdropFilter: 'blur(20px)', zIndex: '999',
    borderBottom: '1px solid rgba(100,220,200,0.12)'
  });
});

// ── Circuit Canvas ──
const canvas = document.getElementById('circuit-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Node {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r = Math.random() * 2.5 + 1;
    this.pulse = Math.random() * Math.PI * 2;
    this.color = Math.random() > 0.5 ? '#00e5c3' : '#7c83ff';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.pulse += 0.022;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    const g = Math.sin(this.pulse) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r + g, 0, Math.PI * 2);
    ctx.fillStyle = this.color + Math.floor((0.4 + g * 0.5) * 255).toString(16).padStart(2, '0');
    ctx.shadowColor = this.color; ctx.shadowBlur = 8 * g;
    ctx.fill(); ctx.shadowBlur = 0;
  }
}

const nodes = Array.from({ length: 52 }, () => new Node());

class Packet {
  constructor(n1, n2) { this.n1 = n1; this.n2 = n2; this.t = 0; this.speed = 0.011 + Math.random() * 0.009; }
  update() { this.t += this.speed; }
  done() { return this.t >= 1; }
  draw() {
    const x = this.n1.x + (this.n2.x - this.n1.x) * this.t;
    const y = this.n1.y + (this.n2.y - this.n1.y) * this.t;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#f472b6'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 14;
    ctx.fill(); ctx.shadowBlur = 0;
  }
}
const packets = [];
let frame = 0;

(function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frame++;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 155) {
        const a = (1 - d / 155) * 0.32;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[i].x, nodes[j].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(0,229,195,${a})`; ctx.lineWidth = 0.75; ctx.stroke();
        if (frame % 80 === 0 && Math.random() < 0.07) packets.push(new Packet(nodes[i], nodes[j]));
      }
    }
  }
  nodes.forEach(n => { n.update(); n.draw(); });
  for (let i = packets.length - 1; i >= 0; i--) {
    packets[i].update(); packets[i].draw();
    if (packets[i].done()) packets.splice(i, 1);
  }
  requestAnimationFrame(draw);
})();

// ── Scroll Reveal ──
document.querySelectorAll('.skill-card,.project-card,.tl-card,.edu-card,.about-grid,.contact-grid,.section-header,.cert-card,.cert-filters')
  .forEach(el => el.classList.add('reveal'));

new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 75);
      entry.target._obs?.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }).observe = (function (orig) {
  return function (el) { el._obs = this; orig.call(this, el); };
})(IntersectionObserver.prototype.observe);

const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 75); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── Skill Bars ──
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.pct + '%'; barObs.unobserve(e.target); } });
}, { threshold: 0.3 });
document.querySelectorAll('.bar-fill').forEach(b => barObs.observe(b));

// ── Counters ──
const cntObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = +entry.target.dataset.target;
      let curr = 0; const step = target / 55;
      const t = setInterval(() => {
        curr += step;
        if (curr >= target) { entry.target.textContent = target + '+'; clearInterval(t); }
        else entry.target.textContent = Math.floor(curr);
      }, 28);
      cntObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(c => cntObs.observe(c));

// ── Contact Form ──
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('send-btn');
  const fb = document.getElementById('form-feedback');
  btn.textContent = 'Sending…'; btn.disabled = true;
  setTimeout(() => {
    fb.textContent = '✅ Message sent! Sejal will get back to you soon.';
    fb.className = 'form-feedback success';
    e.target.reset();
    btn.textContent = 'Send Message ✉️'; btn.disabled = false;
    setTimeout(() => { fb.textContent = ''; fb.className = 'form-feedback'; }, 5000);
  }, 1500);
});

// ── Certificates Filtering ──
const filterBtns = document.querySelectorAll('.filter-btn');
const certCards = document.querySelectorAll('.cert-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filterValue = btn.dataset.filter;
    const grid = document.querySelector('.certs-grid');
    grid.style.opacity = '0';
    grid.style.transition = 'opacity 0.25s ease';

    setTimeout(() => {
      certCards.forEach(card => {
        if (filterValue === 'all' || card.dataset.category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
      grid.style.opacity = '1';
    }, 250);
  });
});

// ── Certificate Modal Viewer ──
const modal = document.getElementById('cert-modal');
const modalIframe = document.getElementById('cert-modal-iframe');
const modalTitle = document.getElementById('cert-modal-title');
const modalDlLink = document.getElementById('cert-modal-download');
const modalClose = document.querySelector('.cert-modal-close');
const spinner = document.querySelector('.cert-modal-spinner');

function openCertModal(src, title) {
  modalTitle.textContent = title;
  modalDlLink.href = src;

  // Reset iframe
  modalIframe.classList.remove('loaded');
  modalIframe.src = '';
  spinner.style.display = 'block';

  // Show modal first, then load src (prevents FOUC)
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Small delay so animation plays before heavy PDF loads
  setTimeout(() => { modalIframe.src = src; }, 100);
}

function closeCertModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    modalIframe.src = '';
    modalIframe.classList.remove('loaded');
    spinner.style.display = 'block';
  }, 380);
}

// View button click — stop propagation so card click doesn't double-fire
document.querySelectorAll('.btn-view-cert').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const card = btn.closest('.cert-card');
    const src = btn.dataset.src;
    const title = card.querySelector('h3').textContent;
    openCertModal(src, title);
  });
});

// Clicking the card itself also opens modal
certCards.forEach(card => {
  card.addEventListener('click', () => {
    const btn = card.querySelector('.btn-view-cert');
    const src = btn.dataset.src;
    const title = card.querySelector('h3').textContent;
    openCertModal(src, title);
  });
});

// Close triggers
modalClose.addEventListener('click', closeCertModal);
modal.addEventListener('click', e => { if (e.target === modal) closeCertModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeCertModal();
});

// Hide spinner when iframe loads
modalIframe.addEventListener('load', () => {
  spinner.style.display = 'none';
  modalIframe.classList.add('loaded');
});

// ── Typing Effect ──
const tag = document.getElementById('typing-tag');
const phrases = [
  '// Embedded Systems & Software',
  '// Firmware Development',
  '// Hardware Design & PCB Layout',
  '// STM32 · ESP32 · RTOS',
];
let pi = 0, ci = 0, del = false;
function type() {
  const cur = phrases[pi];
  tag.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
  if (!del && ci === cur.length) { del = true; setTimeout(type, 1800); return; }
  if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  setTimeout(type, del ? 42 : 78);
}
type();

console.log('%c⚡ Sejal Sahu | Embedded Systems Engineer', 'color:#00e5c3;font-size:15px;font-weight:bold;');
console.log('%c📧 sejalsahu705@gmail.com | 🐙 github.com/SejalSahu93', 'color:#7c83ff;font-size:11px;');
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}); const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.clientHeight;

    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
}); const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
}); const hiddenElements = document.querySelectorAll(".timeline-item, .edu-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.2
});

hiddenElements.forEach((el) => observer.observe(el));
window.addEventListener("scroll", () => {

  let scrollTop = document.documentElement.scrollTop;

  let scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  let progress = (scrollTop / scrollHeight) * 100;

  document.getElementById("progress-bar").style.width =
    progress + "%";

}); window.addEventListener("load", () => {

  setTimeout(() => {

    document.getElementById("loader").style.opacity = "0";

    setTimeout(() => {
      document.getElementById("loader").style.display = "none";
    }, 1000);

  }, 2000);

}); tsParticles.load("tsparticles", {
  fullScreen: { enable: false },
  particles: {
    number: {
      value: 60
    },
    color: {
      value: ["#00e5c3", "#7c83ff", "#f472b6"]
    },
    links: {
      enable: true,
      color: "#00e5c3",
      opacity: 0.2,
      distance: 150
    },
    move: {
      enable: true,
      speed: 1
    },
    opacity: {
      value: 0.5
    },
    size: {
      value: { min: 2, max: 5 }
    }
  },

  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
      onClick: {
        enable: true,
        mode: "push"
      }
    },
    modes: {
      grab: {
        distance: 180,
        links: {
          opacity: 0.6
        }
      },
      push: {
        quantity: 4
      }
    }
  }
}); 