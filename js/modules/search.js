// search.js
import { searchMovies } from './api.js';

let searchTimeout;

function initSearch() {
    const searchInput = document.querySelector('#searchInput');
    const searchResults = document.querySelector('#searchResults');
    const searchResultsContent = document.querySelector('.search-results-content');

    if (!searchInput || !searchResults || !searchResultsContent) {
       
        return;
    }

    searchInput.addEventListener('input', handleSearch);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.style.display = 'none';
        }
    });
    
    searchResults.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    function handleSearch(e) {
        const keyword = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (keyword.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                searchResultsContent.innerHTML = '<div class="text-center p-3 text-white"><i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...</div>';
                searchResults.style.display = 'block';
                
                const results = await searchMovies(keyword, 10);
                
                if (results.length === 0) {
                    searchResultsContent.innerHTML = '<div class="search-no-results">Không tìm thấy phim nào</div>';
                } else {
                    renderSearchResults(results);
                }
            } catch (error) {
                console.error('Search error:', error);
                searchResultsContent.innerHTML = '<div class="search-no-results">Đã xảy ra lỗi</div>';
            }
        }, 500);
    }

    function renderSearchResults(movies) {
        let html = '';
        
        movies.forEach(movie => {
            const imageUrl = movie.thumb_url 
                ? `https://phimimg.com/${movie.thumb_url}`
                : '/assets/images/default-poster.jpg';
            
            html += `
                <a href="/movie-info.html?slug=${movie.slug}" class="search-result-item">
                    <img src="${imageUrl}" alt="${movie.name}" class="search-result-thumb" 
                         onerror="this.src='/assets/images/default-poster.jpg'">
                    <div class="search-result-info">
                        <div class="search-result-title">${movie.name}</div>
                        <div class="search-result-meta">
                            ${movie.year || 'N/A'} • ${movie.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                        </div>
                    </div>
                </a>
            `;
        });
        
        searchResultsContent.innerHTML = html;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

setTimeout(initSearch, 1000);

export { initSearch };