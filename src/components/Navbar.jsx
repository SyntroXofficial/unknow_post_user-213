import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaHome, FaBars, FaChevronLeft, FaPlay, FaGamepad, FaExclamationTriangle, FaRandom } from 'react-icons/fa';

function Navbar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-lg md:hidden hover:bg-white/20 transition-all duration-300"
      >
        <FaBars className="w-6 h-6 text-white" />
      </button>

      {/* Minimal Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-16 bg-black/30 backdrop-blur-md border-r border-white/10 z-40 flex-col justify-between py-6 transition-all duration-500 hidden md:flex ${
        isOpen ? 'translate-x-[-64px]' : 'translate-x-0'
      }`}>
        {/* Top Section */}
        <div className="flex flex-col items-center space-y-8">
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <FaBars className="w-5 h-5 text-white" />
          </button>
          
          <Link to="/" className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
            <FaHome className="w-5 h-5" />
          </Link>

          <Link to="/generator" className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
            <FaRandom className="w-5 h-5" />
          </Link>

          <Link to="/streaming" className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
            <FaPlay className="w-5 h-5" />
          </Link>

          <Link to="/games" className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
            <FaGamepad className="w-5 h-5" />
          </Link>

          <Link to="/important" className="p-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300">
            <FaExclamationTriangle className="w-5 h-5" />
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center space-y-8">
          <a 
            href="https://discord.gg/cFdRcKwvgx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <FaDiscord className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Main Sidebar */}
      <nav 
        className={`fixed left-0 top-0 h-full w-full md:w-[280px] bg-black/30 backdrop-blur-md border-r border-white/10 z-40 transition-all duration-500 transform ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:translate-x-[-280px] opacity-0 md:opacity-100'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo with Toggle Button */}
          <div className="relative mt-8 mx-4">
            <div className="flex items-center text-white text-2xl md:text-3xl font-bold p-4 md:p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300">
              <span className="ml-12">AZCORP</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
            >
              <FaChevronLeft className="w-5 h-5 text-white group-hover:translate-x-[-2px] transition-transform" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 mt-8">
            <div className="space-y-3">
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 group"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </Link>
              <Link 
                to="/generator" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 group"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaRandom className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Generator</span>
              </Link>
              <Link 
                to="/streaming" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 group"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaPlay className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Streaming</span>
              </Link>
              <Link 
                to="/games" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 group"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaGamepad className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Game Library</span>
              </Link>
              <Link 
                to="/important" 
                className="flex items-center space-x-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-all duration-300 group"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaExclamationTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Important</span>
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-4">
            <a 
              href="https://discord.gg/cFdRcKwvgx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 group"
            >
              <FaDiscord className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Join Discord</span>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;