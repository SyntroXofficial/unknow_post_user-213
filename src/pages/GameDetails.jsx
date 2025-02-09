import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUser, FaKey, FaClock, FaGlobe, FaInfoCircle, FaCopy, 
  FaDownload, FaSteam, FaWindows, FaApple, FaLinux,
  FaGamepad, FaMemory, FaMicrochip, FaHdd, FaDesktop,
  FaCalendarAlt, FaStar, FaTrophy, FaUsers, FaCrown,
  FaCode, FaServer, FaShieldAlt, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaFlag
} from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReportDetailsModal from '../components/ReportDetailsModal';

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) {
        setError('Invalid game ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const gameRef = doc(db, 'games', id);
        const gameDoc = await getDoc(gameRef);
        
        if (gameDoc.exists()) {
          setGame({ id: gameDoc.id, ...gameDoc.data() });
          setError(null);
        } else {
          setError('Game not found');
          setTimeout(() => navigate('/games'), 3000);
        }
      } catch (error) {
        console.error('Error fetching game:', error);
        setError('Error loading game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, navigate]);

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
          <p className="text-white text-lg">Loading game details...</p>
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
            <p className="text-gray-400">Redirecting to games page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

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
            src={game.imageUrl}
            alt={game.game}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Game Info */}
        <motion.div 
          className="absolute inset-0 flex items-end pb-32"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="w-[800px] ml-16 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white">{game.game}</h1>
              <div className="flex items-center space-x-4">
                {game.features.map((feature, index) => (
                  <span key={index} className="text-white/70 flex items-center">
                    {feature.label === 'Rating' && <FaStar className="text-yellow-500 w-4 h-4 mr-1" />}
                    {feature.label === 'Release' && <FaCalendarAlt className="text-gray-400 w-4 h-4 mr-1" />}
                    {feature.value}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg text-white/90">{game.description}</p>

            {/* Game Access */}
            <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Game Access</h3>
                <div className="flex items-center space-x-2">
                  <FaWindows className="text-white/70 w-5 h-5" />
                  <FaSteam className="text-white/70 w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Username</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/30 text-white px-4 py-2 rounded font-mono">
                      {game.username}
                    </code>
                    <button
                      onClick={() => copyToClipboard(game.username)}
                      className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                    >
                      <FaCopy className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Password</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black/30 text-white px-4 py-2 rounded font-mono">
                      {game.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(game.password)}
                      className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                    >
                      <FaCopy className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </div>
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

      {/* Detailed Content */}
      <div className="px-16 py-12 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'requirements'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            System Requirements
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'instructions'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Instructions
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-3 gap-8">
          {activeTab === 'overview' && (
            <>
              {/* Game Features */}
              <div className="col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Game Features</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {game.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <FaGamepad className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">{feature.label}</p>
                          <p className="text-white font-medium">{feature.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Description */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">About This Game</h3>
                  <p className="text-gray-300 leading-relaxed">{game.description}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Platform</span>
                      <span className="text-white">Steam</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Region</span>
                      <span className="text-white">Global</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Account Type</span>
                      <span className="text-white">Full Access</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Online Status</span>
                      <span className="text-green-500 flex items-center">
                        <FaCheckCircle className="w-4 h-4 mr-1" />
                        Working
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Last Verified</span>
                      <span className="text-white">When Posted</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'requirements' && (
            <div className="col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">System Requirements</h3>
                <div className="grid grid-cols-2 gap-8">
                  {/* Minimum Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Minimum Requirements</h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <FaMicrochip className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">CPU</p>
                          <p className="text-white">{game.requirements.cpu}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaDesktop className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">GPU</p>
                          <p className="text-white">{game.requirements.gpu}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaMemory className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">RAM</p>
                          <p className="text-white">{game.requirements.ram}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaHdd className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">Storage</p>
                          <p className="text-white">{game.requirements.storage}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Additional Requirements</h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <FaGlobe className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">Internet</p>
                          <p className="text-white">Broadband Internet connection</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaSteam className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-400">Steam</p>
                          <p className="text-white">Latest version required</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="col-span-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Installation & Usage Instructions</h3>
                <div className="space-y-6">
                  {/* Installation Steps */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <FaDownload className="w-5 h-5 mr-2 text-purple-500" />
                      Installation Steps
                    </h4>
                    <ol className="space-y-4 text-gray-300">
                      <li className="flex items-start space-x-3">
                        <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">1</span>
                        <p>Open Steam and log out of any existing account</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">2</span>
                        <p>Log in using the provided username and password</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">3</span>
                        <p>Allow Steam to update if required</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">4</span>
                        <p>Install and play the game</p>
                      </li>
                    </ol>
                  </div>

                  {/* Important Notes */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <FaExclamationTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                      Important Notes
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start space-x-3">
                        <FaTimesCircle className="w-5 h-5 text-red-500 mt-1" />
                        <p>Do not change the account password</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaTimesCircle className="w-5 h-5 text-red-500 mt-1" />
                        <p>Do not enable Steam Guard or 2FA</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaTimesCircle className="w-5 h-5 text-red-500 mt-1" />
                        <p>Do not add any payment methods</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <p>Use offline mode when possible</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <p>Log out when finished playing</p>
                      </li>
                    </ul>
                  </div>

                  {/* Troubleshooting */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <FaQuestionCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Troubleshooting
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start space-x-3">
                        <FaInfoCircle className="w-5 h-5 text-blue-500 mt-1" />
                        <p>If the game doesn't start, verify game files through Steam</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaInfoCircle className="w-5 h-5 text-blue-500 mt-1" />
                        <p>For login issues, try clearing Steam credentials and restarting</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <FaInfoCircle className="w-5 h-5 text-blue-500 mt-1" />
                        <p>If account is locked, try another account or wait for an update</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Report Modal */}
      <ReportDetailsModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        itemName={game?.game}
        itemId={id}
        type="game"
      />
    </div>
  );
}

export default GameDetails;