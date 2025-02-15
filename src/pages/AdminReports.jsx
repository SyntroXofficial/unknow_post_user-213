import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaFlag, FaCheck, FaTimes, FaUser, 
  FaCalendar, FaExclamationTriangle, FaUserShield, FaSignInAlt,
  FaGamepad, FaRandom, FaComments, FaLink, FaDatabase,
  FaInfoCircle, FaExclamationCircle, FaShieldAlt, FaBullhorn,
  FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, 
  FaBell, FaExclamation, FaHeadset
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'normal', // normal, important, urgent
    active: true
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

    // Fetch reports
    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    });

    // Fetch support tickets
    const ticketsQuery = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSupportTickets(ticketsData);
    });

    // Fetch announcements
    const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
    });

    setLoading(false);

    return () => {
      unsubscribeReports();
      unsubscribeTickets();
      unsubscribeAnnouncements();
    };
  }, [isAuthenticated]);

  const handleMarkAsDone = async (itemId, collection) => {
    try {
      const itemRef = doc(db, collection, itemId);
      await updateDoc(itemRef, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking as done:', error);
    }
  };

  const handleDeleteItem = async (itemId, collection) => {
    try {
      await deleteDoc(doc(db, collection, itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAddAnnouncement = async () => {
    try {
      const announcementData = {
        ...newAnnouncement,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingAnnouncement) {
        await updateDoc(doc(db, 'announcements', editingAnnouncement.id), {
          ...announcementData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'announcements'), announcementData);
      }

      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'normal',
        active: true
      });
    } catch (error) {
      console.error('Error with announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      active: announcement.active
    });
    setShowAnnouncementModal(true);
  };

  const getAnnouncementTypeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/20 text-red-500';
      case 'important':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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

        {/* Add Announcement Button */}
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setNewAnnouncement({
              title: '',
              content: '',
              type: 'normal',
              active: true
            });
            setShowAnnouncementModal(true);
          }}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <FaBullhorn className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('reports')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'reports'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setFilter('tickets')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'tickets'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setFilter('announcements')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'announcements'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Announcements
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {/* Announcements Section */}
        {(filter === 'all' || filter === 'announcements') && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaBullhorn className="mr-2 text-yellow-500" />
              Announcements
            </h2>
            {announcements.map(announcement => (
              <div
                key={announcement.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${getAnnouncementTypeStyle(announcement.type)}`}>
                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                      </span>
                      {announcement.active && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                    <p className="text-gray-300">{announcement.content}</p>
                    <p className="text-gray-400 text-sm">
                      Posted: {announcement.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(announcement.id, 'announcements')}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Tickets Section */}
        {(filter === 'all' || filter === 'tickets') && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaHeadset className="mr-2 text-blue-500" />
              Support Tickets
            </h2>
            {supportTickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        ticket.status === 'resolved'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm">
                        {ticket.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{ticket.title}</h3>
                      <p className="text-gray-300 mt-2">{ticket.description}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>From: {ticket.userEmail}</span>
                      <span>Created: {ticket.createdAt?.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkAsDone(ticket.id, 'support_tickets')}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <FaCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(ticket.id, 'support_tickets')}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Section */}
        {(filter === 'all' || filter === 'reports') && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaFlag className="mr-2 text-red-500" />
              Reports
            </h2>
            {reports.map(report => (
              <div
                key={report.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'resolved'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {report.status}
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {report.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold">Service: {report.serviceName}</p>
                      <p className="text-gray-300 mt-2">Issue: {report.issueType}</p>
                      <p className="text-gray-300">Details: {report.details}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>From: {report.reportedBy}</span>
                      <span>Created: {report.timestamp?.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {report.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkAsDone(report.id, 'reports')}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <FaCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(report.id, 'reports')}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddAnnouncement();
            }} className="space-y-6">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">Type</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                  className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newAnnouncement.active}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, active: e.target.checked})}
                  className="rounded border-white/20"
                />
                <label className="text-white">Active</label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
                >
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;