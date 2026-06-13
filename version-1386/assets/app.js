document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    document.querySelectorAll(".js-search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            var term = input ? input.value.trim() : "";

            if (document.body.classList.contains("catalog-search-page")) {
                event.preventDefault();
                runCatalogFilter();
                return;
            }

            if (!term) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length > 0) {
        var activeIndex = 0;

        var activate = function (index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
                dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
            });
        });

        activate(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5200);
        }
    }

    var searchPageInput = document.querySelector(".catalog-filter-input");
    var urlQuery = new URLSearchParams(window.location.search).get("q");

    if (searchPageInput && urlQuery) {
        searchPageInput.value = urlQuery;
    }

    document.querySelectorAll(".js-filter-control").forEach(function (control) {
        control.addEventListener("input", runCatalogFilter);
        control.addEventListener("change", runCatalogFilter);
    });

    if (document.body.classList.contains("catalog-search-page")) {
        runCatalogFilter();
    }
});

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function runCatalogFilter() {
    var input = document.querySelector(".catalog-filter-input");
    var category = document.querySelector(".catalog-filter-category");
    var year = document.querySelector(".catalog-filter-year");
    var region = document.querySelector(".catalog-filter-region");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.querySelector(".empty-state");

    if (!cards.length) {
        return;
    }

    var term = normalizeText(input ? input.value : "");
    var selectedCategory = category ? category.value : "";
    var selectedYear = year ? year.value : "";
    var selectedRegion = region ? region.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
        var haystack = normalizeText(card.getAttribute("data-search"));
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matched = true;

        if (term && haystack.indexOf(term) === -1) {
            matched = false;
        }

        if (selectedCategory && cardCategory !== selectedCategory) {
            matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
            matched = false;
        }

        if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
        }

        card.classList.toggle("is-hidden", !matched);

        if (matched) {
            visibleCount += 1;
        }
    });

    if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
    }
}
