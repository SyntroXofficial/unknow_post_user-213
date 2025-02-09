import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUserShield, FaUndo, FaSignInAlt, FaSearch,
  FaUsers, FaUserCheck, FaUserClock, FaGamepad,
  FaChartBar, FaDatabase, FaServer, FaCog,
  FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentLogins: 0,
    totalGames: 0,
    totalReports: 0
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

    const fetchData = async () => {
      try {
        // Users collection listener
        const usersQuery = query(collection(db, 'users'), orderBy('lastActive', 'desc'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
          const userData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const now = new Date();
          const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

          setStats({
            totalUsers: userData.length,
            activeUsers: userData.filter(user => !user.banned).length,
            recentLogins: userData.filter(user => {
              const lastLogin = user.lastLogin?.toDate();
              return lastLogin && lastLogin > oneDayAgo;
            }).length,
            totalGames: 0,
            totalReports: 0
          });

          setUsers(userData);
        });

        // Games collection listener
        const gamesQuery = query(collection(db, 'games'));
        const unsubscribeGames = onSnapshot(gamesQuery, (snapshot) => {
          setStats(prev => ({
            ...prev,
            totalGames: snapshot.size
          }));
        });

        // Reports collection listener
        const reportsQuery = query(collection(db, 'reports'));
        const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
          setStats(prev => ({
            ...prev,
            totalReports: snapshot.size
          }));
        });

        setLoading(false);

        return () => {
          unsubscribeUsers();
          unsubscribeGames();
          unsubscribeReports();
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleBanUser = async (userId, isBanned) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        banned: !isBanned,
        bannedAt: !isBanned ? Timestamp.now() : null
      });
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

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
    <div className="min-h-screen bg-black">
      <div className="pt-24 px-8 pb-16">
        {/* Admin Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaUserShield className="text-purple-500 w-6 h-6" />
            <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'overview'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'users'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Users
            </button>
            <Link
              to="/admin/games"
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Games Manager
            </Link>
            <button
              onClick={() => setActiveSection('reports')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'reports'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FaUsers className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <FaUserCheck className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Recent Logins (24h)</p>
                    <p className="text-3xl font-bold text-white">{stats.recentLogins}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FaUserClock className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Games</p>
                    <p className="text-3xl font-bold text-white">{stats.totalGames}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <FaGamepad className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-black/30 p-4 rounded-lg">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FaServer className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Server Status</p>
                    <p className="text-green-500 text-sm">Operational</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-black/30 p-4 rounded-lg">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FaDatabase className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Database Status</p>
                    <p className="text-blue-500 text-sm">Connected</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-black/30 p-4 rounded-lg">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FaCog className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">System Health</p>
                    <p className="text-purple-500 text-sm">Good</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <FaUserShield className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">Last active: {user.lastActive?.toDate().toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.banned ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm">
                          Banned
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-black/50 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="py-3 px-4 text-gray-400 font-medium">Username</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Last Active</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <FaUserShield className="w-4 h-4 text-purple-500" />
                          </div>
                          <span className="text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        {user.banned ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-sm">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {user.lastActive?.toDate().toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleBanUser(user.id, user.banned)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            user.banned
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                          }`}
                        >
                          {user.banned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6">Reports Management</h2>
            <div className="text-center text-gray-400 py-8">
              <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <p>Reports management is handled in the Community section</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;