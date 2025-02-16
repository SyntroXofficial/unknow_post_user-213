import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBug, FaGamepad, FaLightbulb, FaExclamationTriangle,
  FaUser, FaEnvelope, FaTag, FaComments, FaPaperPlane,
  FaCheck, FaSpinner, FaBullhorn, FaTicketAlt, FaLock,
  FaUserCircle, FaRegClock, FaFolder, FaTimes, FaIdCard,
  FaHashtag, FaAt, FaUserTag
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

function Support() {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [indexError, setIndexError] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      // Try to get username from user profile if available
      const userDisplayName = user.displayName || user.email?.split('@')[0] || '';
      setUsername(userDisplayName);
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe;
    const fetchAnnouncements = async () => {
      try {
        const testQuery = query(
          collection(db, 'announcements'),
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        );

        await getDocs(testQuery);
        setIndexError(false);

        unsubscribe = onSnapshot(testQuery, (snapshot) => {
          const announcementsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAnnouncements(announcementsData);
        }, (error) => {
          console.error('Error in announcements listener:', error);
          if (error.code === 'failed-precondition') {
            setIndexError(true);
          }
        });
      } catch (error) {
        console.error('Error fetching announcements:', error);
        if (error.code === 'failed-precondition') {
          setIndexError(true);
        }
      }
    };

    fetchAnnouncements();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    let unsubscribe;

    if (user) {
      try {
        const basicQuery = query(
          collection(db, 'support_tickets'),
          where('userId', '==', user.uid)
        );

        unsubscribe = onSnapshot(basicQuery, (snapshot) => {
          const ticketsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB - dateA;
          });
          
          setTickets(ticketsData);
        }, (error) => {
          console.error('Error in tickets listener:', error);
          setTickets([]);
        });
      } catch (error) {
        console.error('Error setting up tickets listener:', error);
        setTickets([]);
      }
    }

    return () => unsubscribe?.();
  }, [user]);

  const generateTicketId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TICKET-${timestamp}-${randomStr}`;
  };

  const getAnnouncementTypeStyle = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/20 border-red-500/20 text-red-500';
      case 'important':
        return 'bg-yellow-500/20 border-yellow-500/20 text-yellow-500';
      default:
        return 'bg-blue-500/20 border-blue-500/20 text-blue-500';
    }
  };

  const getTicketStatusStyle = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const categories = {
    bug: {
      icon: FaBug,
      color: 'red',
      label: 'Report a Bug',
      subcategories: [
        'Website Issues',
        'Playback Problems',
        'Login Issues',
        'Performance Problems',
        'Other Technical Issues'
      ]
    },
    account: {
      icon: FaGamepad,
      color: 'blue',
      label: 'Account Issues',
      subcategories: [
        'Game Account Not Working',
        'Streaming Service Issues',
        'Generator Service Problems',
        'Account Access Issues',
        'Other Account Problems'
      ]
    },
    suggestion: {
      icon: FaLightbulb,
      color: 'yellow',
      label: 'Suggestions',
      subcategories: [
        'New Game Requests',
        'New Service Suggestions',
        'Feature Requests',
        'UI/UX Improvements',
        'Other Suggestions'
      ]
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!username.trim() || !email.trim()) {
      setError('Username and email are required');
      setLoading(false);
      return;
    }

    try {
      const ticketId = generateTicketId();
      const reportData = {
        ticketId,
        userId: user?.uid || 'guest',
        username: username.trim(),
        userEmail: email.trim(),
        category,
        subcategory,
        title,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        priority: 'normal',
        assignedTo: null,
        comments: []
      };

      await addDoc(collection(db, 'support_tickets'), reportData);
      setSuccess(true);
      setCategory('');
      setSubcategory('');
      setTitle('');
      setDescription('');
      setShowTicketForm(false);

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[75vh]">
        <div className="absolute inset-0">
          <img 
            src="https://i.ibb.co/tMTybz7N/Screenshot-1289.png"
            alt="Support Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-16 px-12">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 text-xs font-medium">
                  24/7 SUPPORT
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">How Can We Help You?</h1>
            </div>
            <p className="text-lg text-white/90 leading-relaxed max-w-xl">
              We're here to help with any issues you encounter. Whether it's a bug report, account problem, or suggestion for improvement, our team is ready to assist.
            </p>
            {/* Create Ticket Button */}
            <button
              onClick={() => setShowTicketForm(true)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaTicketAlt className="w-5 h-5" />
              <span>Create Support Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <FaCheck className="text-green-500 w-5 h-5" />
              <p className="text-green-500">Your support ticket has been submitted successfully!</p>
            </div>
          </div>
        )}

        {/* User's Tickets Section */}
        {user && tickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaTicketAlt className="text-purple-500 mr-2" />
              Your Support Tickets
            </h2>
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTicketStatusStyle(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center">
                          <FaHashtag className="mr-1" />
                          {ticket.ticketId}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center">
                          <FaRegClock className="mr-1" />
                          {ticket.createdAt?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{ticket.title}</h3>
                      <p className="text-gray-300">{ticket.description}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          <FaTag className="mr-1" />
                          {ticket.category}
                        </span>
                        <span className="flex items-center">
                          <FaFolder className="mr-1" />
                          {ticket.subcategory}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Section */}
        {indexError ? (
          <div className="mb-12">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                System Update in Progress
              </h2>
              <p className="text-gray-300 mb-4">
                The announcements system is currently being initialized. This is a one-time setup process.
                Please check back in a few minutes.
              </p>
              <p className="text-gray-400 text-sm">
                If you're an administrator, please create the required index in the Firebase Console.
              </p>
            </div>
          </div>
        ) : announcements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaBullhorn className="text-yellow-500 mr-2" />
              Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div
                  key={announcement.id}
                  className={`rounded-xl p-6 border ${getAnnouncementTypeStyle(announcement.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAnnouncementTypeStyle(announcement.type)}`}>
                          {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                      <p className="text-gray-300">{announcement.content}</p>
                      <p className="text-sm text-gray-400">
                        Posted: {announcement.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Form Modal */}
        {showTicketForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1A1A1B] p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create Support Ticket</h3>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaAt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-white/40"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(categories).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setCategory(key);
                        setSubcategory('');
                      }}
                      className={`p-4 rounded-lg border transition-all ${
                        category === key
                          ? `border-${value.color}-500 bg-${value.color}-500/10`
                          : 'border-white/10 hover:border-white/20 bg-black/50'
                      }`}
                    >
                      <value.icon className={`w-6 h-6 text-${value.color}-500 mx-auto mb-2`} />
                      <p className="text-white text-sm">{value.label}</p>
                    </button>
                  ))}
                </div>

                {category && (
                  <>
                    {/* Subcategory Selection */}
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Category Type</label>
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories[category].subcategories.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief description of the issue"
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide detailed information about your issue or suggestion..."
                        className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 min-h-[200px]"
                        required
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !category || !subcategory || !username || !email}
                    className={`px-6 py-2 bg-red-500 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                      loading || !category || !subcategory || !username || !email ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-4 h-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Support;