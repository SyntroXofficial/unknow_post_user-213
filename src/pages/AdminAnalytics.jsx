import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaChartBar, FaUsers, FaUserCheck,
  FaCalendarAlt, FaGlobe, FaDesktop, FaBrowser,
  FaClock, FaMapMarkerAlt, FaNetworkWired, FaSignInAlt
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

function AdminAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    dailyLogins: 0,
    weeklyLogins: 0,
    monthlyLogins: 0,
    countries: {},
    browsers: {},
    devices: {},
    cities: {},
    isps: {}
  });
  const [loading, setLoading] = useState(true);
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

    const fetchStats = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;

        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const activeUsersQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', Timestamp.fromDate(oneDayAgo))
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);
        const activeUsers = activeUsersSnapshot.size;

        const dailyLoginsQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', Timestamp.fromDate(oneDayAgo))
        );
        const dailyLoginsSnapshot = await getDocs(dailyLoginsQuery);
        const dailyLogins = dailyLoginsSnapshot.size;

        const weeklyLoginsQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', Timestamp.fromDate(oneWeekAgo))
        );
        const weeklyLoginsSnapshot = await getDocs(weeklyLoginsQuery);
        const weeklyLogins = weeklyLoginsSnapshot.size;

        const monthlyLoginsQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', Timestamp.fromDate(oneMonthAgo))
        );
        const monthlyLoginsSnapshot = await getDocs(monthlyLoginsQuery);
        const monthlyLogins = monthlyLoginsSnapshot.size;

        // Aggregate user data
        const countries = {};
        const browsers = {};
        const devices = {};
        const cities = {};
        const isps = {};

        usersSnapshot.forEach(doc => {
          const data = doc.data();
          
          if (data.lastCountry) {
            countries[data.lastCountry] = (countries[data.lastCountry] || 0) + 1;
          }
          if (data.lastBrowser) {
            browsers[data.lastBrowser] = (browsers[data.lastBrowser] || 0) + 1;
          }
          if (data.lastDevice) {
            devices[data.lastDevice] = (devices[data.lastDevice] || 0) + 1;
          }
          if (data.lastCity) {
            cities[data.lastCity] = (cities[data.lastCity] || 0) + 1;
          }
          if (data.lastISP) {
            isps[data.lastISP] = (isps[data.lastISP] || 0) + 1;
          }
        });

        setStats({
          totalUsers,
          activeUsers,
          dailyLogins,
          weeklyLogins,
          monthlyLogins,
          countries,
          browsers,
          devices,
          cities,
          isps
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
          <p className="text-white text-lg">Loading analytics...</p>
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
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-gray-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FaUserCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-gray-400">Active Users (24h)</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FaClock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.dailyLogins}</p>
              <p className="text-gray-400">Daily Logins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Stats */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaCalendarAlt className="text-yellow-500 mr-2" />
          Login Statistics
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-gray-400">Daily Logins</p>
            <p className="text-2xl font-bold text-white">{stats.dailyLogins}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Weekly Logins</p>
            <p className="text-2xl font-bold text-white">{stats.weeklyLogins}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Monthly Logins</p>
            <p className="text-2xl font-bold text-white">{stats.monthlyLogins}</p>
          </div>
        </div>
      </div>

      {/* Geographic Data */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaGlobe className="text-blue-500 mr-2" />
          Geographic Distribution
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
            <div className="space-y-2">
              {Object.entries(stats.countries)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-gray-400">{country}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Cities</h3>
            <div className="space-y-2">
              {Object.entries(stats.cities)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([city, count]) => (
                  <div key={city} className="flex items-center justify-between">
                    <span className="text-gray-400">{city}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Technical Data */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaDesktop className="text-purple-500 mr-2" />
          Technical Information
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Browsers</h3>
            <div className="space-y-2">
              {Object.entries(stats.browsers)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="text-gray-400">{browser}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Devices</h3>
            <div className="space-y-2">
              {Object.entries(stats.devices)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-gray-400">{device}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">ISPs</h3>
            <div className="space-y-2">
              {Object.entries(stats.isps)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([isp, count]) => (
                  <div key={isp} className="flex items-center justify-between">
                    <span className="text-gray-400">{isp}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;