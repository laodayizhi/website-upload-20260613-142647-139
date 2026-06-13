import { H as Hls } from "./hls-vendor.js";

function attachPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var button = wrapper.querySelector(".player-overlay");
    var stream = wrapper.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    if (!video || !button || !stream) {
        return;
    }

    function loadStream() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function startPlay() {
        loadStream();
        button.classList.add("is-hidden");
        video.controls = true;
        var playing = video.play();
        if (playing && typeof playing.catch === "function") {
            playing.catch(function() {});
        }
    }

    button.addEventListener("click", startPlay);
    video.addEventListener("click", function() {
        if (video.paused) {
            startPlay();
        }
    });

    window.addEventListener("beforeunload", function() {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll(".movie-player").forEach(attachPlayer);
