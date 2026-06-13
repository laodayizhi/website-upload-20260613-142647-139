(function() {
    var navToggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll(".search-form").forEach(function(form) {
        form.addEventListener("submit", function(event) {
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            if (!query) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            window.location.href = "./search.html?q=" + encodeURIComponent(query);
        });
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupLocalFilters() {
        var list = document.querySelector("[data-card-list]");
        var search = document.querySelector("[data-local-search]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");

        if (!list || (!search && !year)) {
            return;
        }

        var cards = Array.prototype.slice.call(list.children);

        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var visible = 0;

            cards.forEach(function(card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || cardYear === selectedYear;
                var show = matchKeyword && matchYear;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (search) {
            search.addEventListener("input", apply);
        }

        if (year) {
            year.addEventListener("change", apply);
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function renderSearch() {
        var results = document.getElementById("searchResults");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var title = document.querySelector("[data-search-query]");
        var empty = document.getElementById("searchEmpty");
        var pageInput = document.querySelector(".large-search input[name='q']");

        if (pageInput) {
            pageInput.value = query;
        }

        if (title) {
            title.textContent = query ? "搜索：" + query : "搜索内容";
        }

        if (!query) {
            results.innerHTML = "";
            if (empty) {
                empty.classList.add("is-visible");
            }
            return;
        }

        var keyword = query.toLowerCase();
        var matched = window.SEARCH_INDEX.filter(function(item) {
            return item.search.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 180);

        results.innerHTML = matched.map(function(item) {
            return "<article class=\"movie-card\">" +
                "<a class=\"poster\" href=\"./" + escapeHtml(item.file) + "\">" +
                "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
                "<h2><a href=\"./" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h2>" +
                "<p>" + escapeHtml(item.line) + "</p>" +
                "</div>" +
                "</article>";
        }).join("");

        if (empty) {
            empty.textContent = matched.length ? "" : "未找到匹配影片";
            empty.classList.toggle("is-visible", matched.length === 0);
        }
    }

    setupHero();
    setupLocalFilters();
    renderSearch();
})();
