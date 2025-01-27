import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaPlay, FaRandom, FaExclamationTriangle, FaArrowRight, FaSignInAlt, FaComments } from 'react-icons/fa';
import { auth } from '../firebase';

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
  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://media.discordapp.net/attachments/1193190985614757969/1332661685072433203/Screenshot_201468-enhanced.png?ex=67961169&is=6794bfe9&hm=44601f40e9bfc6e7d450510e568df24219bb77397f19ab6624c90ffe561c23b2&=&format=webp&quality=lossless&width=2345&height=1309"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
        </div>
        
        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4"
              >
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium inline-block">
                  WELCOME TO AZCORP
                </span>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Your Gateway to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    Premium Digital Services
                  </span>
                </h1>
                <p className="text-base lg:text-lg text-gray-400 max-w-xl">
                  Experience unlimited access to premium games, streaming services, and exclusive content. 
                  Join our community and unlock a world of digital entertainment.
                </p>

                {/* Important Information */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                  <h3 className="text-red-500 font-semibold flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Important Information
                  </h3>
                  <ul className="text-red-400 text-sm space-y-2">
                    <li>• Community posts are limited to 4 images url per minute for security scanning and anti scam</li>
                  </ul>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {!user && (
                  <>
                    <Link to="/login" className="group flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold">
                      Sign In
                      <FaSignInAlt className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link to="/signup" className="group flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold border border-white/20">
                      Create Account
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right Content - Feature Cards */}
            <motion.div 
              className="lg:w-1/2 grid grid-cols-2 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <Link to={user ? "/games" : "/login"} className="block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaGamepad className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Premium Games</h3>
                      <p className="text-sm text-gray-400">Access our vast collection of premium games</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to={user ? "/streaming" : "/login"} className="block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaPlay className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Streaming</h3>
                      <p className="text-sm text-gray-400">Watch your favorite content</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to={user ? "/generator" : "/login"} className="block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaRandom className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Generator</h3>
                      <p className="text-sm text-gray-400">Generate premium accounts</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to={user ? "/community" : "/login"} className="block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaComments className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Community</h3>
                      <p className="text-sm text-gray-400">Join our growing community</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/important" className="block p-6 bg-red-500/5 backdrop-blur-sm rounded-xl border border-red-500/10 hover:border-red-500/20 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Important</h3>
                      <p className="text-sm text-gray-400">Read our guidelines</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;