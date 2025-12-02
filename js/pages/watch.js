import { getMovieBySlug } from '../modules/utils.js';
import { fetchNewMovies } from '../modules/api.js';
import { initCommentManager } from '../../auth/scripts/comment.js';

async function initWatchPage() {
    const video = document.getElementById('video');
    const player = new Plyr(video, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
        settings: ['quality', 'speed']
    });
    let hls = null;

    const urlParams = new URLSearchParams(window.location.search);
    let movieSlug = urlParams.get('slug');

    if (!movieSlug) {
        movieSlug = 'nguu-lang-chuc-nu'; 
    }

    const movie = await getMovieBySlug(movieSlug);

    if (!movie) {
        alert("Không tải được dữ liệu phim.");
        return;
    }

    document.title = `${movie.name} - VitaFlix`;

    const setContent = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    };

    setContent('.name-film-play p', movie.name);
    setContent('.name-film', movie.name);
    setContent('.origin_name', movie.origin_name);
    setContent('.content-film p', movie.content);
    
    setContent('.total-info .quality', movie.quality);
    setContent('.total-info .year', movie.year);
    setContent('.total-info .episode', movie.episode_current);

    const posterImg = document.querySelector('.poster img');
    if (posterImg) {
        let imgUrl = movie.poster_url;
        if (!imgUrl.startsWith('http')) {
            imgUrl = `https://phimimg.com/${imgUrl}`;
        }
        posterImg.src = imgUrl;
        if(video) video.poster = imgUrl;
    }

    const genreBox = document.querySelector('.genre-list');
    if (genreBox && movie.category) {
        genreBox.innerHTML = movie.category.map(cat => `
            <div class="badge bg-dark border border-secondary fw-normal me-2">${cat.name}</div>
        `).join('');
    }

    const serverData = (movie.episodes && movie.episodes[0]) ? movie.episodes[0].server_data : [];
    const episodeContainer = document.querySelector('.episode-list');

    if (episodeContainer) {
        episodeContainer.innerHTML = '';

        if (serverData.length > 0) {
            serverData.forEach((ep, index) => {
                const col = document.createElement('div');
                col.className = 'col-3 col-md-2 col-lg-3';
                
                const wrapper = document.createElement('div');
                
                const link = document.createElement('a');
                link.href = 'javascript:void(0)';
                link.innerHTML = ep.name;
                
                wrapper.onclick = () => {
                    document.querySelectorAll('.episode-list > div > div').forEach(w => {
                        w.style.border = '1px solid transparent';
                        w.style.background = 'rgba(107, 103, 125, 0.4)';
                        const a = w.querySelector('a');
                        if(a) {
                            a.style.background = 'none';
                            a.style.webkitTextFillColor = 'white';
                            a.style.fontWeight = '400';
                        }
                    });

                    wrapper.style.border = '1px solid #97dde8';
                    wrapper.style.background = 'rgba(255, 255, 255, 0.1)';
                    link.style.background = 'linear-gradient(90deg, #97dde8, #ffccf2)';
                    link.style.webkitBackgroundClip = 'text';
                    link.style.webkitTextFillColor = 'transparent';
                    link.style.fontWeight = '600';

                    setContent('.name-film-play p', `${movie.name} - ${ep.name}`);

                    loadVideoSource(ep.link_m3u8);
                };

                wrapper.appendChild(link);
                col.appendChild(wrapper);
                episodeContainer.appendChild(col);

                if (index === 0) wrapper.click();
            });
        } else {
            episodeContainer.innerHTML = '<div class="text-white-50 p-2">Đang cập nhật...</div>';
        }
    }

    function loadVideoSource(source) {
        if (!source) return;
        if (Hls.isSupported()) {
            if (hls) hls.destroy();
            hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', () => video.play());
        } else {
            video.src = source;
        }
    }

    const recommendContainer = document.querySelector('.js-movie-list-recommend');
    if (recommendContainer) {
        try {
            const newMovies = await fetchNewMovies(1);
            const recommendations = newMovies.filter(m => m.slug !== movie.slug).slice(0, 5);

            if (recommendations.length > 0) {
                recommendContainer.innerHTML = recommendations.map(m => {
                    const posterUrl = m.poster_url.startsWith('http') ? m.poster_url : `https://phimimg.com/${m.poster_url}`;
                    return `
                    <div class="movie-recommend-box" onclick="window.location.href='watch.html?slug=${m.slug}'">
                        <div class="poster-movie-recommend">
                            <img src="${posterUrl}" alt="${m.name}">
                        </div>
                        <div class="info-movie-recommend">
                            <div class="name-movie-recommend">
                                <p>${m.name}</p>
                                <p>${m.origin_name}</p>
                            </div>
                            <div><i class="fa-solid fa-star text-warning"></i> ${m.year}</div>
                        </div>
                    </div>
                `}).join('');
            } else {
                recommendContainer.innerHTML = '<div class="text-center text-secondary py-3">Không có đề xuất</div>';
            }
        } catch (e) {
            console.error(e);
            recommendContainer.innerHTML = '<div class="text-center text-secondary py-3">Lỗi tải đề xuất</div>';
        }
    }

    if (typeof initCommentManager === 'function') initCommentManager();
}

initWatchPage();