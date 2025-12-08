// File: js/pages/movie-info/movie-info.js
import { getMovieBySlug } from '../../modules/utils.js';
import { randomIDMb } from '../home/utils-content.js';
import { initCommentManager } from '../../../auth/scripts/comment.js';
import { catagorMovie, updateMovieCategories } from "../../modules/categorize.js";

// Hàm lấy slug từ URL
function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Hàm xử lý nút Like với đồng bộ hoàn chỉnh
function setupLikeButton(movie) {
    const likeButton = document.querySelector('.button-like-share div:first-child');
    const heartIcon = likeButton?.querySelector('i');
    
    if (!likeButton || !heartIcon) return;

    const STORAGE_KEY = 'movieFavSlug';
    
    // Lấy danh sách phim yêu thích từ localStorage
    let favMovies = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Kiểm tra phim hiện tại có trong danh sách yêu thích không
    const isLiked = favMovies.includes(movie.slug);
    
    // Cập nhật trạng thái ban đầu
    updateHeartIcon(heartIcon, isLiked);
    
    // Thêm cursor pointer
    likeButton.style.cursor = 'pointer';
    
    // Xử lý sự kiện click
    likeButton.onclick = async () => {
        let currentFavs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        if (currentFavs.includes(movie.slug)) {
            // Bỏ thích
            currentFavs = currentFavs.filter(slug => slug !== movie.slug);
            updateHeartIcon(heartIcon, false);
            
            console.log('Đã bỏ thích phim:', movie.name);
        } else {
            // Thích phim - thêm vào đầu (LIFO)
            currentFavs.unshift(movie.slug);
            updateHeartIcon(heartIcon, true);
            
            console.log('Đã thích phim:', movie.name);
        }
        
        // Lưu vào localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFavs));
        
        // Xóa cache để cập nhật lại
        localStorage.removeItem('movieFav');
        
        // Cập nhật categories để đồng bộ
        await updateMovieCategories();
    };
    
    // Thêm hiệu ứng hover
    likeButton.addEventListener('mouseenter', () => {
        heartIcon.style.transform = 'scale(1.2)';
        heartIcon.style.transition = 'transform 0.2s ease';
    });
    
    likeButton.addEventListener('mouseleave', () => {
        heartIcon.style.transform = 'scale(1)';
    });
}

// Hàm cập nhật icon trái tim
function updateHeartIcon(icon, isLiked) {
    if (isLiked) {
        icon.style.color = '#e0245e';
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        // Hiệu ứng animation
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    } else {
        icon.style.color = '';
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        // Hiệu ứng animation
        icon.style.transform = 'scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 200);
    }
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
        infoElements[0].textContent = `IMDb ${randomIDMb()}`;
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
        buttonPlay.href = `/page/watch.html?slug=${movie.slug}`;
    }

    // Cập nhật title right box
    const titleRightBox = document.querySelector('.title-right-box p');
    const titleSpan = document.querySelector('.title-right-box span');
    if (titleRightBox) titleRightBox.textContent = movie.name;
    if (titleSpan) titleSpan.textContent = movie.origin_name;

    // Cập nhật info right box
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

    // Cập nhật status
    const statusBox = document.querySelector('.status p');
    if (statusBox) {
        statusBox.textContent = `${movie.episode_current || 'Đang cập nhật'} - ${movie.quality}`;
    }

    // Render recommendations
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

    // Render episode list
    renderEpisodeList(movie);
    
    // Setup nút Like
    setupLikeButton(movie);
}

// Hàm render danh sách tập phim
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
            wrapper.style.background = "rgba(107,103,125,0.4)"; 
            wrapper.style.borderRadius = "5px"; 
            wrapper.style.marginBottom = "8px"; 
            wrapper.style.cursor = "pointer";
            wrapper.style.transition = "all 0.3s ease";
            
            // Hover effect
            wrapper.addEventListener('mouseenter', () => {
                wrapper.style.background = "rgba(151, 221, 232, 0.2)";
                wrapper.style.border = "1px solid rgba(151, 221, 232, 0.5)";
            });
            wrapper.addEventListener('mouseleave', () => {
                wrapper.style.background = "rgba(107,103,125,0.4)";
                wrapper.style.border = "1px solid transparent";
            });
            
            const link = document.createElement('a'); 
            // Truyền cả index của tập phim
            link.href = `/page/watch.html?slug=${movie.slug}&ep=${index}`; 
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

    if (typeof initCommentManager === 'function') initCommentManager();
}

console.log(getSlugFromURL());

// Chạy khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMovieInfo);
} else {
    initMovieInfo();
}