import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaInfoCircle, FaStar, FaDesktop, FaMemory, FaHdd, FaMicrochip } from 'react-icons/fa';
import { allGames } from '../data/gameAccounts';

function Games() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  
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

  return (
    <div className="min-h-screen bg-black">
      {/* Featured Game */}
      <div className="relative h-[85vh]">
        <div className="absolute inset-0">
          <img
            src={featuredGame.imageUrl}
            alt={featuredGame.game}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-32 px-12">
          <div className="max-w-2xl space-y-6">
            <div className="relative z-20">
              <h1 className="text-6xl font-bold text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] line-clamp-2">
                {featuredGame.game}
              </h1>
            </div>
            <p className="text-xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] line-clamp-2 relative z-20">
              {featuredGame.description}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedGame(featuredGame)}
                className="flex items-center px-12 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 text-xl font-semibold"
              >
                <FaGamepad className="mr-2" /> Play Now
              </button>
              <button
                onClick={() => setSelectedGame(featuredGame)}
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
                <span className="text-lg">{featuredGame.features.find(f => f.label === 'Genre')?.value}</span>
                <span className="text-lg">{featuredGame.features.find(f => f.label === 'Release')?.value}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-12 pb-16 space-y-12 bg-black">
        <section className="animate-fade-up">
          <h2 className="text-2xl font-bold text-white mb-4">Game Library</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {allGames.map((game) => (
              <motion.div 
                key={game.game}
                className="transform transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedGame(game)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative rounded-lg overflow-hidden bg-black shadow-lg border border-gray-800/50 group hover:shadow-[0_0_50px_rgba(109,40,217,0.4)] hover:border-purple-500/50 transition-all duration-300">
                  <img
                    src={game.imageUrl}
                    alt={game.game}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm mb-1 line-clamp-1">
                        {game.game}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-1">
                        <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                          <FaDesktop className="text-gray-400 w-2.5 h-2.5 mr-1" />
                          <span className="text-white text-xs">
                            {game.features.find(f => f.label === 'Platform')?.value}
                          </span>
                        </div>
                        <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                          <FaStar className="text-yellow-500 w-2.5 h-2.5 mr-1" />
                          <span className="text-white text-xs">
                            {game.features.find(f => f.label === 'Rating')?.value}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs line-clamp-2">
                        {game.description.split('\n')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Game Details Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGame(null)} />
          <div className="relative bg-[#0a0a0a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative aspect-video">
              <img
                src={selectedGame.imageUrl}
                alt={selectedGame.game}
                className="w-full h-full object-cover rounded-t-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedGame.game}</h2>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Description</h3>
                    <p className="text-gray-400 whitespace-pre-line">{selectedGame.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedGame.features.map((feature) => (
                        <div key={feature.label} className="flex items-center space-x-2">
                          <span className="text-gray-400">{feature.label}:</span>
                          <span className="text-white">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">System Requirements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FaMicrochip className="text-purple-500" />
                        <span className="text-gray-400">CPU:</span>
                        <span className="text-white">{selectedGame.requirements.cpu}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaDesktop className="text-purple-500" />
                        <span className="text-gray-400">GPU:</span>
                        <span className="text-white">{selectedGame.requirements.gpu}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaMemory className="text-purple-500" />
                        <span className="text-gray-400">RAM:</span>
                        <span className="text-white">{selectedGame.requirements.ram}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaHdd className="text-purple-500" />
                        <span className="text-gray-400">Storage:</span>
                        <span className="text-white">{selectedGame.requirements.storage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white font-mono bg-black/30 px-2 py-1 rounded">
                          {selectedGame.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Password:</span>
                        <span className="text-white font-mono bg-black/30 px-2 py-1 rounded">
                          {selectedGame.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Games;