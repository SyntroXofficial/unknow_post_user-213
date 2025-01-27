import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPlay, FaGamepad, 
  FaExclamationTriangle, FaRandom, FaEyeSlash, FaEye,
  FaBars, FaTimes, FaArrowRight, FaUser, FaSignInAlt,
  FaUserShield, FaComments
} from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = auth.currentUser;
  const isAdmin = user?.email === 'andres_rios_xyz@outlook.com';

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsVisible(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const publicPages = ['/', '/important', '/login', '/signup'];
  if (!user && !publicPages.includes(location.pathname)) {
    navigate('/login');
  }

  return (
    <>
      {/* Control Buttons - Always visible */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-6 h-6 flex items-center justify-center bg-black/80 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          title={isVisible ? "Hide Navigation" : "Show Navigation"}
        >
          {isVisible ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 flex items-center justify-center bg-black/80 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          title={isSidebarOpen ? "Close Menu" : "Open Menu"}
        >
          {isSidebarOpen ? <FaTimes className="w-3.5 h-3.5" /> : <FaBars className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className={`fixed right-12 top-4 z-[9998] flex gap-2 bg-black/80 p-2 rounded-xl border border-white/10 shadow-lg transition-all duration-300 ${
        isVisible && !isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
      }`}>
        <Link 
          to="/" 
          className={`p-2 rounded-lg transition-all duration-300 group ${
            isActive('/') 
              ? 'bg-white text-black' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Home"
        >
          <FaHome className="w-4 h-4" />
        </Link>

        {user && (
          <>
            <Link 
              to="/generator" 
              className={`p-2 rounded-lg transition-all duration-300 group ${
                isActive('/generator') 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Generator"
            >
              <FaRandom className="w-4 h-4" />
            </Link>

            <Link 
              to="/streaming" 
              className={`p-2 rounded-lg transition-all duration-300 group ${
                isActive('/streaming') 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Streaming"
            >
              <FaPlay className="w-4 h-4" />
            </Link>

            <Link 
              to="/games" 
              className={`p-2 rounded-lg transition-all duration-300 group ${
                isActive('/games') 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Games"
            >
              <FaGamepad className="w-4 h-4" />
            </Link>

            <Link 
              to="/community" 
              className={`p-2 rounded-lg transition-all duration-300 group ${
                isActive('/community') 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Community"
            >
              <FaComments className="w-4 h-4" />
            </Link>
          </>
        )}

        <Link 
          to="/important" 
          className={`p-2 rounded-lg transition-all duration-300 group ${
            isActive('/important') 
              ? 'bg-red-500 text-white' 
              : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
          }`}
          title="Important"
        >
          <FaExclamationTriangle className="w-4 h-4" />
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className={`p-2 rounded-lg transition-all duration-300 group ${
              isActive('/admin')
                ? 'bg-purple-500 text-white'
                : 'text-purple-500/70 hover:text-purple-500 hover:bg-purple-500/10'
            }`}
            title="Admin Dashboard"
          >
            <FaUserShield className="w-4 h-4" />
          </Link>
        )}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              title="Account"
            >
              <FaUser className="w-4 h-4" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-94 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
                <div className="p-4 border-b border-white/10">
                  <p className="text-white font-medium truncate">{user.email}</p>
                  <p className="text-gray-400 text-sm">Logged in</p>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="w-full text-left px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center"
                  >
                    <FaUserShield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
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
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            title="Sign In"
          >
            <FaSignInAlt className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Mini Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-16 bg-black border-r border-white/10 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col items-center py-24 space-y-6">
          <Link 
            to="/"
            onClick={toggleSidebar}
            className={`p-3 rounded-lg transition-all duration-300 ${
              isActive('/') ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FaHome className="w-5 h-5" />
          </Link>

          {user && (
            <>
              <Link 
                to="/generator"
                onClick={toggleSidebar}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isActive('/generator') ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaRandom className="w-5 h-5" />
              </Link>

              <Link 
                to="/streaming"
                onClick={toggleSidebar}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isActive('/streaming') ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaPlay className="w-5 h-5" />
              </Link>

              <Link 
                to="/games"
                onClick={toggleSidebar}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isActive('/games') ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaGamepad className="w-5 h-5" />
              </Link>

              <Link 
                to="/community"
                onClick={toggleSidebar}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isActive('/community') ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaComments className="w-5 h-5" />
              </Link>
            </>
          )}

          <Link 
            to="/important"
            onClick={toggleSidebar}
            className={`p-3 rounded-lg transition-all duration-300 ${
              isActive('/important') ? 'bg-red-500 text-white' : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <FaExclamationTriangle className="w-5 h-5" />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={toggleSidebar}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isActive('/admin') ? 'bg-purple-500 text-white' : 'text-purple-500/70 hover:text-purple-500 hover:bg-purple-500/10'
              }`}
            >
              <FaUserShield className="w-5 h-5" />
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <FaSignInAlt className="w-5 h-5" />
            </button>
          ) : (
            <Link
              to="/login"
              onClick={toggleSidebar}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <FaSignInAlt className="w-5 h-5" />
            </Link>
          )}

          <button
            onClick={() => {
              setIsSidebarOpen(false);
              setIsVisible(true);
            }}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 mt-auto mb-8"
            title="Close Sidebar"
          >
            <FaArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;