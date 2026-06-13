import { H as Hls } from "./hls.js";

export function setupPlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var note = document.querySelector(options.noteSelector);
    var source = options.source;
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function showNote(message) {
        if (note) {
            note.textContent = message;
            note.classList.add("is-visible");
        }
    }

    function hideNote() {
        if (note) {
            note.textContent = "";
            note.classList.remove("is-visible");
        }
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;
        hideNote();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showNote("视频暂时无法播放，请稍后重试。");
                }
            });

            return;
        }

        showNote("当前浏览器暂不支持播放。");
    }

    function startPlayback() {
        loadVideo();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }

                showNote("点击播放按钮即可开始观看。");
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        hideNote();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("error", function () {
        showNote("视频暂时无法播放，请稍后重试。");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
