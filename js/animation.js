(function () {
  /* ===== HERO PARTICLES (canvas) ===== */
  const canvas = document.getElementById("heroParticles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const hero = document.getElementById("hero");
    let particles = [];
    let width, height;
    let animationId;

    function resize() {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(96, 165, 250, 1)";

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      createParticles();
      cancelAnimationFrame(animationId);
      draw();
    }

    window.addEventListener("resize", init);
    init();
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".service-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => observer.observe(card));
});

// Scroll-triggered entrance animation for the order process cards
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".process-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
    observer.observe(card);
  });
});

document.querySelectorAll("button").forEach(button=>{

  button.addEventListener("click",function(e){
  
  const circle=document.createElement("span");
  
  const size=Math.max(this.clientWidth,this.clientHeight);
  
  circle.style.width=size+"px";
  
  circle.style.height=size+"px";
  
  circle.style.left=e.offsetX-size/2+"px";
  
  circle.style.top=e.offsetY-size/2+"px";
  
  circle.classList.add("ripple");
  
  this.appendChild(circle);
  
  setTimeout(()=>{
  
  circle.remove();
  
  },600);
  
  });
  
  });

/* ===== CONTACT SECTION reveal (badge/title/desc + cards) ===== */
document.addEventListener("DOMContentLoaded", () => {
  const contactSection = document.querySelector(".contact-sec");
  if (!contactSection) return;

  /* Header: fade/slide-up (badge, title, desc) */
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          headerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  headerObserver.observe(contactSection);

  /* Cards: stagger reveal */
  const cards = contactSection.querySelectorAll(".contact-card");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
    cardObserver.observe(card);
  });
});

document.addEventListener("DOMContentLoaded", () => {
const aboutSection = document.querySelector(".about-sec");
if (!aboutSection) return;

/* Header fade/slide-up (badge, title, desc) */
const headerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        headerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);
headerObserver.observe(aboutSection);

/* Cards: stagger reveal */
const cards = aboutSection.querySelectorAll(".about-card");
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
cards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.12}s`;
  cardObserver.observe(card);
});

/* Stats: count-up (0 -> target) */
const counters = aboutSection.querySelectorAll(".stat-count");
const duration = 1400;

function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const start = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counters.forEach(animateCount);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

const statsBlock = aboutSection.querySelector(".about-stats");
if (statsBlock) statsObserver.observe(statsBlock);
});
   document.addEventListener("DOMContentLoaded", () => {
    const wuSection = document.querySelector(".wu-sec");
    if (!wuSection) return;
  
    /* Header: fade + slide-up */
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            headerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    headerObserver.observe(wuSection);
  
    /* Cards: stagger reveal — 0ms, 120ms, 240ms, 360ms */
    const cards = wuSection.querySelectorAll(".wu-card");
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.12}s`;
      cardObserver.observe(card);
    });
  });

  // Scroll reveal
const revealTargets = document.querySelectorAll('.faq-badge, .faq-title, .faq-item');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      if(el.classList.contains('faq-item')){
        const idx = +el.dataset.index;
        setTimeout(()=> el.classList.add('reveal'), idx*120);
      } else {
        el.classList.add('reveal');
      }
      io.unobserve(el);
    }
  });
}, {threshold:.2});
revealTargets.forEach(el=>io.observe(el));

// Accordion + ripple
document.querySelectorAll('.faq-item').forEach(item=>{
  item.addEventListener('click', (e)=>{
    // button press feedback
    const btn = item.querySelector('.faq-plus');
    btn.classList.add('pressed');
    setTimeout(()=> btn.classList.remove('pressed'), 150);

    // ripple
    const ripple = document.createElement('span');
    ripple.className='faq-ripple';
    const rect = item.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height)*1.5;
    ripple.style.width = ripple.style.height = size+'px';
    ripple.style.left = (e.clientX - rect.left - size/2)+'px';
    ripple.style.top = (e.clientY - rect.top - size/2)+'px';
    item.appendChild(ripple);
    requestAnimationFrame(()=> ripple.classList.add('active'));
    setTimeout(()=> ripple.remove(), 400);

    // toggle accordion (accordion style: close others)
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el=> el.classList.remove('open'));
    if(!isOpen) item.classList.add('open');
  });
});