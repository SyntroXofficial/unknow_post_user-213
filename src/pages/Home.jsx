import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaGamepad, FaPlay } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0a0a] text-white overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-black/50 to-black" />
        </div>
        
        <motion.div 
          className="relative z-10 w-full max-w-4xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        >
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-8 text-purple-500"
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
            Access exclusive premium accounts, games, and streaming services all in one place, and much more!
          </motion.p>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-4 md:px-0"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-[280px]"
            >
              <Link to="/premium" className="group block p-6 md:p-8 bg-purple-500 rounded-2xl hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/10 rounded-full">
                    <FaUser className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Premium Accounts</span>
                  <p className="text-white/90 text-sm">Access exclusive premium accounts with unique features</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-[280px]"
            >
              <Link to="/games" className="group block p-6 md:p-8 bg-purple-500 rounded-2xl hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/10 rounded-full">
                    <FaGamepad className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Game Library</span>
                  <p className="text-white/90 text-sm">Explore our vast collection of premium games</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-[280px]"
            >
              <Link to="/streaming" className="group block p-6 md:p-8 bg-purple-500 rounded-2xl hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/10 rounded-full">
                    <FaPlay className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-semibold">Streaming Services</span>
                  <p className="text-white/90 text-sm">Watch your favorite movies and TV shows</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;