import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUserShield, FaUndo, FaSignInAlt, FaSearch,
  FaUsers, FaUserCheck, FaUserClock, FaGamepad,
  FaChartBar, FaDatabase, FaServer, FaCog,
  FaExclamationTriangle, FaCheckCircle, FaRandom
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
  const [activeSection, setActiveSection] = useState('overview');

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
            <Link
              to="/admin/generator"
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Generator Manager
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

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Games Manager */}
          <Link to="/admin/games" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaGamepad className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Games Manager</h3>
                  <p className="text-gray-400 text-sm">Manage game accounts and access</p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Generator Manager */}
          <Link to="/admin/generator" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaRandom className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Generator Manager</h3>
                  <p className="text-gray-400 text-sm">Manage generator services and accounts</p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Analytics */}
          <div className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaChartBar className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Analytics</h3>
                  <p className="text-gray-400 text-sm">View usage statistics and metrics</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* User Management */}
          <div className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <p className="text-gray-400 text-sm">Manage user accounts and permissions</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* System Settings */}
          <div className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaCog className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">System Settings</h3>
                  <p className="text-gray-400 text-sm">Configure system parameters</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Database Management */}
          <div className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FaDatabase className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Database Management</h3>
                  <p className="text-gray-400 text-sm">Manage database operations and backups</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Admin Notice */}
        <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <FaExclamationTriangle className="w-6 h-6 text-red-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Administrator Notice</h3>
              <p className="text-gray-400">
                Remember to exercise caution when using administrative tools. All actions are logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;