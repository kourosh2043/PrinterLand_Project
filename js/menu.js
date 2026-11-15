// ===== HEADER MENU LOGIC =====
(function () {
  const toggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (!toggle || !mobileNav) return;

  // Hamburger open/close
  toggle.addEventListener("click", function () {
    const open = mobileNav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Active link sync between desktop and mobile nav
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      const idx = [...this.closest("nav").querySelectorAll("a")].indexOf(this);

      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
      document.querySelectorAll(".mobile-nav-link").forEach((l) => l.classList.remove("active"));

      document.querySelectorAll(".nav-link")[idx]?.classList.add("active");
      document.querySelectorAll(".mobile-nav-link")[idx]?.classList.add("active");

      // Close mobile nav on link click
      if (mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Close mobile nav on outside click
  document.addEventListener("click", function (e) {
    if (
      mobileNav.classList.contains("open") &&
      !mobileNav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      mobileNav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById("themeToggle");
const themeIconSvg = document.getElementById("themeIconSvg");
const themeMobileIcon = themeBtn ? themeBtn.querySelector(".theme-icon-mobile") : null;

const moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
const sunPath = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';

function applyTheme(isLight) {
  document.body.classList.toggle("light-mode", isLight);
  if (themeIconSvg) themeIconSvg.innerHTML = isLight ? sunPath : moonPath;
  if (themeMobileIcon) themeMobileIcon.textContent = isLight ? "☀️" : "🌙";
}

// بارگذاری تم ذخیره‌شده
applyTheme(localStorage.getItem("theme") === "light");

if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    const isLight = !document.body.classList.contains("light-mode");
    applyTheme(isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// Order button -> open contact modal
document.addEventListener("DOMContentLoaded", () => {
  const orderBtn = document.getElementById("orderBtn");
  const overlay = document.getElementById("orderModalOverlay");
  const closeBtn = document.getElementById("orderModalClose");

  if (!orderBtn || !overlay || !closeBtn) return;

  function openModal() {
    overlay.classList.add("open");
    requestAnimationFrame(() => overlay.classList.add("show"));
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(() => overlay.classList.remove("open"), 300);
  }

  orderBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });
});