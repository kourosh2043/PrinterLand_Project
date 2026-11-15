document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("notfound");
  if (!section) return;
  requestAnimationFrame(() => {
    setTimeout(() => section.classList.add("nf-loaded"), 50);
  });

  // Fallback عکس فیگور (تا وقتی عکس واقعی آپلود نشده)
  const figureImg = document.querySelector(".nf-figure-img");
  const figureFallback = document.querySelector(".nf-figure-fallback");
  if (figureImg && figureFallback) {
    figureImg.addEventListener("error", () => {
      figureImg.style.display = "none";
      figureFallback.style.display = "flex";
    });
  }
});
