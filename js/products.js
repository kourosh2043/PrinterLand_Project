/**
 * PrinterLand — Products Listing Logic (Phase 3)
 *
 * Vanilla JS, no dependencies. Responsible ONLY for:
 * - Fetching assets/data/products.json
 * - Rendering product cards into #productsGrid
 * - Search / Category filter / Sort, combined
 * - Loading / Empty / Error states
 *
 * `products.json` remains the single Source of Truth: nothing product-related
 * is hard-coded here. Reading `?slug=` and rendering a single product's
 * detail page is out of scope for this file (Phase 4 / product-detail.html).
 */
(function () {
  "use strict";

  var DATA_URL = "assets/data/products.json";
  var FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  var PAGE_SIZE = 12;

  /** @type {Array<Object>} Raw product list from products.json. Treated as read-only. */
  var allProducts = [];
  var dataLoaded = false;
  var currentPage = 1;

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els = {
      grid: document.getElementById("productsGrid"),
      search: document.getElementById("productSearch"),
      category: document.getElementById("productCategory"),
      sort: document.getElementById("productSort"),
      resultsCount: document.getElementById("productResultsCount"),
      loading: document.getElementById("productsLoading"),
      emptyState: document.getElementById("productsEmptyState"),
      clearBtn: document.getElementById("clearProductFilters"),
      pagination: document.getElementById("productsPagination"),
      prevPageBtn: document.getElementById("productsPrevPage"),
      nextPageBtn: document.getElementById("productsNextPage"),
      pageNumbers: document.getElementById("productsPageNumbers"),
    };

    // If this page doesn't have the products UI, do nothing.
    if (!els.grid) {
      return;
    }

    bindEvents();
    setLoading(true);
    fetchProducts();
  }

  /* ---------------------------------------------------------------------
   * Data loading
   * ------------------------------------------------------------------- */

  function fetchProducts() {
    fetch(DATA_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status + " while fetching " + DATA_URL);
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.products)) {
          throw new Error("Invalid products.json structure: expected { products: [...] }");
        }

        allProducts = data.products.filter(function (p) {
          return p && typeof p === "object" && typeof p.slug === "string" && p.slug !== "";
        });

        buildCategoryOptions(allProducts);
        dataLoaded = true;

        setLoading(false);
        runPipeline();
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error("PrinterLand products: failed to load products.json", err);
        setLoading(false);
        showFetchError();
      });
  }

  /* ---------------------------------------------------------------------
   * Category options (dynamic, derived from data — never hard-coded)
   * ------------------------------------------------------------------- */

  function buildCategoryOptions(products) {
    if (!els.category) {
      return;
    }

    // Keep only the first existing option ("همه دسته‌بندی‌ها" / value="all"),
    // remove anything else that might already be there, then append the
    // categories discovered in the data.
    while (els.category.options.length > 1) {
      els.category.remove(1);
    }

    var seen = {};
    var orderedSlugs = [];

    products.forEach(function (p) {
      var cat = p && p.category;
      if (cat && typeof cat.slug === "string" && cat.slug !== "" && !seen[cat.slug]) {
        seen[cat.slug] = cat.name || cat.slug;
        orderedSlugs.push(cat.slug);
      }
    });

    orderedSlugs.forEach(function (slug) {
      var option = document.createElement("option");
      option.value = slug;
      option.textContent = seen[slug];
      els.category.appendChild(option);
    });
  }

  /* ---------------------------------------------------------------------
   * Search + Filter + Sort pipeline
   * ------------------------------------------------------------------- */

  function runPipeline() {
    // Guard: never compute/render results before the JSON has actually loaded,
    // so we never show a misleading "0 products" before data is ready.
    if (!dataLoaded) {
      return;
    }

    var results = getFilteredSortedProducts();
    var totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

    // Clamp in case a previous page no longer exists after filtering
    // (e.g. narrowing the search/category shrinks the result set).
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }

    var startIndex = (currentPage - 1) * PAGE_SIZE;
    var pageItems = results.slice(startIndex, startIndex + PAGE_SIZE);

    renderGrid(pageItems);
    renderResultsCount(results.length);
    toggleEmptyState(results.length === 0);
    renderPagination(totalPages, results.length);
  }

  function getFilteredSortedProducts() {
    var query = els.search ? els.search.value.trim().toLowerCase() : "";
    var categorySlug = els.category ? els.category.value : "all";
    var sortValue = els.sort ? els.sort.value : "default";

    // Always work on a fresh copy — allProducts is never mutated.
    var result = allProducts.slice();

    if (query !== "") {
      result = result.filter(function (p) {
        return productMatchesQuery(p, query);
      });
    }

    if (categorySlug && categorySlug !== "all") {
      result = result.filter(function (p) {
        return p.category && p.category.slug === categorySlug;
      });
    }

    result = sortProducts(result, sortValue);

    return result;
  }

  function productMatchesQuery(product, query) {
    var haystacks = [
      product.name,
      product.code,
      product.short_description,
      product.description,
      product.category && product.category.name,
      product.type,
    ];

    return haystacks.some(function (value) {
      return typeof value === "string" && value.toLowerCase().indexOf(query) !== -1;
    });
  }

  function sortProducts(list, sortValue) {
    var copy = list.slice();

    switch (sortValue) {
      case "name-asc":
        copy.sort(function (a, b) {
          return compareStrings(a.name, b.name);
        });
        break;

      case "name-desc":
        copy.sort(function (a, b) {
          return compareStrings(b.name, a.name);
        });
        break;

      case "code-asc":
        copy.sort(function (a, b) {
          return compareStrings(a.code, b.code);
        });
        break;

      case "code-desc":
        copy.sort(function (a, b) {
          return compareStrings(b.code, a.code);
        });
        break;

      default:
        // "default" keeps the original products.json order as-is.
        break;
    }

    return copy;
  }

  function compareStrings(a, b) {
    return String(a || "").localeCompare(String(b || ""), "fa");
  }

  /* ---------------------------------------------------------------------
   * Rendering: Grid + Cards
   * ------------------------------------------------------------------- */

  function renderGrid(products) {
    if (!els.grid) {
      return;
    }

    clearElement(els.grid);

    var fragment = document.createDocumentFragment();
    products.forEach(function (product) {
      fragment.appendChild(buildProductCard(product));
    });
    els.grid.appendChild(fragment);
  }

  function buildProductCard(product) {
    var card = document.createElement("article");
    card.className = "product-card";
    if (product.slug) {
      card.dataset.slug = product.slug;
    }

    card.appendChild(buildProductMedia(product));
    card.appendChild(buildProductInfo(product));

    return card;
  }

  function buildProductMedia(product) {
    var media = document.createElement("div");
    media.className = "product-card-media";

    var hasImage = typeof product.image === "string" && product.image.trim() !== "";

    if (hasImage) {
      var img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name ? "تصویر محصول " + product.name : "تصویر محصول";
      img.loading = "lazy";

      img.addEventListener("error", function onImageError() {
        img.removeEventListener("error", onImageError);
        if (img.parentNode) {
          img.parentNode.replaceChild(buildProductImageFallback(product), img);
        }
      });

      media.appendChild(img);
    } else {
      media.appendChild(buildProductImageFallback(product));
    }

    return media;
  }

  function buildProductImageFallback(product) {
    var fallback = document.createElement("div");
    fallback.className = "product-card-fallback";

    var icon = document.createElement("span");
    icon.className = "product-card-fallback-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "📦";
    fallback.appendChild(icon);

    var label = document.createElement("span");
    label.className = "product-card-fallback-label";
    label.textContent = product.name ? "بدون تصویر: " + product.name : "بدون تصویر";
    fallback.appendChild(label);

    return fallback;
  }

  function buildProductInfo(product) {
    var info = document.createElement("div");
    info.className = "product-card-info";

    var title = document.createElement("h3");
    title.className = "product-card-title";
    title.textContent = product.name || "";
    info.appendChild(title);

    var meta = document.createElement("div");
    meta.className = "product-card-meta";

    if (product.code) {
      var codeEl = document.createElement("span");
      codeEl.className = "product-card-code";
      codeEl.textContent = product.code;
      meta.appendChild(codeEl);
    }

    if (product.category && product.category.name) {
      var categoryEl = document.createElement("span");
      categoryEl.className = "product-card-category";
      categoryEl.textContent = product.category.name;
      meta.appendChild(categoryEl);
    }

    if (product.type) {
      var typeEl = document.createElement("span");
      typeEl.className = "product-card-type";
      typeEl.textContent = translateType(product.type);
      meta.appendChild(typeEl);
    }

    info.appendChild(meta);

    if (product.short_description) {
      var desc = document.createElement("p");
      desc.className = "product-card-desc";
      desc.textContent = product.short_description;
      info.appendChild(desc);
    }

    var status = document.createElement("span");
    status.className = "product-card-status" + (product.is_active ? " is-active" : " is-inactive");
    status.textContent = product.is_active ? "موجود" : "غیرفعال";
    info.appendChild(status);

    info.appendChild(buildProductLink(product));

    return info;
  }

  function buildProductLink(product) {
    var link = document.createElement("a");
    link.className = "product-card-cta";
    link.href = "pages/product-detail.html?slug=" + encodeURIComponent(product.slug || "");
    link.textContent = "مشاهده جزئیات";
    return link;
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

  /* ---------------------------------------------------------------------
   * Results count
   * ------------------------------------------------------------------- */

  function renderResultsCount(count) {
    if (!els.resultsCount) {
      return;
    }
    els.resultsCount.textContent = toPersianDigits(count) + " محصول پیدا شد";
  }

  function toPersianDigits(value) {
    return String(value).replace(/[0-9]/g, function (digit) {
      return FA_DIGITS[Number(digit)];
    });
  }

  /* ---------------------------------------------------------------------
   * Pagination
   * ------------------------------------------------------------------- */

  function renderPagination(totalPages, totalResults) {
    if (!els.pagination) {
      return;
    }

    if (totalResults === 0 || totalPages <= 1) {
      els.pagination.hidden = true;
      if (els.pageNumbers) {
        clearElement(els.pageNumbers);
      }
      return;
    }

    els.pagination.hidden = false;

    if (els.prevPageBtn) {
      els.prevPageBtn.disabled = currentPage <= 1;
    }
    if (els.nextPageBtn) {
      els.nextPageBtn.disabled = currentPage >= totalPages;
    }

    if (els.pageNumbers) {
      clearElement(els.pageNumbers);

      var pageList = buildPageList(currentPage, totalPages);

      pageList.forEach(function (entry) {
        if (entry === "...") {
          var ellipsis = document.createElement("span");
          ellipsis.className = "products-pagination-ellipsis";
          ellipsis.textContent = "…";
          ellipsis.setAttribute("aria-hidden", "true");
          els.pageNumbers.appendChild(ellipsis);
          return;
        }

        var pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.className =
          "products-pagination-page" + (entry === currentPage ? " is-active" : "");
        pageBtn.textContent = toPersianDigits(entry);
        pageBtn.setAttribute("aria-label", "صفحه " + toPersianDigits(entry));
        if (entry === currentPage) {
          pageBtn.setAttribute("aria-current", "page");
        }

        pageBtn.addEventListener("click", function () {
          if (entry === currentPage) {
            return;
          }
          currentPage = entry;
          runPipeline();
        });

        els.pageNumbers.appendChild(pageBtn);
      });
    }
  }

  /**
   * Builds a compact page-number list with ellipses for large page counts,
   * e.g. [1, "...", 4, 5, 6, "...", 12]. Always keeps the first page, the
   * last page, and a small window around the current page.
   */
  function buildPageList(current, total) {
    var delta = 1;
    var range = [];
    var withDots = [];
    var last = null;

    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    range.forEach(function (i) {
      if (last !== null) {
        if (i - last === 2) {
          withDots.push(last + 1);
        } else if (i - last > 2) {
          withDots.push("...");
        }
      }
      withDots.push(i);
      last = i;
    });

    return withDots;
  }

  /* ---------------------------------------------------------------------
   * Loading / Empty / Error states
   * ------------------------------------------------------------------- */

  function setLoading(isLoading) {
    if (!els.loading) {
      return;
    }
    els.loading.hidden = !isLoading;
  }

  function toggleEmptyState(isEmpty, options) {
    if (!els.emptyState) {
      return;
    }

    options = options || {};

    if (!isEmpty) {
      els.emptyState.hidden = true;
      if (els.clearBtn) {
        els.clearBtn.hidden = false;
      }
      return;
    }

    var heading = els.emptyState.querySelector("h2");
    var description = els.emptyState.querySelector("p");

    if (heading) {
      heading.textContent = options.heading || "محصولی پیدا نشد";
    }
    if (description) {
      description.textContent =
        options.description || "محصولی مطابق جستجو یا فیلتر انتخاب‌شده پیدا نکردیم.";
    }
    if (els.clearBtn) {
      els.clearBtn.hidden = !!options.hideClear;
    }

    els.emptyState.hidden = false;
  }

  function showFetchError() {
    if (els.grid) {
      clearElement(els.grid);
    }
    renderResultsCount(0);
    toggleEmptyState(true, {
      heading: "مشکلی در بارگذاری محصولات پیش آمد",
      description:
        "در حال حاضر امکان دریافت اطلاعات محصولات وجود ندارد. لطفاً بعداً دوباره تلاش کنید.",
      hideClear: true,
    });
    if (els.pagination) {
      els.pagination.hidden = true;
    }
  }

  /* ---------------------------------------------------------------------
   * Events
   * ------------------------------------------------------------------- */

  function bindEvents() {
    if (els.search) {
      els.search.addEventListener("input", function () {
        currentPage = 1;
        runPipeline();
      });
    }
    if (els.category) {
      els.category.addEventListener("change", function () {
        currentPage = 1;
        runPipeline();
      });
    }
    if (els.sort) {
      els.sort.addEventListener("change", function () {
        currentPage = 1;
        runPipeline();
      });
    }
    if (els.clearBtn) {
      els.clearBtn.addEventListener("click", function () {
        if (els.search) {
          els.search.value = "";
        }
        if (els.category) {
          els.category.value = "all";
        }
        if (els.sort) {
          els.sort.value = "default";
        }
        currentPage = 1;
        runPipeline();
        if (els.search) {
          els.search.focus();
        }
      });
    }
    if (els.prevPageBtn) {
      els.prevPageBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage -= 1;
          runPipeline();
        }
      });
    }
    if (els.nextPageBtn) {
      els.nextPageBtn.addEventListener("click", function () {
        currentPage += 1;
        runPipeline();
      });
    }
  }

  /* ---------------------------------------------------------------------
   * Small DOM utility
   * ------------------------------------------------------------------- */

  function clearElement(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
})();
