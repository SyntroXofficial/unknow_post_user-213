import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaPlay, FaInfoCircle, FaStar, FaCalendar, FaFilm, FaTv, FaSearch,
  FaFilter, FaSort, FaChevronDown, FaGlobe, FaClock, FaFire, FaTheaterMasks,
  FaRandom, FaChevronLeft, FaPlayCircle, FaRegCalendarAlt, FaRegStar, FaTrophy,
  FaGem, FaDragon, FaLaugh, FaChild, FaGhost, FaSpaceShuttle, FaMask, FaSkull,
  FaUserSecret, FaTheaterMasks as FaTheater, FaHeart, FaAward, FaCrown, FaVideo,
  FaGlobeAmericas, FaRegClock, FaRegCalendar, FaRegHeart, FaRegBookmark,
  FaRunning, FaMagic, FaTheaterMasks as FaTheaterMasksAlt,
  FaUserShield, FaHorse, FaFighterJet, FaShieldAlt
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

// Memoized Content Card Component
const ContentCard = memo(({ item, index, type = 'movie' }) => (
  <Link 
    to={`/${type}/${item.id}`}
    className="group relative"
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl bg-gradient-to-b from-transparent to-black/10"
    >
      <div className="aspect-[2/3] relative">
        <img
          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-end h-full">
            <button className="w-full bg-white/90 hover:bg-white text-black px-4 py-2 rounded text-sm font-semibold flex items-center justify-center space-x-2 transition-colors">
              <FaPlayCircle className="w-4 h-4" />
              <span>Watch Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
));

// Memoized Featured Slide Component
const FeaturedSlide = memo(({ item }) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0"
  >
    <div className="relative h-full">
      <div className="absolute inset-0">
        <img
          src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-8 pb-48">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl space-y-4"
          >
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {item.title || item.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                <span className="text-white font-bold">
                  {item.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegCalendarAlt className="text-gray-400 w-4 h-4 mr-1" />
                <span className="text-white/80">
                  {(item.release_date || item.first_air_date)?.split('-')[0]}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegClock className="text-gray-400 w-4 h-4 mr-1" />
                <span className="text-white/80">Now Streaming</span>
              </div>
            </div>
            <p className="text-base text-white/90 line-clamp-3">
              {item.overview}
            </p>
            <div className="flex items-center space-x-3">
              <Link
                to={`/${item.media_type}/${item.id}`}
                className="inline-flex items-center px-6 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors space-x-2 text-sm"
              >
                <FaPlay className="w-3 h-3" />
                <span>Watch Now</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
));

// Memoized Content Section Component
const ContentSection = memo(({ title, items, icon: Icon, iconColor, type }) => (
  <section>
    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
      <Icon className={`${iconColor} w-4 h-4 mr-2`} />
      {title}
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.slice(0, 6).map((item, index) => (
        <ContentCard key={item.id} item={item} index={index} type={type} />
      ))}
    </div>
  </section>
));

