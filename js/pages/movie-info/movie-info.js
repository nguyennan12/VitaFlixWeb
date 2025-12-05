// File: js/pages/movie-info/movie-info.js
import { getMovieBySlug } from '../../modules/utils.js';
import { randomIDMb } from '../home/utils-content.js';
// Hàm lấy slug từ URL
function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Hàm render thông tin phim
function renderMovieInfo(movie) {
    if (!movie) {
        console.error('Không tìm thấy thông tin phim');
        return;
    }

    console.log('Rendering movie:', movie);

    // Cập nhật title
    document.title = `${movie.name} - VitaFlix`;

    // Cập nhật thumb
    const thumbImg = document.querySelector('.thumb-box img');
    if (thumbImg) {
        thumbImg.src = `${movie.thumb_url}`;
        thumbImg.alt = movie.name;
    }

    // Cập nhật poster
    const posterImg = document.querySelector('.poster-left-box img');
    if (posterImg) {    
        posterImg.src = `${movie.poster_url}`;
        posterImg.alt = movie.name;
    }

    
   
    // Cập nhật info left box
    const infoElements = document.querySelectorAll('.info-left-box .info div');
    if (infoElements.length >= 4) {
        infoElements[0].textContent = `IMDb ${randomIDMb()}`; // Có thể random hoặc lấy từ API
      infoElements[1].textContent = movie.quality || 'HD';
      infoElements[2].textContent = movie.year || '2024';
      if(movie.type === 'single'){
        infoElements[3].textContent = 'Full'
      }else{
        infoElements[3].textContent = `Tập ${movie.episode_total}`;
      }
    }

    // Cập nhật button play
    const buttonPlay = document.querySelector('.button-play a');
    if (buttonPlay && movie.episodes && movie.episodes.length > 0) {
        const firstEpisode = movie.episodes[0].server_data[0];
        buttonPlay.href = `page/watch.html?slug=${movie.slug}`;
    }

    // Cập nhật title right box
    const titleRightBox = document.querySelector('.title-right-box p');
    const titleSpan = document.querySelector('.title-right-box span');
    if (titleRightBox) titleRightBox.textContent = movie.name;
    if (titleSpan) titleSpan.textContent = movie.origin_name;

    // Cập nhật info right box
    const genreBoxes = document.querySelectorAll('.genre p span');
    if (genreBoxes.length >= 2) {
        genreBoxes[0].textContent = movie.category?.map(c => c.name).join(', ') || '';
        genreBoxes[1].textContent = `Đạo diễn: ${movie.actor?.join(', ') || 'Đang cập nhật'}`;
    }

    const genreContentBoxes = document.querySelectorAll('.info-right-box .genre-content p span');
    if (genreContentBoxes.length >= 2) {
        genreContentBoxes[0].textContent = `Diễn viên: ${movie.actor?.join(', ') || 'Đang cập nhật'}`;
        genreContentBoxes[1].textContent = movie.content || '';
    }

    // Cập nhật status
    const statusBox = document.querySelector('.status p');
    if (statusBox) {
        statusBox.textContent = `${movie.episode_current} - ${movie.quality}`;
    }

    // Render episode list
    renderEpisodeList(movie);
}

// Hàm render danh sách tập phim
function renderEpisodeList(movie) {
    const episodeListContainer = document.querySelector('.episoed-list');
    
    if (!episodeListContainer) return;

    if (!movie.episodes || movie.episodes.length === 0) {
        episodeListContainer.innerHTML = '<p>Chưa có tập phim</p>';
        return;
    }

    

    let episodesHTML = '';
    
    movie.episodes.forEach(server => {
        if (server.server_data && server.server_data.length > 0) {
            server.server_data.forEach(episode => {
                episodesHTML += `
                    <div class="episode-item" style="display: inline-block; margin: 5px;">
                        <a href="/watch.html?slug=${movie.slug}" 
                           style="display: block; padding: 10px 15px; background: rgba(107, 103, 125, 0.4); color: #fff; text-decoration: none; border-radius: 5px;">
                            <i class="fa-solid fa-play" style="margin-right: 5px;"></i>
                            <span>${episode.name}</span>
                        </a>
                    </div>
                `;
            });
        }
    });

    episodeListContainer.innerHTML = episodesHTML || '<p>Chưa có tập phim</p>';
}

// Khởi tạo khi trang load
async function initMovieInfo() {
    const slug = getSlugFromURL();
    
    if (!slug) {
        alert('Không tìm thấy thông tin phim!');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Hiển thị loading
        console.log('Đang tải thông tin phim...');
        
        // Lấy thông tin phim
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
}
console.log(getSlugFromURL());

// Chạy khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMovieInfo);
} else {
    initMovieInfo();
}