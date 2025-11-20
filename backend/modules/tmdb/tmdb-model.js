// backend/modules/tmdb/tmdb-model.js
const https = require("https");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function fetchFromTMDB(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams({
            api_key: TMDB_API_KEY,
            ...params
        });
        
        const url = `${TMDB_BASE_URL}${endpoint}?${urlParams}`;
        
        https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            });
            
        }).on('error', (error) => {
            reject(error);
        });
    });
}

class TMDbModel {
    async getPopularMovies(page = 1) {
        try {
            const data = await fetchFromTMDB('/movie/popular', { page });
            return {
                success: true,
                data: { page: data.page, totalPages: data.total_pages,movies: data.results }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async searchMovies(query, page = 1) {
        try {
            const data = await fetchFromTMDB('/search/movie', { 
                query: query.trim(),
                page: page
            });
            
            return {
                success: true,
                data: { query: query, page: data.page, totalPages: data.total_pages, movies: data.results }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getMovieDetails(movieId) {
        try {
            const data = await fetchFromTMDB(`/movie/${movieId}`);
            
            return {
                success: true,
                data: {
                    movie: data
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getSimilarMovies(movieId) {
        try {
            const data = await fetchFromTMDB(`/movie/${movieId}/similar`);
            return {
                success: true,
                data: {
                    similarMovies: data.results
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getGenres() {
        try {
            const data = await fetchFromTMDB('/genre/movie/list');
            return {
                success: true,
                data: {genres: data.genres}
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTrendingMovies(timeWindow = 'week') {
        try {
            const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
            return {
                success: true,
                data: {movies: data.results}
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAPIStatus() {
        try {
            const data = await fetchFromTMDB('/genre/movie/list');
            return {
                success: true,
                data: { message: 'TMDB API connected' }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new TMDbModel();