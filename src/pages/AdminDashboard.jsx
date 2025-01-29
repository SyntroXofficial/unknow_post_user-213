import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUserShield, FaBan, FaUndo, FaSignInAlt, FaSearch,
  FaUsers, FaUserSlash, FaUserCheck, FaUserClock
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    bannedUsers: 0,
    activeUsers: 0,
    recentLogins: 0
  });

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

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

      setStats({
        totalUsers: userData.length,
        bannedUsers: userData.filter(user => user.banned).length,
        activeUsers: userData.filter(user => !user.banned).length,
        recentLogins: userData.filter(user => {
          const lastLogin = user.lastLogin?.toDate();
          return lastLogin && lastLogin > oneDayAgo;
        }).length
      });

      setUsers(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleBanUser = async (userId, currentBanStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: !currentBanStatus,
        banDate: !currentBanStatus ? Timestamp.now() : null
      });
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
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
              <FaUserShield className="w-12 h-12 text-white mx-auto mb-4" />
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

  return (
    <div className="min-h-screen bg-black pt-32 px-8 pb-16">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <FaUserCheck className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Banned Users</p>
              <p className="text-3xl font-bold text-white">{stats.bannedUsers}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <FaUserSlash className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Recent Logins (24h)</p>
              <p className="text-3xl font-bold text-white">{stats.recentLogins}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <FaUserClock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, or document ID..."
            className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Document ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-mono text-sm">{user.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.banned 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleBanUser(user.id, user.banned)}
                      className={`transition-colors ${
                        user.banned 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-red-400 hover:text-red-300'
                      }`}
                      title={user.banned ? 'Unban User' : 'Ban User'}
                    >
                      {user.banned ? <FaUndo className="w-5 h-5" /> : <FaBan className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
