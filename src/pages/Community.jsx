import React, { useState, useEffect } from 'react';
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
  where,
  serverTimestamp,
  arrayUnion,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import CommunityBanner from '../components/community/CommunityBanner';
import CommunityHeader from '../components/community/CommunityHeader';
import CreatePost from '../components/community/CreatePost';
import PostFilters from '../components/community/PostFilters';
import Post from '../components/community/Post';
import Sidebar from '../components/community/Sidebar';
import ReportModal from '../components/community/ReportModal';
import ReportsList from '../components/community/ReportsList';
import { moderateContent } from '../utils/contentModeration';
import { useCommunityData } from '../hooks/useCommunityData';
import { usePagination } from '../hooks/usePagination';
import { FaUserCircle, FaCircle, FaExclamationTriangle, FaCheck, FaTrash, FaUsers, FaSearch } from 'react-icons/fa';

const communityRules = [
  "Be respectful and civil to other members",
  "No hate speech, harassment, or bullying",
  "No spam or self-promotion",
  "No NSFW content or inappropriate material",
  "No sharing of personal information",
  "No piracy or illegal content",
  "Follow the content posting guidelines",
  "Report violations to moderators"
];

function Community() {
  const {
    messages,
    user,
    communityStats,
    reports,
    handleVote,
    handleComment,
    handleReport,
    handlePin,
    handleDelete,
    handleCommentVote,
    handleCommentDelete,
    handleReply,
    handleMarkReportAsDone,
    handleDeleteReport
  } = useCommunityData();

  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [sortBy, setSortBy] = useState('new');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [postType, setPostType] = useState('text');
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReports, setShowReports] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const filteredMessages = messages
    .filter(message => {
      const searchLower = searchQuery.toLowerCase();
      return (
        message.title?.toLowerCase().includes(searchLower) ||
        message.text?.toLowerCase().includes(searchLower) ||
        message.username?.toLowerCase().includes(searchLower) ||
        message.id?.toLowerCase().includes(searchLower) ||
        message.userId?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by the selected criteria
      switch (sortBy) {
        case 'hot':
          return b.votes - a.votes;
        case 'new':
          return b.timestamp - a.timestamp;
        case 'top':
          const aTime = a.timestamp?.toDate?.() || a.timestamp;
          const bTime = b.timestamp?.toDate?.() || b.timestamp;
          return bTime - aTime;
        default:
          return 0;
      }
    });

  const {
    currentPage,
    setCurrentPage,
    currentItems: currentPosts,
    totalPages
  } = usePagination(filteredMessages, 10);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('lastActive', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userData);
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (cooldown) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCooldown(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleUpdateProfilePic = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        profilePicUrl: profilePicUrl
      });
      setShowProfileEdit(false);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !postTitle.trim() || !auth.currentUser || cooldown) return;

    const titleModeration = moderateContent(postTitle);
    if (!titleModeration.isValid) {
      alert(`Post title rejected: ${titleModeration.reason}`);
      return;
    }

    const contentModeration = moderateContent(newMessage);
    if (!contentModeration.isValid) {
      alert(`Post content rejected: ${contentModeration.reason}`);
      return;
    }

    try {
      await addDoc(collection(db, 'community_messages'), {
        title: postTitle,
        text: newMessage,
        userId: auth.currentUser.uid,
        username: user.username,
        timestamp: serverTimestamp(),
        votes: 0,
        userVotes: {},
        comments: [],
        type: postType,
        tags: selectedTags,
        awards: []
      });
      setNewMessage('');
      setPostTitle('');
      setPostType('text');
      setSelectedTags([]);
      setShowPostOptions(false);
      setCooldown(true);
      setCooldownTime(15);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const lastActiveTime = lastActive.toDate();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActiveTime > fiveMinutesAgo;
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      <CommunityBanner />
      
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <CommunityHeader />

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, titles, or usernames..."
              className="w-full bg-[#1A1A1B] text-white px-4 py-3 pl-12 rounded-lg border border-[#343536] focus:outline-none focus:border-[#D7DADC]"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <CreatePost 
              user={user}
              showProfileEdit={showProfileEdit}
              setShowProfileEdit={setShowProfileEdit}
              profilePicUrl={profilePicUrl}
              setProfilePicUrl={setProfilePicUrl}
              handleUpdateProfilePic={handleUpdateProfilePic}
              showPostOptions={showPostOptions}
              setShowPostOptions={setShowPostOptions}
              postType={postType}
              setPostType={setPostType}
              postTitle={postTitle}
              setPostTitle={setPostTitle}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              cooldown={cooldown}
              cooldownTime={cooldownTime}
              handleSubmit={handleSubmit}
            />

            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-white/80 w-5 h-5" />
                  <h2 className="text-xl font-bold text-white">Community Members</h2>
                </div>
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  {showUserList ? 'Hide Members' : 'Show Members'}
                </button>
              </div>

              {showUserList && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {member.profilePicUrl ? (
                            <img 
                              src={member.profilePicUrl}
                              alt={member.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <FaUserCircle className="w-6 h-6 text-purple-400" />
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1A1A1B] ${
                            isUserOnline(member.lastActive) ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium truncate">{member.username}</p>
                            {member.email === 'andres_rios_xyz@outlook.com' && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm truncate">ID: {member.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {auth.currentUser?.email === 'andres_rios_xyz@outlook.com' && (
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaExclamationTriangle className="text-red-500" />
                    <h2 className="text-xl font-bold text-white">Reported Content</h2>
                  </div>
                  <button
                    onClick={() => setShowReports(!showReports)}
                    className="text-white/70 hover:text-white"
                  >
                    {showReports ? 'Hide' : 'Show'} Reports
                  </button>
                </div>

                {showReports && (
                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No reports to show</p>
                    ) : (
                      reports.map(report => (
                        <div key={report.id} className="bg-black/30 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="text-white">
                                <span className="text-gray-400">Reporter:</span> {report.reportedBy}
                              </p>
                              <p className="text-white">
                                <span className="text-gray-400">Reported User:</span> {report.reportedUserId}
                              </p>
                              <p className="text-white">
                                <span className="text-gray-400">Reason:</span> {report.reason}
                              </p>
                              <p className="text-white">
                                <span className="text-gray-400">Details:</span> {report.details}
                              </p>
                              <p className="text-white">
                                <span className="text-gray-400">Status:</span>{' '}
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  report.status === 'resolved' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {report.status}
                                </span>
                              </p>
                            </div>
                            <div className="flex space-x-2">
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
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {currentPosts.map((message) => (
                <Post
                  key={message.id}
                  message={message}
                  user={user}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  handleVote={handleVote}
                  handleComment={handleComment}
                  handleReport={handleReport}
                  handlePin={handlePin}
                  handleDelete={handleDelete}
                  newComments={newComments}
                  setNewComments={setNewComments}
                  onReply={handleReply}
                  onCommentVote={handleCommentVote}
                  onCommentDelete={handleCommentDelete}
                  setShowReportModal={setShowReportModal}
                  setSelectedPostId={setSelectedPostId}
                />
              ))}
            </div>
          </div>

          <Sidebar 
            communityStats={communityStats}
            communityRules={communityRules}
          />
        </div>
      </div>

      <ReportModal 
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportReason={reportReason}
        setReportReason={setReportReason}
        reportDetails={reportDetails}
        setReportDetails={setReportDetails}
        selectedPostId={selectedPostId}
        onSubmit={(postId, reason, details) => {
          handleReport(postId, reason, details);
          setShowReportModal(false);
          setReportReason('');
          setReportDetails('');
        }}
      />
    </div>
  );
}

export default Community;