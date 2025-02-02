import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGamepad, FaPlay, FaRandom, FaExclamationTriangle, FaSignInAlt, 
  FaComments, FaStar, FaCalendar, FaUsers, FaUserCheck, FaFilm, 
  FaTv, FaBolt, FaCrown, FaRocket, FaCircle, FaClock, FaGlobe,
  FaInfoCircle, FaUserShield
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { allGames } from '../data/gameAccounts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

function Home() {
  const user = auth.currentUser;
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: allGames.length,
    totalMovies: 1000,
    totalShows: 500,
    dailyLogins: 0,
    staff: 1
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;

        // Fetch admin user data
        const adminQuery = query(
          collection(db, 'users'),
          where('email', '==', 'andres_rios_xyz@outlook.com')
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          setAdminUser(adminSnapshot.docs[0].data());
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsersQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
          orderBy('lastActive', 'desc')
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);
        
        const activeUsersData = activeUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActiveUsers(activeUsersData);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const dailyLoginsQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', Timestamp.fromDate(todayStart))
        );
        const dailyLoginsSnapshot = await getDocs(dailyLoginsQuery);

        setStats({
          totalUsers,
          activeUsers: activeUsersSnapshot.size,
          totalGames: allGames.length,
          totalMovies: 1000,
          totalShows: 500,
          dailyLogins: dailyLoginsSnapshot.size,
          staff: 1
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatLastActive = (lastActive) => {
    if (!lastActive || !lastActive.toDate) return 'Never';
    try {
      const lastActiveDate = lastActive.toDate();
      return lastActiveDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const isUserOnline = (lastActive) => {
    if (!lastActive || !lastActive.toDate) return false;
    try {
      const lastActiveDate = lastActive.toDate();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastActiveDate > twentyFourHoursAgo;
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <motion.div 
        className="relative min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="relative w-full h-full"
          >
            <img 
              src="https://media.discordapp.net/attachments/1193190985614757969/1332661685072433203/Screenshot_201468-enhanced.png?ex=67961169&is=6794bfe9&hm=44601f40e9bfc6e7d450510e568df24219bb77397f19ab6624c90ffe561c23b2&=&format=webp&quality=lossless&width=2345&height=1309"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
          </motion.div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center space-x-2 mb-6">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium inline-flex items-center">
                <FaBolt className="w-3 h-3 mr-1 text-yellow-500" />
                TRENDING NOW
              </span>
              <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-purple-400 text-xs font-medium inline-flex items-center">
                <FaCrown className="w-3 h-3 mr-1" />
                PREMIUM ACCESS
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Your Gateway to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Premium Digital Services
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Experience unlimited access to premium games, streaming services, and exclusive content. 
              Join our growing community and unlock a world of digital entertainment.
            </p>

            {/* Main Action Buttons */}
            {!user && (
              <div className="flex justify-center gap-4 mb-12">
                <Link 
                  to="/login" 
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold group"
                >
                  Sign In
                  <FaSignInAlt className="inline-block ml-2" />
                </Link>
                <Link 
                  to="/signup" 
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 group"
                >
                  Create Account
                  <FaRocket className="inline-block ml-2" />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Access Grid */}
          <motion.div 
            className="grid grid-cols-4 gap-6 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <Link to={user ? "/streaming" : "/login"} className="group">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 h-full">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaPlay className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Streaming</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Watch the latest movies and TV shows in high quality</p>
              </div>
            </Link>

            <Link to={user ? "/games" : "/login"} className="group">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 h-full">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaGamepad className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Games</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Play the best premium games instantly</p>
              </div>
            </Link>

            <Link to={user ? "/generator" : "/login"} className="group">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 h-full">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaRandom className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Generator</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Access premium accounts and services</p>
              </div>
            </Link>

            <Link to={user ? "/community" : "/login"} className="group">
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 h-full">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FaComments className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Community</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Join the conversation with fellow members</p>
              </div>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-6 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-[120px]">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FaUsers className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-400">Community Members</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-[120px]">
              <div className="flex items-center space-x-3">
                {adminUser?.profilePicUrl ? (
                  <img 
                    src={adminUser.profilePicUrl}
                    alt="Admin"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FaUserShield className="w-6 h-6 text-purple-500" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-white">andres_rios</p>
                  <p className="text-sm text-gray-400">Administrator</p>
                </div>
              </div>
            </div>

            <Link to="/important" className="group">
              <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 h-[120px]">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">Important</p>
                    <p className="text-sm text-red-400">Information</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Active Members Section */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FaUsers className="mr-2 text-purple-500" />
                Active Members ({activeUsers.length})
              </h2>
            </div>
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.1)'
            }}>
              {activeUsers.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {member.profilePicUrl ? (
                      <img 
                        src={member.profilePicUrl}
                        alt={member.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <FaUserCheck className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{member.username}</p>
                      <p className="text-sm text-gray-400">#{member.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCircle className="w-2 h-2 text-green-500" />
                    <div className="text-sm text-gray-400">
                      {isUserOnline(member.lastActive) ? (
                        <span className="text-green-500">Active at {formatLastActive(member.lastActive)}</span>
                      ) : (
                        <span>Last seen {formatLastActive(member.lastActive)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;