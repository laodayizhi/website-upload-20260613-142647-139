(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    });

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('.js-search');
        var year = scope.querySelector('.js-year');
        var genre = scope.querySelector('.js-genre');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));

        function apply() {
            var query = normalize(search ? search.value : '');
            var yearValue = year ? year.value : '';
            var genreValue = normalize(genre ? genre.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matchedGenre = !genreValue || normalize(card.getAttribute('data-genre')).indexOf(genreValue) !== -1 || normalize(card.getAttribute('data-tags')).indexOf(genreValue) !== -1;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedYear && matchedGenre));
            });
        }

        [search, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        if (search && params.get('q')) {
            search.value = params.get('q');
            apply();
        }
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        attached = true;
    }

    function start() {
        attach();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
