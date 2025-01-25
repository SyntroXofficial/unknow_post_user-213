import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaShieldAlt, FaUserLock, FaGavel, FaGamepad, FaServer, FaLock, FaInfoCircle } from 'react-icons/fa';

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

function Important() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[50vh]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-16 px-12">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 text-xs font-medium">
                  IMPORTANT INFORMATION
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">Important Guidelines & Warnings</h1>
            </div>
            <p className="text-lg text-white/90 leading-relaxed max-w-xl">
              Please read these important guidelines and warnings carefully before using our services.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-12 pb-16">
        <motion.div 
          className="max-w-7xl mx-auto space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Account Usage Guidelines */}
          <motion.div variants={item} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-8 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaGamepad className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Usage Guidelines</h2>
                <p className="text-gray-400">Essential rules for using game accounts</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaServer className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">Always disable cloud save and remote play in steam settings</p>
                </div>
              </div>
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaLock className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">If disconnected, use offline mode or Big Picture mode Steam only</p>
                </div>
              </div>
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaUserLock className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">For guarded accounts, wait until unguarded or use a new account Steam only</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technical Limitations */}
          <motion.div variants={item} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-8 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaShieldAlt className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Technical Limitations</h2>
                <p className="text-gray-400">Known technical restrictions and limitations</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaInfoCircle className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">Rockstar, and EA games may have additional protections so we may not provider lots of stuff from dos services</p>
                </div>
              </div>
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaInfoCircle className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">Some games use Denuvo that may prevent access so try later to play or use an new account</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Security */}
          <motion.div variants={item} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-8 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaUserLock className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Account Security</h2>
                <p className="text-gray-400">Important security guidelines</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaLock className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">Never share account credentials with others</p>
                </div>
              </div>
              <div className="p-4 bg-black/50 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <FaLock className="w-5 h-5 text-red-400 mt-1" />
                  <p className="text-gray-300">Do not attempt to change account passwords or harm the accounts </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <motion.div variants={item} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-8 border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FaGavel className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Legal Disclaimer</h2>
                <p className="text-gray-400">Important legal information</p>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="p-4 bg-black/50 rounded-lg border border-white/10">
                We are not responsible for any issues that arise from not following the provided instructions. 
                Users are responsible for following all guidelines and using the service appropriately.
              </p>
              <p className="p-4 bg-black/50 rounded-lg border border-white/10">
                This website does not host, stream, or provide any movies, TV shows, or related content. 
                All media content accessible through this site is hosted by third-party platforms or services.
              </p>
              <p className="p-4 bg-black/50 rounded-lg border border-white/10">
                Please ensure you comply with all applicable laws and regulations when accessing or using external content.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Important;