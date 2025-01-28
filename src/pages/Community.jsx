import React, { useState } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

  const { currentPage, setCurrentPage, currentItems, totalPages } = usePagination(messages, 5);

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

    // Content moderation
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

  const communityRules = [
    'Be respectful and civil',
    'No spam or self-promotion',
    'No NSFW content',
    'No hate speech or harassment',
    'Follow content guidelines',
    'Report violations'
  ];

  return (
    <div className="min-h-screen bg-black pt-24">
      <CommunityBanner />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CommunityHeader />

        <div className="flex gap-8">
          {/* Main Content */}
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

          {/* Sidebar */}
          <Sidebar
            communityStats={communityStats}
            communityRules={communityRules}
          />
        </div>
      </div>

      {/* Report Modal */}
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

      {/* Reports List (Admin Only) */}
      <ReportsList
        showReports={showReports}
        setShowReports={setShowReports}
        reports={reports}
        handleMarkReportAsDone={handleMarkReportAsDone}
        handleDeleteReport={handleDeleteReport}
      />
    </div>
  );
}

export default Community;