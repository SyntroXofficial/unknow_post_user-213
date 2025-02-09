import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRandom, FaInfoCircle, FaStar, FaCalendar, FaSearch,
  FaFilter, FaSort, FaChevronDown, FaGlobe, FaClock, 
  FaPlayCircle, FaChevronLeft, FaChevronRight, FaRegCalendarAlt,
  FaKey, FaCookie, FaDownload, FaServer, FaUserShield, FaSignInAlt,
  FaRegStar, FaRegBookmark, FaRegHeart, FaRegEye
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

// Memoized Service Card Component
const ServiceCard = memo(({ service, index }) => (
  <Link 
    to={`/generator/${service.id}`}
    className="group"
  >
    <motion.div
      variants={item}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300"
    >
      <div className="aspect-video relative">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white/90 text-sm line-clamp-3">
              {service.description}
            </p>
          </div>
        </div>
        {service.isCookie && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-md text-white text-xs font-medium">
              Cookie Required
            </span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="text-white font-semibold text-lg">{service.name}</h3>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
          <div className="flex items-center text-gray-400">
            {service.isCookie ? (
              <FaCookie className="w-4 h-4 mr-1" />
            ) : (
              <FaKey className="w-4 h-4 mr-1" />
            )}
            <span>{service.isCookie ? 'Cookie Auth' : 'Direct Login'}</span>
          </div>
          <span className="text-white px-3 py-1.5 bg-white/10 rounded-lg font-medium group-hover:bg-white/20 transition-colors">
            Access
          </span>
        </div>
      </div>
    </motion.div>
  </Link>
));

// Memoized Featured Slide Component
const FeaturedSlide = memo(({ service, navigate }) => (
  <motion.div
    key={service.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0"
  >
    <div className="relative h-full">
      <div className="absolute inset-0">
        <img
          src={service.imageUrl}
          alt={service.name}
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
              {service.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                {service.isCookie ? (
                  <FaCookie className="text-yellow-500 w-4 h-4 mr-1" />
                ) : (
                  <FaKey className="text-yellow-500 w-4 h-4 mr-1" />
                )}
                <span className="text-white font-bold">
                  {service.isCookie ? 'Cookie Auth' : 'Direct Login'}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegCalendarAlt className="text-gray-400 w-4 h-4 mr-1" />
                <span className="text-white/80">Premium Access</span>
              </div>
            </div>
            <p className="text-base text-white/90 line-clamp-3">
              {service.description}
            </p>
            <div className="flex items-center space-x-3">
              <Link
                to={`/generator/${service.id}`}
                className="inline-flex items-center px-6 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors space-x-2 text-sm"
              >
                <FaRandom className="w-3 h-3" />
                <span>Get Access</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
));

function Generator() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const servicesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const servicesQuery = query(collection(db, 'generator_services'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % services.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [services.length, loading]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'cookie' && service.isCookie) ||
                       (selectedType === 'regular' && !service.isCookie);
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return (a.isCookie === b.isCookie) ? 0 : a.isCookie ? -1 : 1;
      default:
        return 0;
    }
  });

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Slider */}
      {!searchQuery && services[currentSlide] && (
        <div className="relative h-[85vh]">
          <AnimatePresence mode="wait">
            <FeaturedSlide service={services[currentSlide]} navigate={navigate} />
          </AnimatePresence>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Enhanced Filter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Browse Services</h2>
              <p className="text-gray-400">Discover premium services</p>
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
                  placeholder="Search services..."
                  className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg border border-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Account Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="regular">Regular Accounts</option>
                <option value="cookie">Cookie Accounts</option>
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
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {currentServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Pagination */}
        {filteredServices.length > servicesPerPage && (
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

export default Generator;