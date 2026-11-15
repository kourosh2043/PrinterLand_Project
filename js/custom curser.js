(function () {
  // فقط روی دستگاه‌هایی که موس واقعی دارن فعال بشه
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const html = document.documentElement;
  html.classList.add("has-custom-cursor");

  /* ---- ساخت المان‌های کرسر ---- */
  const dot = document.createElement("div");
  dot.className = "cursor-dot";

  const ring = document.createElement("div");
  ring.className = "cursor-ring";

  const ringLabel = document.createElement("span");
  ringLabel.className = "cursor-ring-label";
  ring.appendChild(ringLabel);

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(dot);
    document.body.appendChild(ring);
  });
  // اگه DOM از قبل آماده بود (اسکریپت در انتهای body)
  if (document.readyState !== "loading") {
    document.body.appendChild(dot);
    document.body.appendChild(ring);
  }

  /* ---- موقعیت موس ---- */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // موقعیت فعلی رینگ (برای افکت تأخیر/دنبال‌کردن نرم)
  let ringX = mouseX;
  let ringY = mouseY;
  const RING_EASE = 0.12; // هرچی کمتر، تأخیر بیشتر

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // دایره کوچک: بدون تأخیر، دقیقاً دنبال موس
      dot.style.transform = `translate(-50%, -50%) translate(${mouseX}px, ${mouseY}px)`;

      updateHoverState(e.target);
      updateZoneState(e.target);
    },
    { passive: true },
  );

  /* ---- انیمیشن نرم دایره‌ی بزرگ (Lerp) ---- */
  function animateRing() {
    ringX += (mouseX - ringX) * RING_EASE;
    ringY += (mouseY - ringY) * RING_EASE;
    ring.style.transform = `translate(-50%, -50%) translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  /* ---- تشخیص حالت هاور با اولویت ---- */
  let currentState = "";
  function setState(state, label) {
    if (state === currentState) return;
    currentState = state;
    if (state) {
      html.setAttribute("data-cursor-state", state);
    } else {
      html.removeAttribute("data-cursor-state");
    }
    ringLabel.textContent = label || "";
  }

  function updateHoverState(target) {
    if (!(target instanceof Element)) {
      setState("", "");
      return;
    }

    // ۱. کارت‌های نمونه‌کار (پورتفولیو)
    if (target.closest(".portfolio-card")) {
      setState("portfolio", "مشاهده");
      return;
    }

    // فیگور صفحه‌ی 404
    if (target.closest(".nf-figure-wrap")) {
      setState("figure", "🔍 مشاهده");
      return;
    }

    // ۲. دکمه‌ی تماس (کارت‌های تماس با ما)
    if (target.closest(".contact-card-btn")) {
      setState("contact", "➜");
      return;
    }

    // ۳. دکمه‌ها (button, لینک‌هایی با کلاس btn، تاگل‌ها)
    if (
      target.closest(
        'button, a[class*="btn"], .theme-toggle, .menu-toggle, .contact-copy-btn, .process-order-btn, .order-app-card',
      )
    ) {
      setState("button", "");
      return;
    }

    // ۴. لینک‌های ساده
    if (target.closest("a")) {
      setState("link", "");
      return;
    }

    // ۵. کارت‌های عمومی (سرویس، فرآیند، درباره‌ما، چرا-ما، تماس)
    if (
      target.closest(
        ".service-card, .process-card, .about-card, .wu-card, .contact-card",
      )
    ) {
      setState("card", "");
      return;
    }

    // ۶. متن (پاراگراف‌ها)
    if (target.closest("p")) {
      setState("text", "");
      return;
    }

    // پیش‌فرض
    setState("", "");
  }

  /* ---- تشخیص ناحیه‌های خاص (هیرو / FAQ) ---- */
  function updateZoneState(target) {
    if (!(target instanceof Element)) return;

    const inHero = !!target.closest("#hero, .hero, .hero-sec");
    html.classList.toggle("cursor-in-hero", inHero);

    const inFaq = !!target.closest("#faq, .faq-sec");
    html.classList.toggle("cursor-in-faq", inFaq);
  }

  /* ---- کلیک ---- */
  window.addEventListener("mousedown", () => {
    html.classList.add("cursor-clicking");
  });
  window.addEventListener("mouseup", () => {
    html.classList.remove("cursor-clicking");
  });

  /* ---- اسکرول ---- */
  let scrollTimeout;
  window.addEventListener(
    "scroll",
    () => {
      html.classList.add("cursor-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        html.classList.remove("cursor-scrolling");
      }, 150);
    },
    { passive: true },
  );

  /* ---- خروج موس از صفحه ---- */
  document.addEventListener("mouseleave", () => {
    html.classList.add("cursor-hidden");
  });
  document.addEventListener("mouseenter", () => {
    html.classList.remove("cursor-hidden");
  });
})();
