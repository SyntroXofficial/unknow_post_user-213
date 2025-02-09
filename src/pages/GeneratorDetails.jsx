import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUser, FaKey, FaClock, FaGlobe, FaInfoCircle, FaCopy, 
  FaDownload, FaCookie, FaDesktop, FaChrome, FaNetworkWired,
  FaHdd, FaShieldAlt, FaExclamationTriangle, FaCheckCircle,
  FaTimesCircle, FaQuestionCircle, FaStar, FaUsers, FaTrophy,
  FaAward, FaRegLightbulb, FaRegStar, FaRegBookmark, FaFlag
} from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReportDetailsModal from '../components/ReportDetailsModal';

function GeneratorDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setError('Invalid service ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const serviceRef = doc(db, 'generator_services', id);
        const serviceDoc = await getDoc(serviceRef);
        
        if (serviceDoc.exists()) {
          const serviceData = { id: serviceDoc.id, ...serviceDoc.data() };
          
          // Ensure features array exists
          if (!serviceData.features) {
            serviceData.features = [
              { label: 'Type', value: serviceData.isCookie ? 'Cookie Auth' : 'Direct Login' },
              { label: 'Duration', value: 'Unlimited' },
              { label: 'Region', value: 'Global' },
              { label: 'Quality', value: 'Premium' }
            ];
          }

          // Ensure requirements object exists
          if (!serviceData.requirements) {
            serviceData.requirements = {
              device: 'Any modern device',
              browser: 'Chrome, Firefox, or Edge',
              connection: 'Stable internet connection',
              storage: 'No additional storage required'
            };
          }
          
          setService(serviceData);
          
          // Set mock ratings and trivia
          setRatings({
            average: 4.5,
            popularity: 1000,
            voteCount: 500,
            successRate: 95
          });

          setTrivia([
            "Service has been active for over 2 years",
            "Used by thousands of satisfied users",
            "Regular updates and maintenance",
            "High success rate with minimal issues"
          ]);

          setError(null);
        } else {
          setError('Service not found');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('Error loading service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
            <p className="text-gray-400">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[100vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Service Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-[800px] ml-16 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white">{service.name}</h1>
              <div className="flex items-center space-x-4">
                {service.features.map((feature, index) => (
                  <span key={index} className="text-white/70 flex items-center">
                    {feature.label === 'Type' && <FaKey className="text-yellow-500 w-4 h-4 mr-1" />}
                    {feature.label === 'Duration' && <FaClock className="text-gray-400 w-4 h-4 mr-1" />}
                    {feature.value}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg text-white/90">{service.description}</p>

            {/* Service Access */}
            <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white">Service Access</h3>
              <p className="text-white/90">
                {service.isCookie
                  ? "Click on the 'Download Cookie' button to access the required cookie files."
                  : "Click on 'Get Account' to receive your link to MEGA file and pate it intro an new browser tab."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {service.isCookie && service.megaUrl ? (
                  <a
                    href={service.megaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-2.5 bg- center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
                  >
                    <FaDownload className="mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                    Download Cookie
                  </a>
                ) : (
                  <button
                    onClick={() => copyToClipboard(service.accounts[Math.floor(Math.random() * service.accounts.length)])}
                    className="flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-base font-semibold group w-full"
                  >
                    <FaKey className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Get Account
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-yellow-500">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <p className="text-sm">Having issues? Report them to our staff</p>
                </div>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <FaFlag className="w-4 h-4" />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Content Sections */}
      <div className="px-16 py-12 space-y-8 max-w-7xl mx-auto">
        {/* Requirements Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaDesktop className="text-purple-500" />
            System Requirements
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FaDesktop className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Device Requirements</h3>
                  <p className="text-gray-400">{service.requirements.device}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FaChrome className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Browser Requirements</h3>
                  <p className="text-gray-400">{service.requirements.browser}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FaNetworkWired className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Connection Requirements</h3>
                  <p className="text-gray-400">{service.requirements.connection}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <FaHdd className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Storage Requirements</h3>
                  <p className="text-gray-400">{service.requirements.storage}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Usage Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FaInfoCircle className="text-blue-500" />
            Usage Instructions
          </h2>

          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-green-500" />
                Important Guidelines
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Log out after each session</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Use the service responsibly</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaTimesCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>Do not change account passwords</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaTimesCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <span>Do not share account credentials</span>
                </li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaQuestionCircle className="text-blue-500" />
                Troubleshooting
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <span>Clear browser cache if experiencing issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <span>Try a different browser if service is not working</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <span>Check your internet connection</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Service Stats */}
        {ratings && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaRegStar className="text-yellow-500" />
              Service Statistics
            </h2>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <FaStar className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.average.toFixed(1)}</p>
                    <p className="text-gray-400">Average Rating</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <FaUsers className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.voteCount.toLocaleString()}</p>
                    <p className="text-gray-400">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <FaTrophy className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.successRate}%</p>
                    <p className="text-gray-400">Success Rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <FaAward className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{ratings.popularity.toLocaleString()}</p>
                    <p className="text-gray-400">Popularity Score</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Service Trivia */}
        {trivia && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaRegLightbulb className="text-blue-500" />
              Service Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {trivia.map((fact, index) => (
                <div 
                  key={index}
                  className="bg-black/30 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full h-min">
                      <FaRegBookmark className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-white">{fact}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Copy Notification */}
      <div
        className={`fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg transform transition-all duration-300 ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        Copied to clipboard!
      </div>

      {/* Report Modal */}
      <ReportDetailsModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        itemName={service?.name}
        itemId={id}
        type="service"
      />
    </div>
  );
}

export default GeneratorDetails;