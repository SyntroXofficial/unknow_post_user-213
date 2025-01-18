import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaDiscord, FaUser, FaCaretDown } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0a0a]' : 'bg-gradient-to-b from-[#0a0a0a] to-transparent'}`}>
      <div className="max-w-[2000px] mx-auto px-16">
        <div className="flex items-center justify-between h-[68px]">
          <Link to="/" className="text-purple-500 text-4xl font-bold">AZCORP</Link>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <form onSubmit={handleSearch} className={`${showSearch ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#0a0a0a] border border-purple-500/50 text-white px-4 py-2 rounded-full placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </form>
              <button 
                onClick={() => setShowSearch(!showSearch)} 
                className="text-white hover:text-purple-500 transition absolute right-2 top-1/2 -translate-y-1/2"
              >
                <FaSearch className="w-5 h-5" />
              </button>
            </div>
            <a 
              href="https://discord.gg/cFdRcKwvgx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:text-purple-500 transition"
            >
              <FaDiscord className="w-6 h-6" />
            </a>
            <button className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <FaUser className="w-5 h-5 text-white" />
              </div>
              <FaCaretDown className="text-white group-hover:rotate-180 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;