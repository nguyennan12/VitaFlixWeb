import { getMovieBySlug } from '../../modules/utils.js';
import { fullMovieList } from '../../modules/api.js';
import { initCommentManager } from '../../../auth/scripts/comment.js';

async function initWatchPage() {
    const videoElement = document.getElementById('video');
    const player = new Plyr(videoElement, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
        settings: ['quality', 'speed']
    });

    let hls = null;
    let currentEpisodeIndex = 0;
    let episodesList = [];
    let isAutoNext = true;

    const urlParams = new URLSearchParams(window.location.search);
    let movieSlug = urlParams.get('slug');
    let episodeIndex = parseInt(urlParams.get('ep')) || 0; 

    if (!movieSlug) movieSlug = 'nguu-lang-chuc-nu';

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
        let imgUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`;
        posterImg.src = imgUrl;
        if(videoElement) videoElement.poster = imgUrl;
    }

    const genreBox = document.querySelector('.genre-list');
    if (genreBox && movie.category) {
        genreBox.innerHTML = movie.category.map(cat => `
            <div class="badge bg-dark border border-secondary fw-normal me-2"><a class="cat-link" href="/categorize-movie.html?type=genre&genre=${cat.slug}">${cat.name}</div>
        `).join('');
    }

    episodesList = (movie.episodes && movie.episodes[0]) ? movie.episodes[0].server_data : [];
    const episodeContainer = document.querySelector('.episode-list');

    if (episodeContainer) {
        episodeContainer.innerHTML = '';
        if (episodesList.length > 0) {
            episodesList.forEach((ep, index) => {
                const col = document.createElement('div');
                col.className = 'col-3 col-md-2 col-lg-3';
                
                const wrapper = document.createElement('div');
                const link = document.createElement('a');
                link.href = 'javascript:void(0)';
                link.innerHTML = ep.name;
                
                wrapper.onclick = () => {
                    playEpisode(index);
                };

                wrapper.appendChild(link);
                col.appendChild(wrapper);
                episodeContainer.appendChild(col);

                if (index === 0) {
                    playEpisode(0);
                }
            });
            playEpisode(episodeIndex);
        } else {
            episodeContainer.innerHTML = '<div class="text-white-50 p-2">Đang cập nhật...</div>';
        }
    }

    function playEpisode(index) {
        if (index < 0 || index >= episodesList.length) return;
        
        currentEpisodeIndex = index;
        const ep = episodesList[index];

        const allEpisodes = document.querySelectorAll('.episode-list > div > div');
        allEpisodes.forEach((w, idx) => {
            const a = w.querySelector('a');
            if (idx === index) {
                w.style.border = '1px solid #97dde8';
                w.style.background = 'rgba(255, 255, 255, 0.1)';
                if(a) {
                    a.style.background = 'linear-gradient(90deg, #97dde8, #ffccf2)';
                    a.style.webkitBackgroundClip = 'text';
                    a.style.webkitTextFillColor = 'transparent';
                    a.style.fontWeight = '600';
                }
            } else {
                w.style.border = '1px solid transparent';
                w.style.background = 'rgba(107, 103, 125, 0.4)';
                if(a) {
                    a.style.background = 'none';
                    a.style.webkitTextFillColor = 'white';
                    a.style.fontWeight = '400';
                }
            }
        });

        setContent('.name-film-play p', `${movie.name} - ${ep.name}`);
        loadVideoSource(ep.link_m3u8);
        updateControlButtons();
    }

    function loadVideoSource(source) {
        if (!source) return;
        if (Hls.isSupported()) {
            if (hls) hls.destroy();
            hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => videoElement.play().catch(() => {}));
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = source;
            videoElement.addEventListener('loadedmetadata', () => videoElement.play());
        } else {
            videoElement.src = source;
        }
    }

    function updateControlButtons() {
        const btnPrev = document.querySelector('.prev-episode');
        const btnNext = document.querySelector('.next-episode');

        if (btnPrev) {
            if (currentEpisodeIndex <= 0) {
                btnPrev.style.opacity = '0.5';
                btnPrev.style.pointerEvents = 'none';
            } else {
                btnPrev.style.opacity = '1';
                btnPrev.style.pointerEvents = 'auto';
            }
        }

        if (btnNext) {
            if (currentEpisodeIndex >= episodesList.length - 1) {
                btnNext.style.opacity = '0.5';
                btnNext.style.pointerEvents = 'none';
            } else {
                btnNext.style.opacity = '1';
                btnNext.style.pointerEvents = 'auto';
            }
        }
    }

    function setupControlBar() {
        const btnLike = document.querySelector('.like');
        const storageLikeKey = 'liked_movies';
        
        let likedMovies = JSON.parse(localStorage.getItem(storageLikeKey)) || [];
        if (likedMovies.includes(movieSlug)) {
            if(btnLike) btnLike.classList.add('active');
        }

        if (btnLike) {
            btnLike.onclick = () => {
                btnLike.classList.toggle('active');
                let likes = JSON.parse(localStorage.getItem(storageLikeKey)) || [];
                
                if (btnLike.classList.contains('active')) {
                    if (!likes.includes(movieSlug)) likes.push(movieSlug);
                    const icon = btnLike.querySelector('i');
                    if(icon) icon.style.color = '#e0245e';
                } else {
                    likes = likes.filter(slug => slug !== movieSlug);
                    const icon = btnLike.querySelector('i');
                    if(icon) icon.style.color = '';
                }
                localStorage.setItem(storageLikeKey, JSON.stringify(likes));
            };
        }

        const btnCinema = document.querySelector('.cinema');
        const playBox = document.querySelector('.play-box');
        const badgeCinema = btnCinema ? btnCinema.querySelector('span') : null;

        if (btnCinema) {
            btnCinema.onclick = () => {
                document.body.classList.toggle('cinema-mode-on');
                playBox.classList.toggle('cinema-active');
                
                let overlay = document.getElementById('cinema-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'cinema-overlay';
                    overlay.style.position = 'fixed';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.background = 'rgba(0,0,0,0.9)';
                    overlay.style.zIndex = '999';
                    overlay.style.display = 'none';
                    overlay.onclick = () => btnCinema.click();
                    document.body.appendChild(overlay);
                    playBox.style.zIndex = '1000';
                    playBox.style.position = 'relative';
                }

                if (document.body.classList.contains('cinema-mode-on')) {
                    overlay.style.display = 'block';
                    if(badgeCinema) {
                        badgeCinema.textContent = 'on';
                        badgeCinema.style.borderColor = '#00ff00';
                        badgeCinema.style.color = '#00ff00';
                        badgeCinema.style.boxShadow = '0 0 5px #00ff00';
                    }
                } else {
                    overlay.style.display = 'none';
                    if(badgeCinema) {
                        badgeCinema.textContent = 'off';
                        badgeCinema.style.borderColor = '';
                        badgeCinema.style.color = '';
                        badgeCinema.style.boxShadow = '';
                    }
                }
            };
        }

        const btnAutoNext = document.querySelector('.change-episode');
        const badgeNext = btnAutoNext ? btnAutoNext.querySelector('span') : null;
        
        const setBadgeGradient = (badge) => {
            badge.textContent = 'on';
            badge.style.background = 'linear-gradient(90deg, #97dde8, #ffccf2)';
            badge.style.webkitBackgroundClip = 'text';
            badge.style.webkitTextFillColor = 'transparent';
            badge.style.borderColor = '#97dde8';
            badge.style.boxShadow = '0 0 5px rgba(151, 221, 232, 0.5)';
        };

        const removeBadgeGradient = (badge) => {
            badge.textContent = 'off';
            badge.style.background = 'none';
            badge.style.webkitTextFillColor = '';
            badge.style.borderColor = '';
            badge.style.boxShadow = '';
        };

        if (btnAutoNext) {
            if(badgeNext) {
                setBadgeGradient(badgeNext);
            }

            btnAutoNext.onclick = () => {
                isAutoNext = !isAutoNext;
                if (isAutoNext) {
                    if(badgeNext) setBadgeGradient(badgeNext);
                } else {
                    if(badgeNext) removeBadgeGradient(badgeNext);
                }
            };
        }

        const btnPrev = document.querySelector('.prev-episode');
        if (btnPrev) {
            btnPrev.onclick = () => {
                if (currentEpisodeIndex > 0) playEpisode(currentEpisodeIndex - 1);
            };
        }

        const btnNext = document.querySelector('.next-episode');
        if (btnNext) {
            btnNext.onclick = () => {
                if (currentEpisodeIndex < episodesList.length - 1) playEpisode(currentEpisodeIndex + 1);
            };
        }
    }

    player.on('ended', () => {
        if (isAutoNext && currentEpisodeIndex < episodesList.length - 1) {
            setTimeout(() => {
                playEpisode(currentEpisodeIndex + 1);
            }, 1000);
        }
    });

    setupControlBar();

    const recommendContainer = document.querySelector('.js-movie-list-recommend');
    if (recommendContainer) {
        try {
            const recommendations = fullMovieList
                .filter(m => m.slug !== movie.slug)
                .sort(() => Math.random() - 0.5)
                .slice(0, 6);

            if (recommendations.length > 0) {
                recommendContainer.innerHTML = recommendations.map(m => {
                    const posterUrl = m.poster_url.startsWith('http') ? m.poster_url : `https://phimimg.com/${m.poster_url}`;
                    return `
                    <a class="movie-recommend-box" href="watch.html?slug=${m.slug}">
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
                    </a>
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