import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, FaInfoCircle, FaStar, FaCalendar, FaSearch,
  FaFilter, FaSort, FaChevronDown, FaGlobe, FaClock, 
  FaPlayCircle, FaChevronLeft, FaChevronRight, FaRegCalendarAlt,
  FaWindows, FaPlaystation, FaXbox
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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

const GameCard = memo(({ game, index }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (!game.id) return;
    window.scrollTo(0, 0);
    navigate(`/game/${game.id}`);
  };
  
  return (
    <div onClick={handleClick} className="group cursor-pointer">
      <motion.div
        variants={item}
        className="relative h-[300px] rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 bg-gradient-to-b from-transparent to-black/10"
      >
        <div className="relative w-full h-full">
          <img
            src={game.imageUrl}
            alt={game.game}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button className="w-full bg-white/90 hover:bg-white text-black px-3 py-2 rounded text-sm font-semibold flex items-center justify-center space-x-2 transition-colors">
                <FaPlayCircle className="w-4 h-4" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

const FeaturedSlide = memo(({ item, navigate }) => (
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
          src={item.imageUrl}
          alt={item.game}
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
              {item.game}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 w-4 h-4 mr-1" />
                <span className="text-white font-bold">
                  {item.features.find(f => f.label === 'Rating')?.value}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegCalendarAlt className="text-gray-400 w-4 h-4 mr-1" />
                <span className="text-white/80">
                  {item.features.find(f => f.label === 'Release')?.value}
                </span>
              </div>
            </div>
            <p className="text-base text-white/90 line-clamp-3">
              {item.description}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/game/${item.id}`)}
                className="inline-flex items-center px-6 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors space-x-2 text-sm"
              >
                <FaPlay className="w-3 h-3" />
                <span>Play Now</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
));

function Games() {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const gamesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const gamesQuery = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGames(gamesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % games.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [games.length]);

  const featuredGame = games[currentFeaturedIndex];
  const gameUrl = featuredGame?.game.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const handleFeaturedGameClick = () => {
    window.scrollTo(0, 0);
    navigate(`/game/${gameUrl}`);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' ||
                           game.features.some(f => f.label === 'Platform' && 
                           f.value.toLowerCase().includes(selectedPlatform.toLowerCase()));
    return matchesSearch && matchesPlatform;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.features.find(f => f.label === 'Rating')?.value || 0) - 
               (a.features.find(f => f.label === 'Rating')?.value || 0);
      case 'release':
        return (b.features.find(f => f.label === 'Release')?.value || '') >
               (a.features.find(f => f.label === 'Release')?.value || '') ? 1 : -1;
      case 'name':
        return a.game.localeCompare(b.game);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading amazing games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Slider */}
      {!searchQuery && featuredGame && (
        <div className="relative h-[95vh]">
          <AnimatePresence mode="wait">
            <FeaturedSlide item={featuredGame} navigate={navigate} />
          </AnimatePresence>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Enhanced Filter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Browse Games</h2>
              <p className="text-gray-400">Discover and play amazing games</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg border border-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
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
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="release">Sort by Release Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-3 gap-8">
          {currentGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {/* Pagination */}
        {filteredGames.length > gamesPerPage && (
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
      </div>
    </div>
  );
}

export default Games;