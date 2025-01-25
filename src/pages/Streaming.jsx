import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaPlay, FaInfoCircle, FaStar, FaCalendar, FaLanguage, FaFilm, FaTv, FaSearch,
  FaFilter, FaSort, FaChevronDown, FaGlobe, FaClock
} from 'react-icons/fa';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

function Streaming() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [trending, setTrending] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const [
          trendingRes, 
          popularMoviesRes, 
          topShowsRes, 
          topMoviesRes,
          popularShowsRes
        ] = await Promise.all([
          axios.get('https://api.themoviedb.org/3/trending/all/day', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/popular', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/tv/top_rated', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/top_rated', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/tv/popular', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setTrending(trendingRes.data.results.filter(item => item.backdrop_path && item.poster_path).slice(0, 6));
        setTrendingMovies(trendingRes.data.results.filter(item => item.media_type === 'movie').slice(0, 6));
        setPopularMovies(popularMoviesRes.data.results.slice(0, 6));
        setTopRatedShows(topShowsRes.data.results.slice(0, 6));
        setTopRatedMovies(topMoviesRes.data.results.slice(0, 6));
        setPopularShows(popularShowsRes.data.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchAllContent();
  }, []);

  useEffect(() => {
    if (trending.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === trending.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [trending]);

  const filteredContent = trending.filter(item => {
    const matchesSearch = (item.title || item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter === 'all' || item.media_type === filter;
    const matchesRating = selectedRating === 'all' || 
                         (item.adult ? selectedRating === 'R' : selectedRating === 'PG-13');
    
    return matchesSearch && matchesType && matchesRating;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.title || a.name).localeCompare(b.title || b.name);
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'release':
        const dateA = new Date(a.release_date || a.first_air_date || '0');
        const dateB = new Date(b.release_date || b.first_air_date || '0');
        return dateB - dateA;
      default: // popularity
        return b.popularity - a.popularity;
    }
  });

  const featuredContent = trending[currentFeaturedIndex];

  const CategorySection = ({ title, items, type = 'movie' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-6 gap-6">
        {items.map((item) => (
          <Link 
            key={item.id}
            to={`/${type}/${item.id}`}
            className="transform transition-all duration-300 group"
          >
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-white/20">
              <div className="aspect-[2/3] relative">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/90 text-sm line-clamp-3">
                      {item.overview}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-black/50">
                <h3 className="text-white font-semibold text-lg line-clamp-1">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="w-4 h-4 mr-1" />
                    <span>{item.vote_average?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <FaCalendar className="w-4 h-4 mr-1" />
                    <span>{(item.release_date || item.first_air_date)?.split('-')[0]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                  <div className="flex items-center text-gray-400">
                    <FaLanguage className="w-4 h-4 mr-1" />
                    <span>{item.original_language?.toUpperCase()}</span>
                  </div>
                  <span className="text-white px-3 py-1.5 bg-white/10 rounded-lg font-medium group-hover:bg-white/20 transition-colors">
                    Watch Now
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Content */}
      {featuredContent && (
        <div className="relative h-[90vh]">
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              <img
                src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                alt={featuredContent.title || featuredContent.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ objectPosition: '50% 20%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-24 px-12">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {featuredContent.title || featuredContent.name}
              </h1>
              <p className="text-base text-white/90 leading-relaxed max-w-xl line-clamp-2">
                {featuredContent.overview}
              </p>
              <div className="flex items-center space-x-3">
                <Link
                  to={`/${featuredContent.media_type}/${featuredContent.id}`}
                  className="flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold group"
                >
                  <FaPlay className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Watch Now
                </Link>
                <Link
                  to={`/${featuredContent.media_type}/${featuredContent.id}`}
                  className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaInfoCircle className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  More Info
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                    <span className="text-white font-semibold">
                      {Math.round(featuredContent.vote_average * 10)}% Match
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/80">
                    {(featuredContent.release_date || featuredContent.first_air_date)?.split('-')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="relative z-10 px-12 pb-16">
        <motion.section 
          className="animate-fade-up"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Filter Controls */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Content Library</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <FaFilter />
                <span>Filters</span>
                <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Search Content</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by title or description..."
                          className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Content Type</label>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="all">All Types</option>
                        <option value="movie">Movies Only</option>
                        <option value="tv">TV Shows Only</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Rating</label>
                      <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="all">All Ratings</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="popularity">Popularity</option>
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                        <option value="release">Release Date</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Categories */}
          <div className="space-y-12">
            <CategorySection title="Trending Now" items={trending} type="movie" />
            <CategorySection title="Popular Movies" items={popularMovies} type="movie" />
            <CategorySection title="Top Rated Movies" items={topRatedMovies} type="movie" />
            <CategorySection title="Popular TV Shows" items={popularShows} type="tv" />
            <CategorySection title="Top Rated TV Shows" items={topRatedShows} type="tv" />
          </div>

          {/* No Results Message */}
          {filteredContent.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
              <p className="text-gray-400">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default Streaming;