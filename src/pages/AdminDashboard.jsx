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

function UserDetailsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Document ID Section - New */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Document Information</h4>
            <div className="space-y-2">
              <p className="text-gray-400">Document ID</p>
              <p className="text-white bg-black/50 px-3 py-1.5 rounded font-mono text-sm break-all">
                {user.id}
              </p>
            </div>
          </div>

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

          {/* Discord Information - New */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Discord Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Discord Username</p>
                <p className="text-white">{user.discordUsername || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Discriminator</p>
                <p className="text-white">#{user.discordDiscriminator || '0000'}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Created</p>
                <p className="text-white">
                  {user.discordCreatedAt ? new Date(user.discordCreatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Public Flags</p>
                <p className="text-white">{user.discordPublicFlags || 0}</p>
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
                  {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Account Created</p>
                <p className="text-white">
                  {new Date(user.createdAt.toDate()).toLocaleString()}
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
}

function AdminDashboard() {
  // Rest of the AdminDashboard component implementation remains the same...
}

export default AdminDashboard;