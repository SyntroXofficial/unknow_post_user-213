import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaPlay, FaRandom, FaExclamationTriangle, FaDiscord } from 'react-icons/fa';

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

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black text-white overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black/50 to-black" />
        </div>
        
        <motion.div 
          className="relative z-10 w-full max-w-4xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        >
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-8 text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Premium Digital Services
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed px-4 md:px-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Access exclusive games, streaming services, and generate premium accounts all in one place!
          </motion.p>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/generator" className="group block p-6 md:p-8 bg-white text-black rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-white/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-black/10 rounded-full">
                    <FaRandom className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Account Generator</span>
                  <p className="text-black/90 text-sm">Generate premium accounts instantly</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/games" className="group block p-6 md:p-8 bg-white text-black rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-white/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-black/10 rounded-full">
                    <FaGamepad className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Game Library</span>
                  <p className="text-black/90 text-sm">Explore our vast collection of premium games</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/streaming" className="group block p-6 md:p-8 bg-white text-black rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-white/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-black/10 rounded-full">
                    <FaPlay className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Streaming Services</span>
                  <p className="text-black/90 text-sm">Watch your favorite movies and TV shows</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/important" className="group block p-6 md:p-8 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <FaExclamationTriangle className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Important Info</span>
                  <p className="text-white/90 text-sm">Read important guidelines and warnings</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Discord Button */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <a
              href="https://discord.gg/cFdRcKwvgx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 group shadow-lg shadow-blue-500/30"
            >
              <FaDiscord className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-lg font-semibold">Join Our Discord Server</span>
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
