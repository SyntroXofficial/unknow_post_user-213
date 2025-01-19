import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaUser, FaHome, FaBars, FaChevronLeft, FaPlay, FaGamepad, FaTools, FaExclamationTriangle } from 'react-icons/fa';

function Navbar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-purple-500 rounded-lg md:hidden"
      >
        <FaBars className="w-6 h-6 text-white" />
      </button>

      {/* Minimal Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-16 bg-[#0a0a0a] border-r border-white/10 z-40 flex-col justify-between py-6 transition-all duration-300 hidden md:flex ${
        isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Top Section */}
        <div className="flex flex-col items-center space-y-8">
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 bg-[#0a0a0a] rounded-lg border border-purple-500/50 shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] transition-all duration-300"
          >
            <FaBars className="w-5 h-5 text-purple-500 hover:text-purple-400 transition-colors" />
          </button>
          
          <Link to="/" className="p-3 text-purple-500 hover:text-purple-400 transition-colors">
            <FaHome className="w-5 h-5" />
          </Link>

          <Link to="/premium" className="p-3 text-purple-500 hover:text-purple-400 transition-colors">
            <FaUser className="w-5 h-5" />
          </Link>

          <Link to="/games" className="p-3 text-purple-500 hover:text-purple-400 transition-colors">
            <FaGamepad className="w-5 h-5" />
          </Link>

          <Link to="/tools" className="p-3 text-purple-500 hover:text-purple-400 transition-colors">
            <FaTools className="w-5 h-5" />
          </Link>

          <Link to="/streaming" className="p-3 text-purple-500 hover:text-purple-400 transition-colors">
            <FaPlay className="w-5 h-5" />
          </Link>

          <Link to="/important" className="p-3 text-red-500 hover:text-red-400 transition-colors">
            <FaExclamationTriangle className="w-5 h-5" />
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center space-y-8">
          <a 
            href="https://discord.gg/cFdRcKwvgx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 text-purple-500 hover:text-purple-400 transition-colors"
          >
            <FaDiscord className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Main Sidebar */}
      <nav className={`fixed left-0 top-0 h-full w-full md:w-[240px] bg-[#0a0a0a] border-r border-white/10 z-40 transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo with Toggle Button */}
          <div className="relative mt-8 mx-2">
            <Link to="/" className="flex items-center text-purple-500 text-2xl md:text-3xl font-bold p-4 md:p-6 shadow-[0_0_8px_rgba(109,40,217,0.2)] border border-purple-500/50 rounded-lg">
              <span className="ml-12">AZCORP</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-[#0a0a0a] rounded-lg border border-purple-500/50 shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] transition-all duration-300"
            >
              <FaChevronLeft className="w-5 h-5 text-purple-500 hover:text-purple-400 transition-colors" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-2 mt-8">
            <div className="space-y-2">
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaHome className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/premium" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaUser className="w-5 h-5" />
                <span>Premium Accounts</span>
              </Link>
              <Link 
                to="/games" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaGamepad className="w-5 h-5" />
                <span>Game Library</span>
              </Link>
              <Link 
                to="/tools" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaTools className="w-5 h-5" />
                <span>Tools</span>
              </Link>
              <Link 
                to="/streaming" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaPlay className="w-5 h-5" />
                <span>Streaming</span>
              </Link>
              <Link 
                to="/important" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,0,0,0.3)] border border-red-500/50"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-500">Important</span>
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <a 
                href="https://discord.gg/cFdRcKwvgx" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.3)] border border-purple-500/50"
              >
                <FaDiscord className="w-5 h-5" />
                <span>Join Discord</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;