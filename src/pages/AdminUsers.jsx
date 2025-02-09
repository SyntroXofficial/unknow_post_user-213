import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaUsers, FaSearch, FaUserCircle, FaBan,
  FaUnlock, FaTrash, FaHistory, FaGlobe, FaMapMarkerAlt,
  FaNetworkWired, FaClock, FaCalendarAlt, FaUserCog,
  FaSignInAlt
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastActive');
  const [filterBanned, setFilterBanned] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminId === '724819305684937' && adminPassword === 'tRXV[1P5=O:9') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const usersQuery = query(collection(db, 'users'), orderBy('lastActive', 'desc'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filter out admin users
        .filter(user => user.email !== 'andres_rios_xyz@outlook.com');
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleBanUser = async (userId, currentBanStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: !currentBanStatus,
        banDate: currentBanStatus ? null : new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBanFilter = 
      filterBanned === 'all' ||
      (filterBanned === 'banned' && user.banned) ||
      (filterBanned === 'active' && !user.banned);

    return matchesSearch && matchesBanFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'lastActive':
        return new Date(b.lastActive) - new Date(a.lastActive);
      case 'username':
        return a.username?.localeCompare(b.username);
      case 'email':
        return a.email?.localeCompare(b.email);
      case 'loginCount':
        return (b.loginCount || 0) - (a.loginCount || 0);
      default:
        return 0;
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Admin Access</h2>
              <p className="mt-2 text-gray-400">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium block mb-2">Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                  placeholder="Enter admin ID"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium block mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-black rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaSignInAlt className="mr-2" />
                Access Dashboard
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Search Users</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, email, or ID..."
                className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg border border-white/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
            >
              <option value="lastActive">Last Active</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="loginCount">Login Count</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Filter Status</label>
            <select
              value={filterBanned}
              onChange={(e) => setFilterBanned(e.target.value)}
              className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="banned">Banned Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                  {user.profilePicUrl ? (
                    <img 
                      src={user.profilePicUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-purple-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{user.username}</h3>
                    {user.banned && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Banned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <p className="text-gray-500 text-xs">ID: {user.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBanUser(user.id, user.banned)}
                  className={`p-2 rounded-lg transition-colors ${
                    user.banned
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {user.banned ? <FaUnlock className="w-5 h-5" /> : <FaBan className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaClock className="w-4 h-4 mr-2" />
                  Last Active
                </div>
                <p className="text-white">
                  {new Date(user.lastActive?.toDate()).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaCalendarAlt className="w-4 h-4 mr-2" />
                  Joined
                </div>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaHistory className="w-4 h-4 mr-2" />
                  Login Count
                </div>
                <p className="text-white">{user.loginCount || 0}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaGlobe className="w-4 h-4 mr-2" />
                  Location
                </div>
                <p className="text-white">
                  {user.lastCountry || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  Last City
                </div>
                <p className="text-white">{user.lastCity || 'Unknown'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaNetworkWired className="w-4 h-4 mr-2" />
                  Last ISP
                </div>
                <p className="text-white">{user.lastISP || 'Unknown'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaUserCog className="w-4 h-4 mr-2" />
                  Last Browser
                </div>
                <p className="text-white">{user.lastBrowser || 'Unknown'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaGlobe className="w-4 h-4 mr-2" />
                  Last IP
                </div>
                <p className="text-white">{user.lastIpAddress || 'Unknown'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;