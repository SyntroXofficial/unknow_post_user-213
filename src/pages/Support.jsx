import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBug, FaGamepad, FaLightbulb, FaExclamationTriangle,
  FaUser, FaEnvelope, FaTag, FaComments, FaPaperPlane,
  FaCheck, FaSpinner, FaBullhorn
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

function Support() {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    let unsubscribe;
    const fetchAnnouncements = async () => {
      try {
        const testQuery = query(
          collection(db, 'announcements'),
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        );

        // Test if index exists
        await getDocs(testQuery);
        setIndexError(false);

        // If we get here, index exists, set up the listener
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
    if (!auth.currentUser) {
      setError('You must be logged in to submit a report');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reportData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        category,
        subcategory,
        title,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'support_tickets'), reportData);
      setSuccess(true);
      setCategory('');
      setSubcategory('');
      setTitle('');
      setDescription('');

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
      <div className="relative h-[50vh]">
        <div className="absolute inset-0">
          <img 
            src="https://media.discordapp.net/attachments/1193190985614757969/1338522256426537005/Screenshot_1289.png?ex=67ab637e&is=67aa11fe&hm=32cf92f0ec3b22242ff7a19fe2e0e3246cf6ec1e7fc8b0f8351f750c8bd95c31&=&format=webp&quality=lossless&width=2605&height=1327"
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
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      {indexError ? (
        <div className="max-w-6xl mx-auto px-8 py-8">
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
        <div className="max-w-6xl mx-auto px-8 py-8">
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Category Selection */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {Object.entries(categories).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
                setSubcategory('');
              }}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                category === key
                  ? `border-${value.color}-500 bg-${value.color}-500/10`
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div className="p-6">
                <div className={`p-3 bg-${value.color}-500/20 rounded-lg w-min group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`w-6 h-6 text-${value.color}-500`} />
                </div>
                <h3 className="text-white font-semibold text-lg mt-4">{value.label}</h3>
                <p className="text-gray-400 text-sm mt-2">
                  {key === 'bug' && 'Report technical issues or bugs you encounter'}
                  {key === 'account' && 'Issues with game or service accounts'}
                  {key === 'suggestion' && 'Share your ideas for improvements'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Report Form */}
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subcategory Selection */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Category Type</label>
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
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Title</label>
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
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about your issue or suggestion..."
                  className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 min-h-[200px]"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-500 text-sm flex items-center">
                    <FaCheck className="w-4 h-4 mr-2" />
                    Your report has been submitted successfully!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-white text-black rounded-lg py-3 font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
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
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Support;