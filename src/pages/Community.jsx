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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

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
      
      // Then apply other sorting criteria
      switch (sortBy) {
        case 'hot':
          return (b.votes || 0) - (a.votes || 0);
        case 'new':
          const timeA = a.timestamp?.toDate?.() || a.timestamp;
          const timeB = b.timestamp?.toDate?.() || b.timestamp;
          return timeB - timeA;
        case 'top':
          return (b.votes || 0) - (a.votes || 0);
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
        profilePicUrl: profilePicUrl,
        lastUpdated: serverTimestamp()
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

            <PostFilters 
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedTimeframe={selectedTimeframe}
              setSelectedTimeframe={setSelectedTimeframe}
            />

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

          <div className="w-80 space-y-4">
            <Sidebar 
              communityStats={communityStats}
              communityRules={communityRules}
            />

            {/* Members List */}
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Members</h2>
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="text-gray-400 hover:text-white"
                >
                  {showUserList ? 'Show Less' : 'Show More'}
                </button>
              </div>
              <div className="space-y-3">
                {users.slice(0, showUserList ? undefined : 5).map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {member.profilePicUrl ? (
                        <img 
                          src={member.profilePicUrl}
                          alt={member.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=?';
                          }}
                        />
                      ) : (
                        <FaUserCircle className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">
                          {member.username}
                          {member.email === 'andres_rios_xyz@outlook.com' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 text-xs">#{member.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaCircle className={`w-2 h-2 ${
                        isUserOnline(member.lastActive) 
                          ? 'text-green-500' 
                          : 'text-gray-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports Section (Admin Only) */}
            {isAdmin && (
              <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold">Reports</h2>
                </div>
                <div className="space-y-3">
                  {reports.map(report => (
                    <div key={report.id} className="bg-black/30 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm ${report.status === 'resolved' ? 'text-green-400' : 'text-white'}`}>
                            <span className="text-gray-400">Reporter:</span> {report.reportedBy}
                          </p>
                          <p className={`text-sm ${report.status === 'resolved' ? 'text-green-400' : 'text-white'}`}>
                            <span className="text-gray-400">Reason:</span> {report.reason}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {report.timestamp?.toDate().toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMarkReportAsDone(report.id)}
                            className={`p-1 ${report.status === 'resolved' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'}`}
                            title="Mark as Resolved"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Delete Report"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
