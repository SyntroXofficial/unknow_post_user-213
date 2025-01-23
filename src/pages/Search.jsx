import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaFilm, FaTv, FaSearch, FaCalendar, FaLanguage } from 'react-icons/fa';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const searchContent = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
          params: {
            query,
            include_adult: false,
            language: 'en-US',
            page: 1
          },
          headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
        });

        setResults(response.data.results.filter(item => 
          item.media_type !== 'person' && item.poster_path
        ));
      } catch (error) {
        console.error('Error searching content:', error);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [query]);

  const filteredResults = results.filter(item => {
    if (activeFilter === 'all') return true;
    return item.media_type === activeFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'date':
        const dateA = new Date(a.release_date || a.first_air_date || '0');
        const dateB = new Date(b.release_date || b.first_air_date || '0');
        return dateB - dateA;
      case 'title':
        return (a.title || a.name).localeCompare(b.title || b.name);
      default: // popularity
        return b.popularity - a.popularity;
    }
  });

  const getGenreBadge = (type) => {
    return type === 'movie' ? (
      <span className="px-2 py-1 bg-white/10 text-white rounded-full text-xs font-semibold">
        <FaFilm className="inline-block mr-1" />
        Movie
      </span>
    ) : (
      <span className="px-2 py-1 bg-white/10 text-white rounded-full text-xs font-semibold">
        <FaTv className="inline-block mr-1" />
        TV Show
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black pt-32 px-16 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-500">
                Found {filteredResults.length} results
              </p>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-white"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="rating">Sort by Rating</option>
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-black text-gray-400 hover:bg-white/10 border border-white/20'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveFilter('movie')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'movie'
                  ? 'bg-white text-black'
                  : 'bg-black text-gray-400 hover:bg-white/10 border border-white/20'
              }`}
            >
              Movies Only
            </button>
            <button
              onClick={() => setActiveFilter('tv')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === 'tv'
                  ? 'bg-white text-black'
                  : 'bg-black text-gray-400 hover:bg-white/10 border border-white/20'
              }`}
            >
              TV Shows Only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="text-gray-500">Searching for content...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-full p-8 border border-white/20">
              <FaSearch className="w-16 h-16 text-gray-700" />
            </div>
            <p className="text-2xl font-semibold text-gray-400">No results found</p>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredResults.map((item) => (
              <Link 
                key={item.id}
                to={`/${item.media_type}/${item.id}`}
                className="transform transition-all duration-300 hover:scale-105 group"
              >
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl border border-white/20 hover:border-white/50 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-300">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="mb-2">
                        {getGenreBadge(item.media_type)}
                      </div>
                      <p className="text-white font-bold text-lg mb-1">
                        {item.title || item.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                          <FaStar className="text-yellow-500 w-3 h-3 mr-1" />
                          <span className="text-white text-sm">
                            {item.vote_average?.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                          <FaCalendar className="text-gray-400 w-3 h-3 mr-1" />
                          <span className="text-white text-sm">
                            {(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                          <FaLanguage className="text-gray-400 w-3 h-3 mr-1" />
                          <span className="text-white text-sm">
                            {item.original_language?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                        {item.overview}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;