import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaFlag, FaCheck, FaTimes, FaUser, 
  FaCalendar, FaExclamationTriangle, FaUserShield, FaSignInAlt,
  FaGamepad, FaRandom, FaComments, FaLink, FaDatabase,
  FaInfoCircle, FaExclamationCircle, FaShieldAlt
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, game, service, community

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

    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleMarkReportAsDone = async (reportId) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking report as done:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'game':
        return <FaGamepad className="text-blue-500" />;
      case 'service':
        return <FaRandom className="text-purple-500" />;
      case 'post':
      case 'comment':
      case 'reply':
        return <FaComments className="text-green-500" />;
      default:
        return <FaFlag className="text-red-500" />;
    }
  };

  const getReportTypeBadge = (type) => {
    const badges = {
      game: 'bg-blue-500/20 text-blue-400',
      service: 'bg-purple-500/20 text-purple-400',
      post: 'bg-green-500/20 text-green-400',
      comment: 'bg-green-500/20 text-green-400',
      reply: 'bg-green-500/20 text-green-400'
    };
    return badges[type] || 'bg-red-500/20 text-red-400';
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'game') return report.type === 'game';
    if (filter === 'service') return report.type === 'service';
    if (filter === 'community') return ['post', 'comment', 'reply'].includes(report.type);
    return true;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading reports...</p>
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
          <h1 className="text-2xl font-bold text-white">Reports Management</h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('game')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'game'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Game Reports
          </button>
          <button
            onClick={() => setFilter('service')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'service'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Service Reports
          </button>
          <button
            onClick={() => setFilter('community')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'community'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Community Reports
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
            <FaFlag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No reports found</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Report Type Badge */}
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon(report.type)}
                    <span className={`px-2 py-1 rounded-full text-sm ${getReportTypeBadge(report.type)}`}>
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      report.status === 'resolved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Reporter Info */}
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-white">Reporter: {report.reportedBy}</p>
                      <p className="text-gray-400">Reported User: {report.reportedUserId}</p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-gray-400" />
                    <p className="text-gray-400">
                      {new Date(report.timestamp?.toDate()).toLocaleString()}
                    </p>
                  </div>

                  {/* Service/Game Details */}
                  {(report.type === 'game' || report.type === 'service') && (
                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <FaInfoCircle className="text-blue-400" />
                        <p className="text-white">Name: {report.itemName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaDatabase className="text-purple-400" />
                        <p className="text-white">ID: {report.itemId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaShieldAlt className="text-green-400" />
                        <p className="text-white">Service: {report.serviceName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaExclamationCircle className="text-yellow-400" />
                        <p className="text-white">Issue Type: {report.issueType}</p>
                      </div>
                    </div>
                  )}

                  {/* Community Content Details */}
                  {['post', 'comment', 'reply'].includes(report.type) && (
                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <FaLink className="text-blue-400" />
                        <p className="text-white">Message ID: {report.messageId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaDatabase className="text-purple-400" />
                        <p className="text-white">Content ID: {report.contentId}</p>
                      </div>
                    </div>
                  )}

                  {/* Report Details */}
                  <div className="space-y-2">
                    <p className="text-white">Reason: {report.reason}</p>
                    <p className="text-white">Details: {report.details}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 ml-4">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => handleMarkReportAsDone(report.id)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      title="Mark as Resolved"
                    >
                      <FaCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete Report"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminReports;