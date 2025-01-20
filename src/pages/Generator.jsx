import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaRandom, FaCopy, FaHistory, FaTrash, FaDownload, FaCheck, FaInfoCircle, 
  FaCookie, FaFilter, FaSearch, FaChartBar, FaUserShield, FaQuestionCircle,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { accountLists } from '../data/generatorAccounts';

function Generator() {
  const [selectedService, setSelectedService] = useState(null);
  const [generatedAccounts, setGeneratedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Get available services (with stock > 0)
  const availableServices = Object.entries(accountLists).filter(([_, service]) => service.inStock > 0);
  const featuredService = availableServices[currentFeaturedIndex]?.[1];

  // Calculate statistics
  const stats = {
    totalAccounts: Object.values(accountLists).reduce((acc, service) => acc + service.inStock, 0),
    cookieAccounts: Object.values(accountLists).filter(service => service.isCookie).reduce((acc, service) => acc + service.inStock, 0),
    regularAccounts: Object.values(accountLists).filter(service => !service.isCookie).reduce((acc, service) => acc + service.inStock, 0),
    successRate: '98.5%', // Example static value
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

  const filteredServices = Object.entries(accountLists).filter(([key, service]) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'cookie' && service.isCookie) || 
      (filterType === 'regular' && !service.isCookie);
    return matchesSearch && matchesFilter;
  });

  const Tutorial = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] rounded-xl max-w-2xl w-full p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">How to Generate Accounts</h3>
          <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
            <FaTimesCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
            <h4 className="text-lg font-semibold text-white mb-2">1. Select a Service</h4>
            <p className="text-gray-300">Browse through available services and click on your desired option.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
            <h4 className="text-lg font-semibold text-white mb-2">2. Generate Account</h4>
            <p className="text-gray-300">Click the "Generate Account" button to create a new account.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
            <h4 className="text-lg font-semibold text-white mb-2">3. Cookie Accounts</h4>
            <p className="text-gray-300">For cookie-based services, you'll be redirected to download necessary files.</p>
          </div>
          <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
            <h4 className="text-lg font-semibold text-white mb-2">4. Account Management</h4>
            <p className="text-gray-300">Copy credentials, download history, or clear generated accounts as needed.</p>
          </div>
        </div>
        <button
          onClick={() => setShowTutorial(false)}
          className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Service */}
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
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-32 px-12">
            <div className="max-w-2xl space-y-6">
              <div className="relative z-20">
                <h1 className="text-6xl font-bold text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] line-clamp-2">
                  {featuredService.name}
                </h1>
              </div>
              <p className="text-xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] line-clamp-2 relative z-20">
                {featuredService.description}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedService(availableServices[currentFeaturedIndex][0]);
                    generateAccount();
                  }}
                  className="flex items-center px-12 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
                >
                  <FaRandom className="mr-2" /> Generate Account
                </button>
                <button
                  onClick={() => setSelectedService(availableServices[currentFeaturedIndex][0])}
                  className="flex items-center px-12 py-4 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
                >
                  <FaInfoCircle className="mr-2" /> More Info
                </button>
              </div>
              <div className="flex items-center space-x-6">
                <div className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg">
                  FEATURED
                </div>
                <div className="flex items-center space-x-4 px-6 py-2 bg-black/50 backdrop-blur-sm text-white font-bold rounded-lg">
                  <span className="text-lg">{featuredService.inStock} in stock</span>
                  {featuredService.isCookie && (
                    <span className="flex items-center text-lg">
                      <FaCookie className="mr-2" />
                      Cookie Account
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the Generator content */}
      <div className="relative z-10 px-12 pt-8 pb-4 flex items-center space-x-4">
        {/* Media Type Dropdown */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#111] border border-purple-500/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 w-48"
        >
          <option value="all">All Types</option>
          <option value="cookie">Cookie Accounts</option>
          <option value="regular">Regular Accounts</option>
        </select>

        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-[#111] border border-purple-500/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="relative z-10 px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Stats */}
          <div className="bg-gradient-to-r from-purple-500/20 to-transparent p-8 rounded-2xl mb-8 border border-purple-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">Account Generator</h1>
                <p className="text-gray-400">Generate premium accounts from our stock</p>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center px-4 py-2 bg-purple-500/20 text-white rounded-lg hover:bg-purple-500/30 transition-all duration-300"
              >
                <FaQuestionCircle className="mr-2" />
                How it works
              </button>
            </div>

            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-purple-400 mb-2">
                    <FaChartBar className="mr-2" />
                    <span className="font-semibold">Total Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-purple-400 mb-2">
                    <FaCookie className="mr-2" />
                    <span className="font-semibold">Cookie Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.cookieAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-purple-400 mb-2">
                    <FaUserShield className="mr-2" />
                    <span className="font-semibold">Regular Accounts</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.regularAccounts}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-green-400 mb-2">
                    <FaCheckCircle className="mr-2" />
                    <span className="font-semibold">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.successRate}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-purple-400 mb-2">
                    <FaRandom className="mr-2" />
                    <span className="font-semibold">Total Services</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-green-400 mb-2">
                    <FaCheck className="mr-2" />
                    <span className="font-semibold">Active Services</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.activeServices}</p>
                </div>
              </div>
            )}

            {/* Security Tips */}
            <div className="mt-6 p-4 bg-black/50 rounded-lg border border-purple-500/10">
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
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generator Section */}
            <div className="space-y-6">
              <div className="bg-[#111] rounded-xl p-6 border border-purple-500/20">
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
                    <div className="p-4 bg-black/50 rounded-lg border border-purple-500/10">
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
                      className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FaRandom className="w-5 h-5" />
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
              <div className="bg-[#111] rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Generated Accounts</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadHistory}
                      disabled={generatedAccounts.length === 0}
                      className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Download History"
                    >
                      <FaDownload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={clearHistory}
                      disabled={generatedAccounts.length === 0}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
                        className="bg-black/50 p-4 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-purple-500 font-bold">
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
                        <p className="text-white font-mono break-all mb-2">
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
          </div>

          {/* Services Grid */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Available Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredServices.map(([key, service]) => (
                <motion.div
                  key={key}
                  className={`cursor-pointer group ${
                    selectedService === key ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedService(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative rounded-xl overflow-hidden bg-[#111] border border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold">{service.name}</h3>
                        {service.isCookie && (
                          <FaCookie className="text-yellow-400" title="Cookie Account" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${service.inStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {service.inStock > 0 ? `${service.inStock} in stock` : 'Out of stock'}
                        </span>
                        {selectedService === key && (
                          <FaCheck className="text-purple-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
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