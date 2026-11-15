/**
 * PrinterLand — Product Detail Logic (Phase 6A)
 *
 * Vanilla JS, no dependencies. Responsible ONLY for:
 * - Reading `?slug=` from the URL
 * - Fetching ../assets/data/products.json
 * - Finding the matching product by slug
 * - Rendering it into pages/product-detail.html via DOM API + textContent
 *   (never innerHTML with data coming from the JSON file)
 * - Loading / Not Found / Error states
 *
 * `products.json` remains the single Source of Truth and is never modified
 * or assumed to have fields beyond what Phase 1 defined. Every field is
 * read defensively since real-world data may be incomplete.
 */
(function () {
  "use strict";

  var DATA_URL = "../assets/data/products.json";

  var els = {};
  var allProducts = [];

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els = {
      loading: document.getElementById("productDetailLoading"),
      notFound: document.getElementById("productDetailNotFound"),
      notFoundTitle: document.getElementById("productDetailNotFoundTitle"),
      notFoundText: document.getElementById("productDetailNotFoundText"),
      error: document.getElementById("productDetailError"),
      retryBtn: document.getElementById("productDetailRetry"),
      content: document.getElementById("productDetailContent"),

      mainMedia: document.getElementById("productDetailMainMedia"),
      thumbs: document.getElementById("productDetailThumbs"),

      category: document.getElementById("productDetailCategory"),
      status: document.getElementById("productDetailStatus"),
      name: document.getElementById("productDetailName"),
      code: document.getElementById("productDetailCode"),
      type: document.getElementById("productDetailType"),
      shortDesc: document.getElementById("productDetailShortDesc"),
      descWrap: document.getElementById("productDetailDescWrap"),
      desc: document.getElementById("productDetailDesc"),
      specsWrap: document.getElementById("productDetailSpecsWrap"),
      specs: document.getElementById("productDetailSpecs"),
      datasheet: document.getElementById("productDetailDatasheet"),
      contactCta: document.getElementById("productDetailContactCta"),
    };

    // If this page doesn't have the product-detail UI, do nothing.
    if (!els.content) {
      return;
    }

    if (els.retryBtn) {
      els.retryBtn.addEventListener("click", function () {
        loadAndRender();
      });
    }

    loadAndRender();
  }

  /* ---------------------------------------------------------------------
   * Orchestration
   * ------------------------------------------------------------------- */

  function loadAndRender() {
    var slug = getSlugFromUrl();

    setState("loading");

    // Empty / missing slug: no need to fetch anything, it can never match.
    if (!slug) {
      setState("not-found", {
        heading: "هیچ محصولی انتخاب نشده",
        text: "برای مشاهده جزئیات، لطفاً یک محصول را از صفحه محصولات انتخاب کنید.",
      });
      return;
    }

    fetchProducts()
      .then(function (products) {
        allProducts = products;

        var product = findProductBySlug(products, slug);

        if (!product) {
          setState("not-found", {
            heading: "محصولی پیدا نشد",
            text: "محصولی با این مشخصات پیدا نکردیم. ممکن است حذف شده یا آدرس اشتباه باشد.",
          });
          return;
        }

        renderProduct(product);
        setState("content");
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error("PrinterLand product-detail: failed to load product data", err);
        setState("error");
      });
  }

  /* ---------------------------------------------------------------------
   * URL / data helpers
   * ------------------------------------------------------------------- */

  function getSlugFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    return typeof slug === "string" ? slug.trim() : "";
  }

  function fetchProducts() {
    return fetch(DATA_URL).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status + " while fetching " + DATA_URL);
      }
      return response.json();
    }).then(function (data) {
      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid products.json structure: expected { products: [...] }");
      }
      return data.products.filter(function (p) {
        return p && typeof p === "object" && typeof p.slug === "string" && p.slug !== "";
      });
    });
  }

  function findProductBySlug(products, slug) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].slug === slug) {
        return products[i];
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------------
   * State switching
   * ------------------------------------------------------------------- */

  function setState(state, options) {
    options = options || {};

    var isLoading = state === "loading";
    var isNotFound = state === "not-found";
    var isError = state === "error";
    var isContent = state === "content";

    if (els.loading) {
      els.loading.hidden = !isLoading;
    }
    if (els.notFound) {
      els.notFound.hidden = !isNotFound;
      if (isNotFound) {
        if (els.notFoundTitle) {
          els.notFoundTitle.textContent = options.heading || "محصولی پیدا نشد";
        }
        if (els.notFoundText) {
          els.notFoundText.textContent =
            options.text || "محصول مورد نظر یافت نشد.";
        }
      }
    }
    if (els.error) {
      els.error.hidden = !isError;
    }
    if (els.content) {
      els.content.hidden = !isContent;
    }
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */

  function renderProduct(product) {
    var name = typeof product.name === "string" && product.name !== "" ? product.name : "محصول";

    document.title = name + " | PrinterLand";

    renderMedia(product);
    renderMeta(product);
    renderName(name);
    renderSubMeta(product);
    renderDescriptions(product);
    renderSpecs(product);
    renderDatasheet(product);
    renderContactCta(product);
  }

  /* ---- Media: main image + gallery ---- */

  function renderMedia(product) {
    if (!els.mainMedia) {
      return;
    }

    var images = collectImages(product);

    clearElement(els.mainMedia);
    if (els.thumbs) {
      clearElement(els.thumbs);
    }

    if (images.length === 0) {
      els.mainMedia.appendChild(buildImageFallback(product));
      if (els.thumbs) {
        els.thumbs.hidden = true;
      }
      return;
    }

    showMainImage(images[0], product);

    if (images.length > 1 && els.thumbs) {
      els.thumbs.hidden = false;
      images.forEach(function (src, index) {
        var thumbBtn = document.createElement("button");
        thumbBtn.type = "button";
        thumbBtn.className = "product-detail-thumb" + (index === 0 ? " is-active" : "");
        thumbBtn.setAttribute(
          "aria-label",
          "نمایش تصویر " + toPersianDigits(index + 1) + " از " + toPersianDigits(images.length)
        );

        var thumbImg = document.createElement("img");
        thumbImg.src = src;
        thumbImg.alt = "";
        thumbImg.loading = "lazy";
        thumbBtn.appendChild(thumbImg);

        thumbBtn.addEventListener("click", function () {
          showMainImage(src, product);
          setActiveThumb(thumbBtn);
        });

        els.thumbs.appendChild(thumbBtn);
      });
    } else if (els.thumbs) {
      els.thumbs.hidden = true;
    }
  }

  function collectImages(product) {
    var list = [];

    if (isSafeImageSrc(product.image)) {
      list.push(product.image);
    }

    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(function (src) {
        if (isSafeImageSrc(src) && list.indexOf(src) === -1) {
          list.push(src);
        }
      });
    }

    return list;
  }

  function isSafeImageSrc(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return false;
    }
    // Guard against script-executing URI schemes; images should only ever
    // be relative paths or http(s) URLs coming from products.json.
    var lower = value.trim().toLowerCase();
    return lower.indexOf("javascript:") !== 0 && lower.indexOf("data:text/html") !== 0;
  }

  function showMainImage(src, product) {
    clearElement(els.mainMedia);

    var img = document.createElement("img");
    img.src = src;
    img.alt = product.name ? "تصویر محصول " + product.name : "تصویر محصول";
    img.className = "product-detail-image";

    img.addEventListener("error", function onError() {
      img.removeEventListener("error", onError);
      clearElement(els.mainMedia);
      els.mainMedia.appendChild(buildImageFallback(product));
    });

    els.mainMedia.appendChild(img);
  }

  function setActiveThumb(activeBtn) {
    if (!els.thumbs) {
      return;
    }
    var buttons = els.thumbs.querySelectorAll(".product-detail-thumb");
    buttons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn === activeBtn);
    });
  }

  function buildImageFallback(product) {
    var fallback = document.createElement("div");
    fallback.className = "product-detail-fallback";

    var icon = document.createElement("span");
    icon.className = "product-detail-fallback-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "📦";
    fallback.appendChild(icon);

    var label = document.createElement("span");
    label.className = "product-detail-fallback-label";
    label.textContent = product.name ? "بدون تصویر: " + product.name : "بدون تصویر";
    fallback.appendChild(label);

    return fallback;
  }

  /* ---- Category + status ---- */

  function renderMeta(product) {
    if (els.category) {
      var categoryName = product.category && typeof product.category.name === "string"
        ? product.category.name
        : "";
      if (categoryName) {
        els.category.textContent = categoryName;
        els.category.hidden = false;
      } else {
        els.category.hidden = true;
      }
    }

    if (els.status) {
      var isActive = product.is_active !== false; // treat missing as active by default
      els.status.textContent = isActive ? "موجود" : "غیرفعال";
      els.status.className =
        "product-detail-status " + (isActive ? "is-active" : "is-inactive");
      els.status.hidden = false;
    }
  }

  /* ---- Name ---- */

  function renderName(name) {
    if (els.name) {
      els.name.textContent = name;
    }
  }

  /* ---- Code + type ---- */

  function renderSubMeta(product) {
    if (els.code) {
      if (typeof product.code === "string" && product.code !== "") {
        els.code.textContent = product.code;
        els.code.hidden = false;
      } else {
        els.code.hidden = true;
      }
    }

    if (els.type) {
      if (typeof product.type === "string" && product.type !== "") {
        els.type.textContent = translateType(product.type);
        els.type.hidden = false;
      } else {
        els.type.hidden = true;
      }
    }
  }

  function translateType(type) {
    if (type === "custom") {
      return "سفارشی";
    }
    if (type === "standard") {
      return "استاندارد";
    }
    return type;
  }

  /* ---- Descriptions ---- */

  function renderDescriptions(product) {
    if (els.shortDesc) {
      if (typeof product.short_description === "string" && product.short_description !== "") {
        els.shortDesc.textContent = product.short_description;
        els.shortDesc.hidden = false;
      } else {
        els.shortDesc.hidden = true;
      }
    }

    if (els.descWrap && els.desc) {
      if (typeof product.description === "string" && product.description !== "") {
        els.desc.textContent = product.description;
        els.descWrap.hidden = false;
      } else {
        els.descWrap.hidden = true;
      }
    }
  }

  /* ---- Specs ---- */

  function renderSpecs(product) {
    if (!els.specsWrap || !els.specs) {
      return;
    }

    clearElement(els.specs);

    var specs = Array.isArray(product.specs) ? product.specs : [];
    var validSpecs = specs.filter(function (spec) {
      return (
        spec &&
        typeof spec === "object" &&
        typeof spec.label === "string" &&
        spec.label !== "" &&
        typeof spec.value === "string" &&
        spec.value !== ""
      );
    });

    if (validSpecs.length === 0) {
      els.specsWrap.hidden = true;
      return;
    }

    validSpecs.forEach(function (spec) {
      var dt = document.createElement("dt");
      dt.textContent = spec.label;

      var dd = document.createElement("dd");
      dd.textContent = spec.value;

      els.specs.appendChild(dt);
      els.specs.appendChild(dd);
    });

    els.specsWrap.hidden = false;
  }

  /* ---- Datasheet (only if present) ---- */

  function renderDatasheet(product) {
    if (!els.datasheet) {
      return;
    }

    if (isSafeImageSrc(product.datasheet_url)) {
      els.datasheet.href = product.datasheet_url;
      els.datasheet.hidden = false;
    } else {
      els.datasheet.hidden = true;
      els.datasheet.removeAttribute("href");
    }
  }

  /* ---- Contact CTA (real, functioning link) ---- */

  function renderContactCta(product) {
    if (!els.contactCta) {
      return;
    }

    var params = new URLSearchParams();
    if (typeof product.slug === "string" && product.slug !== "") {
      params.set("product", product.slug);
    }
    if (typeof product.code === "string" && product.code !== "") {
      params.set("code", product.code);
    }

    var query = params.toString();
    els.contactCta.href = query ? "contact.html?" + query : "contact.html";

    var isActive = product.is_active !== false;
    els.contactCta.textContent = isActive
      ? "ثبت سفارش / تماس با ما"
      : "استعلام درباره این محصول";
  }

  /* ---------------------------------------------------------------------
   * Small helpers
   * ------------------------------------------------------------------- */

  var FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  function toPersianDigits(value) {
    return String(value).replace(/[0-9]/g, function (digit) {
      return FA_DIGITS[Number(digit)];
    });
  }

  function clearElement(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
})();
