import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CommunityBanner from '../components/community/CommunityBanner';
import CommunityHeader from '../components/community/CommunityHeader';
import CreatePost from '../components/community/CreatePost';
import PostFilters from '../components/community/PostFilters';
import Post from '../components/community/Post';
import ReportModal from '../components/community/ReportModal';
import ReportsList from '../components/community/ReportsList';
import Sidebar from '../components/community/Sidebar';
import Pagination from '../components/community/Pagination';
import { useCommunityData } from '../hooks/useCommunityData';
import { usePagination } from '../hooks/usePagination';
import { moderateContent } from '../utils/contentModeration';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaSearch, FaUserCircle, FaCircle } from 'react-icons/fa';

function Community() {
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [postType, setPostType] = useState('text');
  const [postTitle, setPostTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReports, setShowReports] = useState(false);
  const [sortBy, setSortBy] = useState('hot');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState([]);

  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

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
    handleDeleteReport,
    handleEditMessage,
    handleEditComment,
    handleEditReply
  } = useCommunityData();

  useEffect(() => {
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
  }, []);

  const filteredMessages = messages
    .filter(message => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          message.title?.toLowerCase().includes(searchLower) ||
          message.text?.toLowerCase().includes(searchLower) ||
          message.username?.toLowerCase().includes(searchLower) ||
          message.id?.toLowerCase().includes(searchLower) ||
          message.userId?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case 'hot':
          return b.votes - a.votes;
        case 'new':
          return b.timestamp - a.timestamp;
        case 'top':
          return b.votes - a.votes;
        default:
          return 0;
      }
    });

  const { currentPage, setCurrentPage, currentItems, totalPages } = usePagination(filteredMessages, 5);

  const handleUpdateProfilePic = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        profilePicUrl
      });
      setShowProfileEdit(false);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown) return;

    const titleModeration = moderateContent(postTitle);
    if (!titleModeration.isValid) {
      alert(`Title: ${titleModeration.reason}`);
      return;
    }

    const messageModeration = moderateContent(newMessage);
    if (!messageModeration.isValid) {
      alert(`Message: ${messageModeration.reason}`);
      return;
    }

    try {
      const messageRef = collection(db, 'community_messages');
      await addDoc(messageRef, {
        userId: user.id,
        username: user.username,
        title: postTitle,
        text: newMessage,
        type: postType,
        tags: selectedTags,
        timestamp: serverTimestamp(),
        votes: 0,
        userVotes: {},
        comments: []
      });

      setPostTitle('');
      setNewMessage('');
      setSelectedTags([]);
      setShowPostOptions(false);
      setCooldown(true);
      setCooldownTime(30);

      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleReportSubmit = async (messageId, contentId, contentType, reason, details) => {
    await handleReport(messageId, contentId, contentType, reason, details);
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
  };

  const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    const lastActiveTime = lastActive.toDate();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActiveTime > fiveMinutesAgo;
  };

  const communityRules = [
    'Be respectful and civil',
    'No spam or self-promotion',
    'No NSFW content',
    'No hate speech or harassment',
    'Follow content guidelines',
    'Report violations'
  ];

  return (
    <div className="min-h-screen bg-black">
      <CommunityBanner />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CommunityHeader />

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, content, username, user ID, or message ID..."
              className="w-full bg-[#1A1A1B] text-white px-4 py-3 pl-12 rounded-lg border border-[#343536] focus:outline-none focus:border-[#D7DADC]"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-8">
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
              {currentItems.map((message) => (
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
                  onEditMessage={handleEditMessage}
                  onEditComment={handleEditComment}
                  onEditReply={handleEditReply}
                  setShowReportModal={setShowReportModal}
                  setSelectedPostId={setSelectedPostId}
                />
              ))}
            </div>

            {messages.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          <div className="w-80 space-y-4">
            <Sidebar
              communityStats={communityStats}
              communityRules={communityRules}
            />

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

            {isAdmin && (
              <ReportsList
                showReports={true}
                setShowReports={setShowReports}
                reports={reports}
                handleMarkReportAsDone={handleMarkReportAsDone}
                handleDeleteReport={handleDeleteReport}
              />
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
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default Community;