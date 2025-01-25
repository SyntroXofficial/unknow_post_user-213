import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRandom, FaInfoCircle, FaStar, FaCalendar, FaClock,
  FaFilter, FaSort, FaSearch, FaGlobe, FaUserClock, FaChevronDown,
  FaCookie, FaKey
} from 'react-icons/fa';
import { accountLists } from '../data/generatorAccounts';

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

function Generator() {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const availableServices = Object.entries(accountLists)
    .filter(([_, service]) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'cookie' && service.isCookie) ||
                         (selectedType === 'regular' && !service.isCookie);
      return service.inStock > 0 && matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a[1].name.localeCompare(b[1].name);
        case 'stock':
          return b[1].inStock - a[1].inStock;
        case 'type':
          return (a[1].isCookie === b[1].isCookie) ? 0 : a[1].isCookie ? -1 : 1;
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (availableServices.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % availableServices.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [availableServices.length]);

  const featuredService = availableServices[currentFeaturedIndex]?.[1];
  const featuredServiceKey = availableServices[currentFeaturedIndex]?.[0];

  const renderServiceCard = ([key, service]) => (
    <motion.div
      key={key}
      variants={item}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link to={`/generator/${key}`}>
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-white/20">
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
            {/* Service Status Badge */}
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
                <FaKey className="w-4 h-4 mr-1" />
                <span>{service.isCookie ? 'Cookie Auth' : 'Direct Login'}</span>
              </div>
              <span className="text-white px-3 py-1.5 bg-white/10 rounded-lg font-medium group-hover:bg-white/20 transition-colors">
                Access
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Section */}
      {featuredService && (
        <div className="relative h-[90vh]">
          <div className="absolute inset-0">
            <div className="relative w-full h-full">
              <img
                src={featuredService.imageUrl}
                alt={featuredService.name}
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
                {featuredService.name}
              </h1>
              <p className="text-base text-white/90 leading-relaxed max-w-xl line-clamp-2">
                {featuredService.description}
              </p>
              <div className="flex items-center space-x-3">
                <Link
                  to={`/generator/${featuredServiceKey}`}
                  className="flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold group"
                >
                  <FaRandom className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Get Access
                </Link>
                <Link
                  to={`/generator/${featuredServiceKey}`}
                  className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20 group"
                >
                  <FaInfoCircle className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <h2 className="text-2xl font-bold text-white">Available Services</h2>
                <p className="text-gray-400">
                  {availableServices.length} {availableServices.length === 1 ? 'service' : 'services'} available
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Search Services</label>
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
                      <label className="text-gray-400 text-sm">Account Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
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
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                      >
                        <option value="name">Name</option>
                        <option value="stock">Available Stock</option>
                        <option value="type">Account Type</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Services Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {availableServices.map(renderServiceCard)}
          </motion.div>

          {/* No Results Message */}
          {availableServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No services found</h3>
              <p className="text-gray-400">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default Generator;