
import { getMovieBySlug } from '../../modules/utils.js';
import { randomIDMb } from '../home/utils-content.js';
import { initCommentManager } from '../../modules/comment.js';
import { catagorMovie, updateMovieCategories } from "../../modules/categorize.js";

function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}


function setupLikeButton(movie) {
    const likeButton = document.querySelector('.button-like-share div:first-child');
    const heartIcon = likeButton?.querySelector('i');
    
    if (!likeButton || !heartIcon) return;

    const STORAGE_KEY = 'movieFavSlug';
    let favMovies = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const isLiked = favMovies.includes(movie.slug);
    
    updateHeartIcon(heartIcon, isLiked);
    likeButton.style.cursor = 'pointer';
    
    likeButton.onclick = async () => {
        let currentFavs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        if (currentFavs.includes(movie.slug)) {
            currentFavs = currentFavs.filter(slug => slug !== movie.slug);
            updateHeartIcon(heartIcon, false);
        } else {
            currentFavs.unshift(movie.slug);
            updateHeartIcon(heartIcon, true);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFavs));
        localStorage.removeItem('movieFav');

        await updateMovieCategories();
    };
    
    
    likeButton.addEventListener('mouseenter', () => {
        heartIcon.style.transform = 'scale(1.2)';
        heartIcon.style.transition = 'transform 0.2s ease';
    });
    
    likeButton.addEventListener('mouseleave', () => {
        heartIcon.style.transform = 'scale(1)';
    });
}


function updateHeartIcon(icon, isLiked) {
    if (isLiked) {
        icon.style.color = '#e0245e';
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    } else {
        icon.style.color = '';
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        icon.style.transform = 'scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    }
}

function renderMovieInfo(movie) {
    if (!movie) {
        console.error('Không tìm thấy thông tin phim');
        return;
    }

    console.log('Rendering movie:', movie);

    document.title = `${movie.name} - VitaFlix`;

    const thumbImg = document.querySelector('.thumb-box img');
    if (thumbImg) {
        thumbImg.src = `${movie.thumb_url}`;
        thumbImg.alt = movie.name;
    }

    const posterImg = document.querySelector('.poster-left-box img');
    if (posterImg) {    
        posterImg.src = `${movie.poster_url}`;
        posterImg.alt = movie.name;
    }

    const infoElements = document.querySelectorAll('.info-left-box .info div');
    if (infoElements.length >= 4) {
        infoElements[0].textContent = `IMDb ${randomIDMb()}`;
        infoElements[1].textContent = movie.quality || 'HD';
        infoElements[2].textContent = movie.year || '2024';
        if(movie.type === 'single'){
            infoElements[3].textContent = 'Full'
        }else{
            infoElements[3].textContent = `Tập ${movie.episode_total}`;
        }
    }

    const buttonPlay = document.querySelector('.button-play a');
    if (buttonPlay && movie.episodes && movie.episodes.length > 0) {
        buttonPlay.href = `watch.html?slug=${movie.slug}`;
    }

    const titleRightBox = document.querySelector('.title-right-box p');
    const titleSpan = document.querySelector('.title-right-box span');
    if (titleRightBox) titleRightBox.textContent = movie.name;
    if (titleSpan) titleSpan.textContent = movie.origin_name;

    const labels = document.querySelectorAll('.genre .label');
    const values = document.querySelectorAll('.genre .value');

    labels[0].textContent = "Thể loại:";
    values[0].textContent = movie.category?.map(c => c.name).join(', ') || "Đang cập nhật";

    labels[1].textContent = "Đạo diễn:";
    values[1].textContent = movie.director?.join(', ') || "Đang cập nhật";

    labels[2].textContent = "Diễn viên:";
    values[2].textContent = movie.actor?.join(', ') || "Đang cập nhật";

    labels[3].textContent = "Nội dung:";
    values[3].textContent = movie.content || "";

    const statusBox = document.querySelector('.status p');
    if (statusBox) {
        statusBox.textContent = `${movie.episode_current || 'Đang cập nhật'} - ${movie.quality}`;
    }

    const recommendContainer = document.querySelector('.js-movie-list-recommend');
    if (recommendContainer) {
        try {
            const newMovies = catagorMovie.full;
            const recommendations = newMovies.filter(m => m.slug !== movie.slug).slice(0, 10);

            if (recommendations.length > 0) {
                recommendContainer.innerHTML = recommendations.map(m => {
                    const posterUrl = m.poster_url.startsWith('http') ? m.poster_url : `https://phimimg.com/${m.poster_url}`;
                    return `
                    <div class="movie-recommend-box" onclick="window.location.href='movie-info.html?slug=${m.slug}'">
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
    renderEpisodeList(movie);
    
    setupLikeButton(movie);
}

function renderEpisodeList(movie) { 
    const episodesList = movie.episodes?.[0]?.server_data || []; 
    const episodeContainer = document.querySelector('.episode-list'); 
    
    if (!episodeContainer) return; 
    
    episodeContainer.innerHTML = ''; 
    if (episodesList.length > 0) { 
        episodesList.forEach((ep, index) => { 
            const col = document.createElement('div'); 
            col.className = 'col-3 col-md-2 col-lg-3'; 

            const wrapper = document.createElement('div'); 
            wrapper.style.padding = "8px"; 
            wrapper.style.background = "rgba(107,103,125,0)"; 
            wrapper.style.borderRadius = "5px"; 
            wrapper.style.marginBottom = "8px"; 
            wrapper.style.cursor = "pointer";
           
            
            const link = document.createElement('a'); 
            link.href = `watch.html?slug=${movie.slug}&ep=${index}`; 
            link.textContent = ep.name; 
            link.style.color = "#fff"; 
            link.style.textDecoration = "none"; 
            link.style.display = "block";
            link.style.textAlign = "center";
            
            wrapper.appendChild(link); 
            col.appendChild(wrapper); 
            episodeContainer.appendChild(col); 
        }); 
    } else { 
        episodeContainer.innerHTML = '<p>Đang cập nhật...</p>'; 
    } 
}

async function initMovieInfo() {
    const slug = getSlugFromURL();
    
    if (!slug) {
        alert('Không tìm thấy thông tin phim!');
        window.location.href = 'index.html';
        return;
    }

    try {
        const movie = await getMovieBySlug(slug);
        
        if (movie) {
            renderMovieInfo(movie);
        } else {
            alert('Không thể tải thông tin phim!');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin phim:', error);
        alert('Đã xảy ra lỗi khi tải thông tin phim!');
    }

    if (typeof initCommentManager === 'function') initCommentManager();
}

console.log(getSlugFromURL());

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMovieInfo);
} else {
    initMovieInfo();
}