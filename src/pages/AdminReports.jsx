import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaFlag, FaCheck, FaTimes, FaUser, 
  FaCalendar, FaExclamationTriangle, FaUserShield, FaSignInAlt,
  FaGamepad, FaRandom, FaComments, FaLink, FaDatabase,
  FaInfoCircle, FaExclamationCircle, FaShieldAlt, FaBullhorn,
  FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, 
  FaBell, FaExclamation, FaHeadset, FaFilter, FaSort,
  FaSearch, FaRegClock, FaHashtag, FaAt, FaEnvelope,
  FaReply, FaEye, FaEyeSlash, FaHistory, FaRegCalendarAlt,
  FaUserCog, FaLock, FaUnlock, FaArchive, FaTrashAlt,
  FaClipboardList, FaClipboardCheck, FaUserTie, FaUserTag,
  FaTicketAlt, FaTools, FaCog, FaWrench, FaUserClock
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';

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
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'normal',
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

    const fetchData = async () => {
      try {
        // Reports Query
        const reportsQuery = query(
          collection(db, 'reports'),
          orderBy('timestamp', 'desc')
        );
        const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
          const reportsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().timestamp
          }));
          setReports(reportsData);
        });

        // Support Tickets Query
        const ticketsQuery = query(
          collection(db, 'support_tickets'),
          orderBy('createdAt', 'desc')
        );
        const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
          const ticketsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSupportTickets(ticketsData);
        });

        // Announcements Query
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc')
        );
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleMarkAsDone = async (itemId, collection) => {
    try {
      const itemRef = doc(db, collection, itemId);
      await updateDoc(itemRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: 'admin',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking as done:', error);
    }
  };

  const handleDeleteItem = async (itemId, collection) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    
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
        updatedAt: serverTimestamp(),
        createdBy: 'admin'
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

  const handleReplySubmit = async () => {
    if (!selectedItem || !replyText.trim()) return;

    try {
      const itemRef = doc(db, selectedItem.type === 'ticket' ? 'support_tickets' : 'reports', selectedItem.id);
      
      const reply = {
        text: replyText.trim(),
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        isAdminReply: true
      };

      await updateDoc(itemRef, {
        replies: [...(selectedItem.replies || []), reply],
        status: 'in-progress',
        updatedAt: serverTimestamp(),
        lastReplyAt: serverTimestamp(),
        lastReplyBy: 'admin'
      });

      setReplyText('');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'pending':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'low':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const filteredItems = [...reports, ...supportTickets].filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticketId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      case 'priority':
        return (b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1) -
               (a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1);
      case 'status':
        return (b.status === 'pending' ? 3 : b.status === 'in-progress' ? 2 : 1) -
               (a.status === 'pending' ? 3 : a.status === 'in-progress' ? 2 : 1);
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
          <p className="text-white text-lg">Loading reports and tickets...</p>
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

      {/* Filter and Search Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports and tickets..."
                className="w-full bg-black/50 text-white px-4 py-2 pl-10 rounded-lg border border-white/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports and Tickets Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaClipboardList className="text-purple-500 mr-2" />
            Reports & Tickets
          </h2>
          
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {item.priority && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyle(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    )}
                    <span className="text-gray-400 text-sm flex items-center">
                      <FaHashtag className="mr-1" />
                      {item.ticketId || `REP-${item.id.slice(0, 8)}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{item.title || item.serviceName}</h3>
                  <p className="text-gray-300 line-clamp-2">{item.description || item.details}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <FaUserTag className="mr-1" />
                      {item.username || item.reportedBy}
                    </span>
                    <span className="flex items-center">
                      <FaAt className="mr-1" />
                      {item.userEmail}
                    </span>
                    <span className="flex items-center">
                      <FaRegCalendarAlt className="mr-1" />
                      {new Date(item.createdAt?.seconds * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FaEye className="w-5 h-5" />
                  </button>
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleMarkAsDone(item.id, item.ticketId ? 'support_tickets' : 'reports')}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                      title="Mark as Resolved"
                    >
                      <FaCheck className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteItem(item.id, item.ticketId ? 'support_tickets' : 'reports')}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Announcements Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaBullhorn className="text-yellow-500 mr-2" />
            Announcements
          </h2>
          
          {announcements.map(announcement => (
            <div
              key={announcement.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAnnouncementTypeStyle(announcement.type)}`}>
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </span>
                    {announcement.active && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                  <p className="text-gray-300">{announcement.content}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <FaRegCalendarAlt className="mr-1" />
                      {announcement.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setNewAnnouncement({
                        title: announcement.title,
                        content: announcement.content,
                        type: announcement.type,
                        active: announcement.active
                      });
                      setShowAnnouncementModal(true);
                    }}
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
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setEditingAnnouncement(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
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

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedItem.ticketId ? 'Ticket Details' : 'Report Details'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedItem(null);
                  setReplyText('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedItem.status)}`}>
                  {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                </span>
                {selectedItem.priority && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyle(selectedItem.priority)}`}>
                    {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority
                  </span>
                )}
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-400 text-sm">Title/Service</h4>
                  <p className="text-white text-lg font-bold">{selectedItem.title || selectedItem.serviceName}</p>
                </div>

                <div>
                  <h4 className="text-gray-400 text-sm">Description</h4>
                  <p className="text-white">{selectedItem.description || selectedItem.details}</p>
                </div>

                {/* User Information */}
<div className="bg-black/30 rounded-lg p-4 space-y-2">
  <h4 className="text-gray-400 text-sm">User Information</h4>
  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-gray-400 text-sm">Username</p>
                      <p className="text-white">{selectedItem.username || selectedItem.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedItem.userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <h4 className="text-gray-400 text-sm">Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-white">{new Date(selectedItem.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    {selectedItem.resolvedAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Resolved</p>
                        <p className="text-white">{new Date(selectedItem.resolvedAt?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply History */}
                {selectedItem.replies && selectedItem.replies.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-gray-400 text-sm">Previous Replies</h4>
                    <div className="space-y-4">
                      {selectedItem.replies.map((reply, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            reply.isAdminReply
                              ? 'bg-purple-500/10 border border-purple-500/20 ml-8'
                              : 'bg-blue-500/10 border border-blue-500/20 mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${reply.isAdminReply ? 'text-purple-400' : 'text-blue-400'}`}>
                              {reply.isAdminReply ? 'Admin' : 'User'}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {new Date(reply.createdAt?.seconds * 1000).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {selectedItem && selectedItem.status !== 'resolved' && (
                  <div className="space-y-4">
                    <h4 className="text-gray-400 text-sm">Add Reply</h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleReplySubmit}
                        disabled={!replyText.trim()}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          replyText.trim()
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-white/20 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;