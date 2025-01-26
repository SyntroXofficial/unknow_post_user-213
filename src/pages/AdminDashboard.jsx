import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUserShield, FaDiscord, FaEnvelope, FaKey, FaBan, FaClock, 
  FaExclamationTriangle, FaIdCard, FaUsers, FaUserClock,
  FaSearch, FaFilter, FaSort, FaMapMarkerAlt, FaGlobe,
  FaCalendarAlt, FaChartBar
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDuration, setBanDuration] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    newToday: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [realtimeStats, setRealtimeStats] = useState({
    activeNow: 0,
    lastHourLogins: 0,
    todayLogins: 0
  });

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminId === '724819305684937' && adminPassword === 'tRXV[1P5=O:9') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid admin credentials');
    }
  };

  useEffect(() => {
    const checkAdmin = () => {
      const user = auth.currentUser;
      if (!user || user.email !== 'andres_rios_xyz@outlook.com') {
        navigate('/');
      }
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const usersRef = collection(db, 'users');
    
    // Real-time updates for user status
    const unsubscribeStatus = onSnapshot(
      query(usersRef, where('lastActive', '>=', new Date(Date.now() - 5 * 60 * 1000))), // Consider users active if active in last 5 minutes
      (snapshot) => {
        const onlineUserIds = new Set(snapshot.docs.map(doc => doc.id));
        setOnlineUsers(onlineUserIds);
        setRealtimeStats(prev => ({
          ...prev,
          activeNow: onlineUserIds.size
        }));
      }
    );

    // Real-time updates for login statistics
    const now = new Date();
    const oneHourAgo = new Date(now - 3600000);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const unsubscribeLogins = onSnapshot(
      query(
        collection(db, 'userLogins'),
        where('timestamp', '>=', startOfDay)
      ),
      (snapshot) => {
        const logins = snapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));

        const lastHourLogins = logins.filter(login => 
          login.timestamp >= oneHourAgo
        ).length;

        const todayLogins = logins.length;

        setRealtimeStats(prev => ({
          ...prev,
          lastHourLogins,
          todayLogins
        }));
      }
    );

    // Update user stats periodically
    const updateStats = async () => {
      try {
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        const stats = {
          total: usersData.length,
          active: usersData.filter(user => !user.banned).length,
          banned: usersData.filter(user => user.banned).length,
          newToday: usersData.filter(user => {
            const createdAt = user.createdAt?.toDate?.() || new Date(user.createdAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return createdAt >= today;
          }).length
        };

        setUserStats(stats);
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    };

    // Update stats immediately and every minute
    updateStats();
    const statsInterval = setInterval(updateStats, 60000);

    return () => {
      unsubscribeStatus();
      unsubscribeLogins();
      clearInterval(statsInterval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        let q = query(usersRef);

        // Apply time range filter
        const now = new Date();
        let timeLimit;
        switch (selectedTimeRange) {
          case '24h':
            timeLimit = new Date(now - 24 * 60 * 60 * 1000);
            q = query(q, where('createdAt', '>=', timeLimit));
            break;
          case '7days':
            timeLimit = new Date(now - 7 * 24 * 60 * 60 * 1000);
            q = query(q, where('createdAt', '>=', timeLimit));
            break;
          case '30days':
            timeLimit = new Date(now - 30 * 24 * 60 * 60 * 1000);
            q = query(q, where('createdAt', '>=', timeLimit));
            break;
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
          case 'oldest':
            q = query(q, orderBy('createdAt', 'asc'));
            break;
          case 'username':
            q = query(q, orderBy('username'));
            break;
          case 'lastLogin':
            q = query(q, orderBy('lastLogin', 'desc'));
            break;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastLogin: doc.data().lastLogin?.toDate?.() || null,
            createdAt: doc.data().createdAt?.toDate?.() || null
          }));

          setUsers(usersData);

          // Apply search and status filters
          let filtered = usersData;
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
              user.username?.toLowerCase().includes(query) ||
              user.email?.toLowerCase().includes(query) ||
              user.discordId?.includes(query)
            );
          }

          if (filterStatus !== 'all') {
            filtered = filtered.filter(user =>
              filterStatus === 'banned' ? user.banned : !user.banned
            );
          }

          setFilteredUsers(filtered);

          // Update statistics
          const stats = {
            total: usersData.length,
            active: usersData.filter(user => !user.banned).length,
            banned: usersData.filter(user => user.banned).length,
            newToday: usersData.filter(user => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return user.createdAt >= today;
            }).length
          };

          setUserStats(stats);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, searchQuery, filterStatus, sortBy, selectedTimeRange]);

  const handleBanUser = async () => {
    if (!selectedUser || !banDuration) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const banEndDate = new Date();
      
      switch (banDuration) {
        case '1_day':
          banEndDate.setDate(banEndDate.getDate() + 1);
          break;
        case '7_days':
          banEndDate.setDate(banEndDate.getDate() + 7);
          break;
        case '30_days':
          banEndDate.setDate(banEndDate.getDate() + 30);
          break;
        case 'permanent':
          banEndDate.setFullYear(9999);
          break;
      }

      await updateDoc(userRef, {
        banned: true,
        banDuration,
        banDate: new Date().toISOString(),
        banEndDate: banEndDate.toISOString(),
        ipBanned: true
      });

      setShowBanModal(false);
      setSelectedUser(null);
      setBanDuration('');
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUserDetails(user);
    setShowUserDetailsModal(true);
  };

  const UserDetailsModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Username</p>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Discord ID</p>
                <p className="text-white">{user.discordId}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Status</p>
                <p className={user.banned ? "text-red-400" : "text-green-400"}>
                  {user.banned ? "Banned" : "Active"}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Activity Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Last Login</p>
                <p className="text-white">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Account Created</p>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Total Logins</p>
                <p className="text-white">{user.loginCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Last IP Address</p>
                <p className="text-white">{user.lastIpAddress || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Location Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Country</p>
                <p className="text-white">{user.lastCountry || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">City</p>
                <p className="text-white">{user.lastCity || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">ISP</p>
                <p className="text-white">{user.lastISP || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Time Zone</p>
                <p className="text-white">{user.lastTimeZone || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Device Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Browser</p>
                <p className="text-white">{user.lastBrowser || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Operating System</p>
                <p className="text-white">{user.lastOS || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Device Type</p>
                <p className="text-white">{user.lastDevice || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Screen Resolution</p>
                <p className="text-white">{user.lastResolution || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-32 px-8 pb-16 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 w-full max-w-md">
          <div className="flex items-center space-x-4 mb-6">
            <FaUserShield className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Admin Authentication</h1>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Admin ID</label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Enter admin ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">Admin Password</label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5" />
                <p className="text-red-500 text-sm">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Overview Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/10">
          <div className="flex items-center space-x-4 mb-8">
            <FaUserShield className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Real-time user monitoring and management</p>
            </div>
          </div>

          {/* Real-time Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <FaUsers className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-white">{userStats.total}</div>
              <div className="text-sm text-gray-400">
                +{userStats.newToday} today
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <FaUserClock className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Online Now</span>
              </div>
              <div className="text-2xl font-bold text-white">{realtimeStats.activeNow}</div>
              <div className="text-sm text-gray-400">
                {((realtimeStats.activeNow / userStats.total) * 100).toFixed(1)}% of total
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <FaCalendarAlt className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">Today's Logins</span>
              </div>
              <div className="text-2xl font-bold text-white">{realtimeStats.todayLogins}</div>
              <div className="text-sm text-gray-400">
                {realtimeStats.lastHourLogins} in last hour
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <FaBan className="w-5 h-5 text-red-400" />
                <span className="text-gray-400">Banned Users</span>
              </div>
              <div className="text-2xl font-bold text-white">{userStats.banned}</div>
              <div className="text-sm text-gray-400">
                {((userStats.banned / userStats.total) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="username">Username</option>
                  <option value="lastLogin">Last Login</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, email, or Discord ID..."
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="banned">Banned Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Username</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Discord ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-white/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FaDiscord className="text-[#5865F2]" />
                        <span className="text-white">{user.discordId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-white">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.banned ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-400 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-white">
                          {user.lastCountry || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          Details
                        </button>
                        {!user.banned && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanModal(true);
                            }}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-md w-full mx-4 border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <FaExclamationTriangle className="text-red-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Ban User</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-4">
                You are about to ban <span className="text-white font-semibold">{selectedUser.username}</span>.
                This action will prevent the user from accessing the platform.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ban Duration
                  </label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select duration...</option>
                    <option value="1_day">1 Day</option>
                    <option value="7_days">7 Days</option>
                    <option value="30_days">30 Days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && (
        <UserDetailsModal
          user={selectedUserDetails}
          onClose={() => setShowUserDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;