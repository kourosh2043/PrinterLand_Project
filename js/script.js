const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

const topBtn = document.getElementById("topBtn");

if (topBtn) {
  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 500 ? "block" : "none";
  });

  topBtn.onclick = () => {
    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };
}

/* ==========================================================
   PORTFOLIO SECTION — انیمیشن اسکرول + لایتباکس + Fallback عکس
   کارت‌ها این‌بار مستقیم داخل HTML نوشته شده‌ان (نه با JS ساخته می‌شن)،
   پس این فایل فقط رفتارها رو به کارت‌های موجود اضافه می‌کنه.
   این فایل رو قبل از </body> با
   <script src="../js/portfolio-section.js"></script> (داخل pages/)
   اضافه کنید.
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  const cards = grid.querySelectorAll(".portfolio-card");

  /* ---- Fallback عکس: اگه عکس آپلود نشده باشه (404)، آیکون 📷 نشون بده ---- */
  cards.forEach((card) => {
    const imgEl = card.querySelector("img");
    const fallbackEl = card.querySelector(".portfolio-card-fallback");
    if (!imgEl || !fallbackEl) return;

    imgEl.addEventListener("error", () => {
      imgEl.style.display = "none";
      fallbackEl.style.display = "flex";
    });
  });

  /* ---- انیمیشن اسکرول: نمایان‌شدن پشت‌سرهم هر ردیف (Stagger ستونی) ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  cards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(card);
  });

  /* ---- Lightbox ---- */
  const lightbox = document.getElementById("portfolioLightbox");
  const lightboxImg = document.getElementById("portfolioLightboxImg");
  const lightboxTitle = document.getElementById("portfolioLightboxTitle");
  const lightboxCat = document.getElementById("portfolioLightboxCat");
  const closeBtn = document.getElementById("portfolioLightboxClose");

  function openLightbox(card) {
    if (!lightbox) return;
    const imgEl = card.querySelector("img");
    lightboxImg.src = imgEl ? imgEl.src : "";
    lightboxImg.alt = card.dataset.title || "";
    lightboxTitle.textContent = card.dataset.title || "";
    lightboxCat.textContent = card.dataset.cat || "";
    lightbox.classList.add("open");
    requestAnimationFrame(() => lightbox.classList.add("show"));
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(() => lightbox.classList.remove("open"), 300);
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openLightbox(card));
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
});
