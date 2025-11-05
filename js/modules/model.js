
 //class thong tin phim co ban
export class Movie {
  constructor(movieDetail) {
    this._id = movieDetail._id;
    this.name = movieDetail.name;
    this.origin_name = movieDetail.origin_name;
    this.poster_url = movieDetail.poster_url;
    this.slug = movieDetail.slug;
    this.thumb_url = movieDetail.thumb_url;
    this.year = movieDetail.year;
    this.type = movieDetail.type || 'unknown';
    this.episode_current = movieDetail.episode_current;
    this.quality = movieDetail.quality || 'unknown';
    this.modified = movieDetail.modified;
    this.category = movieDetail.category;

    this.country_slug = movieDetail.country_slug || ''; 

    this.total_pages = movieDetail.total_pages || 0;
    this.current_page = movieDetail.current_page || 0;
  }
}

//class thong tin chi tiet phim
 export class MovieDetail extends Movie {
  constructor(apiResponse){
    const movieData = apiResponse.movie || apiResponse;
    super(movieData); 
    

    this.content = movieData.content;
    this.quality = movieData.quality || this.quality; 
    this.episode_total = movieData.episode_total || 0;
    this.episode_current = movieData.episode_current || this.episode_current;
    this.actor = movieData.actor;
    this.category = movieData.category;
    this.country = movieData.country;
    this.modified = movieData.modified || this.modified;
    
    this.episodes = apiResponse.episodes;
  }
}
