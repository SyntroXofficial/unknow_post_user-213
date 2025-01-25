import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaDesktop, FaMemory, FaHdd, FaMicrochip, FaStar, FaCalendar, FaGlobe, FaUser, FaKey } from 'react-icons/fa';
import { allGames } from '../data/gameAccounts';

function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    const foundGame = allGames.find(g => g.game.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
    setGame(foundGame);
  }, [id]);

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-2xl">Loading game details...</div>
      </div>
    );
  }

  const ratingValue = game.features.find(f => f.label === 'Rating')?.value;
  const ratingMatch = {
    'M (Mature)': '90%',
    'T (Teen)': '85%',
    'E (Everyone)': '80%'
  }[ratingValue] || '85%';

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
            <div className="w-[500px] ml-16 space-y-6">
              <h1 className="text-5xl font-bold text-white">{game.game}</h1>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 w-4 h-4 mr-2" />
                  <span className="text-white font-bold">{ratingMatch} Match</span>
                </div>
                <span className="text-white/70">{game.features.find(f => f.label === 'Release')?.value}</span>
                <span className="px-2 py-1 border border-white/20 text-white/70 text-sm">
                  {game.features.find(f => f.label === 'Rating')?.value}
                </span>
                <span className="text-white/70">{game.features.find(f => f.label === 'Playtime')?.value}</span>
              </div>

              <p className="text-lg text-white/90">{game.description}</p>

              {/* Account Credentials */}
              <div className="space-y-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Account Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Username</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white bg-black/30 px-3 py-1.5 rounded text-sm font-mono">
                          {game.username}
                        </p>
                        <FaUser className="text-white/70 w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Password</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white bg-black/30 px-3 py-1.5 rounded text-sm font-mono">
                          {game.password}
                        </p>
                        <FaKey className="text-white/70 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </motion.div>
      </motion.div>

      {/* Game Details */}
      <div className="px-16 py-12 bg-[#0a0a0a] space-y-12">
        {/* System Requirements */}
        <motion.div 
          className="grid grid-cols-2 gap-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Requirements</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <FaMicrochip className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">CPU</p>
                  <p className="text-white">{game.requirements.cpu}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaDesktop className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">GPU</p>
                  <p className="text-white">{game.requirements.gpu}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaMemory className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">RAM</p>
                  <p className="text-white">{game.requirements.ram}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FaHdd className="text-white w-6 h-6" />
                <div>
                  <p className="text-gray-400">Storage</p>
                  <p className="text-white">{game.requirements.storage}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Game Features</h2>
            <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
              {game.description.split('\n').map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <FaStar className="text-yellow-500 w-4 h-4 flex-shrink-0" />
                  <span className="text-white">{feature.replace('• ', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          className="bg-white/5 rounded-xl p-6 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-6">
            {game.features.map((feature, index) => (
              <div key={index} className="space-y-1">
                <p className="text-gray-400">{feature.label}</p>
                <p className="text-white">{feature.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GameDetails;