// Genre mapping function
const getGenreName = (genreId, type) => {
  const genres = {
    movie: {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Sci-Fi',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    },
    tv: {
      10759: 'Action',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      10762: 'Kids',
      9648: 'Mystery',
      10763: 'News',
      10764: 'Reality',
      10765: 'Sci-Fi & Fantasy',
      10766: 'Soap',
      10767: 'Talk',
      10768: 'War & Politics',
      37: 'Western'
    }
  };

  return genres[type]?.[genreId] || 'Unknown';
};

function Streaming() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('featured');
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [yearFilter, setYearFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [runtimeFilter, setRuntimeFilter] = useState('all');
  const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmJhMTBjNDI5OTE0MTU3MzgwOGQyNzEwNGVkMThmYSIsInN1YiI6IjY0ZjVhNTUwMTIxOTdlMDBmZWE5MzdmMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.84b7vWpVEilAbly4RpS01E9tyirHdhSXjcpfmTczI3Q';

  // Add new content categories
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyShows, setComedyShows] = useState([]);
  const [sciFiContent, setSciFiContent] = useState([]);
  const [horrorContent, setHorrorContent] = useState([]);
  const [familyContent, setFamilyContent] = useState([]);
  const [awardWinning, setAwardWinning] = useState([]);
  const [adventureMovies, setAdventureMovies] = useState([]);
  const [mysteryContent, setMysteryContent] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [thrillerMovies, setThrillerMovies] = useState([]);
  const [crimeShows, setCrimeShows] = useState([]);
  const [fantasyContent, setFantasyContent] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);
  const [dramaContent, setDramaContent] = useState([]);
  const [warMovies, setWarMovies] = useState([]);
  const [westernContent, setWesternContent] = useState([]);

  const searchContent = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
        params: { query },
        headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
      });
      setSearchResults(response.data.results.filter(item => 
        item.media_type !== 'person' && item.poster_path
      ));
    } catch (error) {
      console.error('Error searching content:', error);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchContent(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchContent]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const [
          trendingRes,
          moviesRes,
          showsRes,
          actionRes,
          comedyRes,
          sciFiRes,
          horrorRes,
          familyRes,
          awardRes,
          adventureRes,
          mysteryRes,
          romanceRes,
          thrillerRes,
          crimeRes,
          fantasyRes,
          docsRes,
          dramaRes,
          warRes,
          westernRes
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
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '28' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/tv', {
            params: { with_genres: '35' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '878' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '27' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '10751' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/movie/top_rated', {
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '12' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '9648' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '10749' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '53' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/tv', {
            params: { with_genres: '80' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '14' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '99' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '18' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '10752' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          }),
          axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: { with_genres: '37' },
            headers: { 'Authorization': `Bearer ${TMDB_TOKEN}` }
          })
        ]);

        setTrending(trendingRes.data.results.filter(item => item.backdrop_path));
        setPopularMovies(moviesRes.data.results);
        setTopRatedShows(showsRes.data.results);
        setActionMovies(actionRes.data.results);
        setComedyShows(comedyRes.data.results);
        setSciFiContent(sciFiRes.data.results);
        setHorrorContent(horrorRes.data.results);
        setFamilyContent(familyRes.data.results);
        setAwardWinning(awardRes.data.results);
        setAdventureMovies(adventureRes.data.results);
        setMysteryContent(mysteryRes.data.results);
        setRomanceMovies(romanceRes.data.results);
        setThrillerMovies(thrillerRes.data.results);
        setCrimeShows(crimeRes.data.results);
        setFantasyContent(fantasyRes.data.results);
        setDocumentaries(docsRes.data.results);
        setDramaContent(dramaRes.data.results);
        setWarMovies(warRes.data.results);
        setWesternContent(westernRes.data.results);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % trending.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [trending.length, isLoading]);

  const filterContent = (content) => {
    return content.filter(item => {
      const year = new Date(item.release_date || item.first_air_date).getFullYear();
      const rating = item.vote_average;
      const language = item.original_language;
      
      return (yearFilter === 'all' || year >= parseInt(yearFilter)) &&
             (ratingFilter === 'all' || rating >= parseFloat(ratingFilter)) &&
             (languageFilter === 'all' || language === languageFilter);
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'year':
          return new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date);
        case 'name':
          return (a.title || a.name).localeCompare(b.title || b.name);
        case 'trending':
          return b.popularity - a.popularity;
        default:
          return b.popularity - a.popularity;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Slider */}
      {!searchQuery && (
        <div className="relative h-[85vh]">
          <AnimatePresence mode="wait">
            {trending[currentSlide] && (
              <FeaturedSlide item={trending[currentSlide]} />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Enhanced Filter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Browse Content</h2>
              <p className="text-gray-400">Discover movies and TV shows</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies and shows..."
                  className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg border border-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="8">8+ Rating</option>
                <option value="7">7+ Rating</option>
                <option value="6">6+ Rating</option>
                <option value="5">5+ Rating</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="rating">Sort by Rating</option>
                <option value="year">Sort by Year</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((item, index) => (
                <ContentCard 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  type={item.media_type} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Sections - Only show if not searching */}
        {!searchQuery && (
          <div className="space-y-12">
            {/* Popular Movies */}
            <ContentSection
              title="Popular Movies"
              items={filterContent(popularMovies)}
              icon={FaFilm}
              iconColor="text-blue-500"
              type="movie"
            />

            {/* Top Rated Shows */}
            <ContentSection
              title="Top Rated Shows"
              items={filterContent(topRatedShows)}
              icon={FaTv}
              iconColor="text-purple-500"
              type="tv"
            />

            {/* Action Movies */}
            <ContentSection
              title="Action Movies"
              items={filterContent(actionMovies)}
              icon={FaFighterJet}
              iconColor="text-red-500"
              type="movie"
            />

            {/* Comedy Shows */}
            <ContentSection
              title="Comedy Shows"
              items={filterContent(comedyShows)}
              icon={FaLaugh}
              iconColor="text-yellow-500"
              type="tv"
            />

            {/* Sci-Fi Content */}
            <ContentSection
              title="Sci-Fi Movies"
              items={filterContent(sciFiContent)}
              icon={FaSpaceShuttle}
              iconColor="text-green-500"
              type="movie"
            />

            {/* Horror Content */}
            <ContentSection
              title="Horror Movies"
              items={filterContent(horrorContent)}
              icon={FaGhost}
              iconColor="text-orange-500"
              type="movie"
            />

            {/* Family Content */}
            <ContentSection
              title="Family Movies"
              items={filterContent(familyContent)}
              icon={FaChild}
              iconColor="text-indigo-500"
              type="movie"
            />

            {/* Award Winning */}
            <ContentSection
              title="Award Winners"
              items={filterContent(awardWinning)}
              icon={FaTrophy}
              iconColor="text-yellow-500"
              type="movie"
            />

            {/* Adventure Movies */}
            <ContentSection
              title="Adventure Movies"
              items={filterContent(adventureMovies)}
              icon={FaRunning}
              iconColor="text-green-500"
              type="movie"
            />

            {/* Mystery Content */}
            <ContentSection
              title="Mystery Movies"
              items={filterContent(mysteryContent)}
              icon={FaUserSecret}
              iconColor="text-purple-500"
              type="movie"
            />

            {/* Romance Movies */}
            <ContentSection
              title="Romance Movies"
              items={filterContent(romanceMovies)}
              icon={FaHeart}
              iconColor="text-red-500"
              type="movie"
            />

            {/* Thriller Movies */}
            <ContentSection
              title="Thriller Movies"
              items={filterContent(thrillerMovies)}
              icon={FaSkull}
              iconColor="text-gray-500"
              type="movie"
            />

            {/* Crime Shows */}
            <ContentSection
              title="Crime Shows"
              items={filterContent(crimeShows)}
              icon={FaUserSecret}
              iconColor="text-blue-500"
              type="tv"
            />

            {/* Fantasy Content */}
            <ContentSection
              title="Fantasy Movies"
              items={filterContent(fantasyContent)}
              icon={FaMagic}
              iconColor="text-purple-500"
              type="movie"
            />

            {/* Documentaries */}
            <ContentSection
              title="Documentaries"
              items={filterContent(documentaries)}
              icon={FaVideo}
              iconColor="text-green-500"
              type="movie"
            />

            {/* Drama Content */}
            <ContentSection
              title="Drama Movies"
              items={filterContent(dramaContent)}
              icon={FaTheater}
              iconColor="text-yellow-500"
              type="movie"
            />

            {/* War Movies */}
            <ContentSection
              title="War Movies"
              items={filterContent(warMovies)}
              icon={FaShieldAlt}
              iconColor="text-red-500"
              type="movie"
            />

            {/* Western Content */}
            <ContentSection
              title="Western Movies"
              items={filterContent(westernContent)}
              icon={FaHorse}
              iconColor="text-brown-500"
              type="movie"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Streaming;