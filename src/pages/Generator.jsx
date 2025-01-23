import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRandom, FaCopy, FaHistory, FaTrash, FaDownload, FaCheck, FaInfoCircle, 
  FaCookie, FaSearch, FaChartBar, FaUserShield, FaQuestionCircle,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaShieldAlt, 
  FaExclamationTriangle, FaFilter, FaChevronDown, FaSort, FaGlobe,
  FaKey, FaUser, FaLock, FaUnlock, FaSync, FaClipboard
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
  const [selectedService, setSelectedService] = useState(null);
  const [generatedAccounts, setGeneratedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Get available services (with stock > 0)
  const availableServices = Object.entries(accountLists)
    .filter(([_, service]) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || 
                         (filterType === 'cookie' && service.isCookie) ||
                         (filterType === 'regular' && !service.isCookie);
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

  const featuredService = availableServices[currentFeaturedIndex]?.[1];

  // Calculate statistics
  const stats = {
    totalAccounts: Object.values(accountLists).reduce((acc, service) => acc + service.inStock, 0),
    cookieAccounts: Object.values(accountLists).filter(service => service.isCookie).reduce((acc, service) => acc + service.inStock, 0),
    regularAccounts: Object.values(accountLists).filter(service => !service.isCookie).reduce((acc, service) => acc + service.inStock, 0),
    successRate: '98.5%',
    totalServices: Object.keys(accountLists).length,
    activeServices: availableServices.length
  };

  useEffect(() => {
    if (availableServices.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % availableServices.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [availableServices.length]);

  const generateAccount = () => {
    if (!selectedService) {
      setError('Please select a service first');
      return;
    }

    const service = accountLists[selectedService];
    if (service.accounts.length === 0) {
      setError('No accounts available for this service');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * service.accounts.length);
      const newAccount = service.accounts[randomIndex];
      const accountData = {
        id: Date.now(),
        service: selectedService,
        account: newAccount,
        timestamp: new Date(),
        serviceName: service.name,
        isCookie: service.isCookie,
        megaUrl: service.megaUrl
      };
      setGeneratedAccounts(prev => [accountData, ...prev].slice(0, 10));
      setLoading(false);

      if (service.isCookie) {
        window.open(service.megaUrl, '_blank');
      }
    }, 800);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setGeneratedAccounts([]);
  };

  const downloadHistory = () => {
    const content = generatedAccounts
      .map(item => {
        const accountInfo = `Service: ${item.serviceName}\nAccount: ${item.account}\nGenerated: ${item.timestamp.toLocaleString()}`;
        if (item.isCookie) {
          return `${accountInfo}\nType: Cookie Account\nDownload URL: ${item.megaUrl}\n`;
        }
        return `${accountInfo}\nType: Regular Account\n`;
      })
      .join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-accounts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderServiceCard = ([key, service]) => (
    <motion.div
      key={key}
      variants={item}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer group ${selectedService === key ? 'ring-2 ring-white' : ''}`}
      onClick={() => setSelectedService(key)}
    >
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-white/20">
        <div className="aspect-video relative">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white/90 text-sm line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>
          {/* Service Status Badge */}
          <div className="absolute top-3 right-3 flex space-x-2">
            {service.isCookie && (
              <span className="px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-md text-white text-xs font-medium">
                Cookie Required
              </span>
            )}
            <span className="px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-md text-white text-xs font-medium">
              {service.inStock} Available
            </span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="text-white font-semibold text-lg">{service.name}</h3>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
            <div className="flex items-center text-gray-400">
              <FaKey className="w-4 h-4 mr-1" />
              <span>{service.isCookie ? 'Cookie Auth' : 'Direct Login'}</span>
            </div>
            <span className="text-white px-3 py-1.5 bg-white/10 rounded-lg font-medium group-hover:bg-white/20 transition-colors">
              Select
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Tutorial = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl max-w-2xl w-full p-8 space-y-6 border border-white/20">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">How to Generate Accounts</h3>
          <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
            <FaTimesCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-black/50 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FaSearch className="w-5 h-5 mr-2" />
              1. Select a Service
            </h4>
            <p className="text-gray-300">Browse through available services and click on your desired option.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FaRandom className="w-5 h-5 mr-2" />
              2. Generate Account
            </h4>
            <p className="text-gray-300">Click the "Generate Account" button to create a new account.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FaCookie className="w-5 h-5 mr-2" />
              3. Cookie Accounts
            </h4>
            <p className="text-gray-300">For cookie-based services, you'll be redirected to download necessary files.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FaClipboard className="w-5 h-5 mr-2" />
              4. Account Management
            </h4>
            <p className="text-gray-300">Copy credentials, download history, or clear generated accounts as needed.</p>
          </div>
        </div>
        <button
          onClick={() => setShowTutorial(false)}
          className="w-full py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <FaCheck className="w-5 h-5" />
          <span>Got it!</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Section */}
      {featuredService && (
        <div className="relative h-[85vh]">
          <div className="absolute inset-0">
            <img
              src={featuredService.imageUrl}
              alt={featuredService.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 opacity-60" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-32 px-12">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
                    FEATURED SERVICE
                  </span>
                  {featuredService.isCookie && (
                    <span className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 backdrop-blur-sm rounded-full text-yellow-400 text-xs font-medium">
                      <FaCookie className="w-3 h-3" />
                      <span>Cookie Required</span>
                    </span>
                  )}
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight">
                  {featuredService.name}
                </h1>
              </div>
              <p className="text-lg text-white/90 leading-relaxed max-w-xl">
                {featuredService.description}
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedService(availableServices[currentFeaturedIndex][0]);
                    generateAccount();
                  }}
                  className="flex items-center px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 text-lg font-semibold group"
                >
                  <FaRandom className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Generate Account
                </button>
                <button
                  onClick={() => setSelectedService(availableServices[currentFeaturedIndex][0])}
                  className="flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-lg font-semibold border border-white/20 group"
                >
                  <FaInfoCircle className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  More Info
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                  <span className="text-green-400 font-semibold">{featuredService.inStock}</span>
                  <span className="text-white/80">accounts available</span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-sm">Active Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 px-12 pb-16">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section with Stats */}
          <motion.div 
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/20"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">Account Generator</h1>
                <p className="text-gray-400">Generate premium accounts from our stock</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <FaQuestionCircle className="mr-2" />
                  How it works
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <FaFilter className="mr-2" />
                  <span>Filters</span>
                  <FaChevronDown className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
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
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
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

            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-white mb-2">
                    <FaChartBar className="mr-2" />
                    <span className="font-semibold">Total Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-white mb-2">
                    <FaCookie className="mr-2" />
                    <span className="font-semibold">Cookie Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.cookieAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-white mb-2">
                    <FaUserShield className="mr-2" />
                    <span className="font-semibold">Regular Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.regularAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-green-400 mb-2">
                    <FaCheckCircle className="mr-2" />
                    <span className="font-semibold">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.successRate}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-white mb-2">
                    <FaRandom className="mr-2" />
                    <span className="font-semibold">Total Services</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-white/20">
                  <div className="flex items-center text-green-400 mb-2">
                    <FaCheck className="mr-2" />
                    <span className="font-semibold">Active Services</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.activeServices}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Generator Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Generate Account</h2>
                  {selectedService && (
                    <span className="text-gray-400">
                      {accountLists[selectedService].name} Selected
                    </span>
                  )}
                </div>

                {selectedService ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-bold">
                          {accountLists[selectedService].name}
                        </h3>
                        {accountLists[selectedService].isCookie && (
                          <div className="flex items-center text-yellow-400">
                            <FaCookie className="mr-1" />
                            <span className="text-sm">Cookie Account</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {accountLists[selectedService].description}
                      </p>
                      <div className="mt-2 flex items-center text-green-400 text-sm">
                        <FaInfoCircle className="mr-2" />
                        {accountLists[selectedService].inStock} accounts available
                      </div>
                      {accountLists[selectedService].isCookie && (
                        <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                          <p className="text-yellow-400 text-sm">
                            This service requires cookies. You'll be redirected to download them after generation.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={generateAccount}
                      disabled={loading}
                      className="w-full py-4 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FaRandom className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Generate Account</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaRandom className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Select a service to generate an account</p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Generated Accounts</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadHistory}
                      disabled={generatedAccounts.length === 0}
                      className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download History"
                    >
                      <FaDownload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={clearHistory}
                      disabled={generatedAccounts.length === 0}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Clear History"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {generatedAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <FaHistory className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No accounts generated yet</p>
                    </div>
                  ) : (
                    generatedAccounts.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/50 p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-white font-bold">
                              {item.serviceName}
                            </span>
                            {item.isCookie && (
                              <FaCookie className="ml-2 text-yellow-400" title="Cookie Account" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.isCookie && (
                              <a
                                href={item.megaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Download Cookies"
                              >
                                <FaDownload className="w-5 h-5" />
                              </a>
                            )}
                            <button
                              onClick={() => copyToClipboard(item.account)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="Copy to Clipboard"
                            >
                              <FaCopy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-white font- mono break-all mb-2">
                          {item.account}
                        </p>
                        <div className="flex items-center text-gray-400">
                          <FaClock className="mr-1 w-3 h-3" />
                          <span>Generated: {item.timestamp.toLocaleString()}</span>
                        </div>
                        {item.isCookie && (
                          <div className="mt-2 text-yellow-400 text-sm flex items-center">
                            <FaInfoCircle className="mr-1" />
                            Cookie account - Download required
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          <motion.div 
            className="mt-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Available Services</h2>
              <p className="text-gray-400">
                {availableServices.length} {availableServices.length === 1 ? 'service' : 'services'} available
              </p>
            </div>
            {availableServices.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {availableServices.map(renderServiceCard)}
              </div>
            )}
          </motion.div>

          {/* Security Guidelines */}
          <div className="mt-16 p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20">
            <div className="flex items-center text-yellow-400 mb-4">
              <FaShieldAlt className="mr-2" />
              <span className="font-semibold text-lg">Security Guidelines</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="text-yellow-400 mt-1" />
                <p className="text-gray-300 text-sm">Never share account credentials with others</p>
              </div>
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="text-yellow-400 mt-1" />
                <p className="text-gray-300 text-sm">Don't attempt to change account passwords</p>
              </div>
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="text-yellow-400 mt-1" />
                <p className="text-gray-300 text-sm">Report any issues immediately</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copy Notification */}
      <div
        className={`fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg transform transition-all duration-300 ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        Copied to clipboard!
      </div>

      {/* Tutorial Modal */}
      {showTutorial && <Tutorial />}
    </div>
  );
}

export default Generator;