import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, FaPlay, FaGamepad, FaRandom,
  FaUserShield, FaComments, FaSignInAlt, FaUser,
  FaBars, FaTimes, FaChevronRight, FaExclamationTriangle
} from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = auth.currentUser;
  const isAdmin = user?.email === 'andres_rios_xyz@outlook.com';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    ...(user ? [
      { path: '/streaming', icon: FaPlay, label: 'Streaming' },
      { path: '/games', icon: FaGamepad, label: 'Games' },
      { path: '/generator', icon: FaRandom, label: 'Generator' },
      { path: '/community', icon: FaComments, label: 'Community' },
      { path: '/important', icon: FaExclamationTriangle, label: 'Important', highlight: true },
    ] : []),
    ...(isAdmin ? [{ path: '/admin', icon: FaUserShield, label: 'Admin' }] : [])
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://i.pinimg.com/736x/8f/d4/0e/8fd40ebc6be2d34f2de430a70420c236.jpg"
                alt="Logo"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white font-bold text-xl">AZCORP</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-white text-black'
                      : item.highlight
                      ? 'text-red-500 hover:bg-red-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  } flex items-center space-x-2`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <FaUser className="w-5 h-5" />
                    )}
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-white font-medium truncate">{user.email}</p>
                        <p className="text-gray-400 text-sm">Logged in</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center"
                      >
                        <FaSignInAlt className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
              >
                {isOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 right-0 w-64 bg-black/95 backdrop-blur-md z-40 md:hidden border-l border-white/10"
      >
        <div className="p-4 space-y-4">
          {/* Mobile Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-white text-black'
                  : item.highlight
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              <FaChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          ))}

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute bottom-8 left-4 right-4 flex items-center justify-center space-x-2 bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300"
          >
            <FaTimes className="w-4 h-4" />
            <span>Close Menu</span>
          </button>
        </div>
      </motion.div>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
}

export default Navbar;