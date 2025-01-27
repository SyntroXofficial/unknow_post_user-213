import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGamepad, FaInfoCircle, FaStar, FaDesktop, FaCalendar, FaClock,
  FaFilter, FaSort, FaSearch, FaWindows, FaPlaystation, FaXbox,
  FaGlobe, FaUserClock, FaChevronDown, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { allGames } from '../data/gameAccounts';

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

function Games() {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 6;
  
  useEffect(() => {
    if (allGames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === allGames.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  if (allGames.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading games...</div>
      </div>
    );
  }

  const featuredGame = allGames[currentFeaturedIndex];
  const gameUrl = featuredGame.game.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const getPlatformIcon = (platform) => {
    if (platform.includes('Windows') || platform.includes('PC')) return <FaWindows />;
    if (platform.includes('PlayStation')) return <FaPlaystation />;
    if (platform.includes('Xbox')) return <FaXbox />;
    return <FaGlobe />;
  };

  const filteredGames = allGames
    .filter(game => {
      const matchesSearch = game.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filter === 'all' || 
                          game.features.some(f => f.label === 'Genre' && f.value.toLowerCase().includes(filter.toLowerCase()));
      const matchesPlatform = selectedPlatform === 'all' ||
                             game.features.some(f => f.label === 'Platform' && f.value.toLowerCase().includes(selectedPlatform.toLowerCase()));
      const matchesRating = selectedRating === 'all' ||
                           game.features.some(f => f.label === 'Rating' && f.value === selectedRating);
      
      return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.game.localeCompare(b.game);
        case 'rating':
          return b.features.find(f => f.label === 'Rating')?.value.localeCompare(
            a.features.find(f => f.label === 'Rating')?.value
          );
        case 'release':
          return b.features.find(f => f.label === 'Release')?.value.localeCompare(
            a.features.find(f => f.label === 'Release')?.value
          );
        case 'playtime':
          return parseInt(b.features.find(f => f.label === 'Playtime')?.value) -
                 parseInt(a.features.find(f => f.label === 'Playtime')?.value);
        default:
          return 0;
      }
    });

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderGameCard = (game) => {
    const gameUrl = game.game.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
      <motion.div 
        key={game.game}
        variants={item}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group"
      >
        <Link to={`/game/${gameUrl}`}>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-white/20 h-full">
            {/* Image Section - Fixed aspect ratio */}
            <div className="aspect-[16/9] relative">
              <img
                src={game.imageUrl}
                alt={game.game}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 line-clamp-1">{game.game}</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.features.find(f => f.label === 'Genre')?.value.split(' & ').map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-white text-sm font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-base line-clamp-3">
                {game.description}
              </p>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Platform</p>
                  <div className="flex items-center gap-1">
                    {getPlatformIcon(game.features.find(f => f.label === 'Platform')?.value)}
                    <span className="text-white/90 text-sm">
                      {game.features.find(f => f.label === 'Platform')?.value}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Release</p>
                  <div className="flex items-center gap-1">
                    <FaCalendar className="w-4 h-4 text-gray-400" />
                    <span className="text-white/90 text-sm">
                      {game.features.find(f => f.label === 'Release')?.value}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Rating</p>
                  <div className="flex items-center gap-1">
                    <FaStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-white/90 text-sm">
                      {game.features.find(f => f.label === 'Rating')?.value}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Playtime</p>
                  <div className="flex items-center gap-1">
                    <FaClock className="w-4 h-4 text-gray-400" />
                    <span className="text-white/90 text-sm">
                      {game.features.find(f => f.label === 'Playtime')?.value}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <span className="text-white px-4 py-2 bg-white/10 rounded-lg text-sm font-medium group-hover:bg-white/20 transition-colors">
                  Play Now
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Game */}
      <div className="relative h-[90vh]">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <img
              src={featuredGame.imageUrl}
              alt={featuredGame.game}
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
              {featuredGame.game}
            </h1>
            <p className="text-base text-white/90 leading-relaxed max-w-xl line-clamp-2">
              {featuredGame.description}
            </p>
            <div className="flex items-center space-x-3">
              <Link
                to={`/game/${gameUrl}`}
                className="flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold group"
              >
                <FaGamepad className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Play Now
              </Link>
              <Link
                to={`/game/${gameUrl}`}
                className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
              >
                <FaInfoCircle className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                More Info
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                <span className="text-white/80">
                  {featuredGame.features.find(f => f.label === 'Platform')?.value}
                </span>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-white/80">
                  {featuredGame.features.find(f => f.label === 'Release')?.value}
                </span>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-white/80">
                  {featuredGame.features.find(f => f.label === 'Rating')?.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-12 pb-16">
        <motion.section 
          className="animate-fade-up"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Filter Controls */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Game Library</h2>
                <p className="text-gray-400">
                  {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} available
                </p>
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
                      <label className="text-gray-400 text-sm">Search Games</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or description..."
                          className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Genre</label>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="all">All Genres</option>
                        <option value="action">Action</option>
                        <option value="rpg">RPG</option>
                        <option value="horror">Horror</option>
                        <option value="adventure">Adventure</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="all">All Platforms</option>
                        <option value="pc">PC</option>
                        <option value="playstation">PlayStation</option>
                        <option value="xbox">Xbox</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                        <option value="release">Release Date</option>
                        <option value="playtime">Playtime</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Games Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {currentGames.map(renderGameCard)}
          </motion.div>

          {/* Pagination Controls */}
          {filteredGames.length > 0 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      currentPage === index + 1
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* No Results Message */}
          {filteredGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
              <p className="text-gray-400">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default Games;
