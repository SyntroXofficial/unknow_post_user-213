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
import { FaSearch, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const BANNED_WORDS = [
  'gay', 'scam', 'hack', 'cheat', 'crack', 'leak', 'steal', 'fraud',
  'nsfw', 'xxx', 'porn', 'sex', 'nude', 'naked', 'adult',
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'kill', 'die', 'suicide',
  'discord.gg', 'telegram', 'whatsapp'
];

const moderateContent = (text) => {
  const lowerText = text.toLowerCase();
  
  const containsBannedWords = BANNED_WORDS.some(word => lowerText.includes(word));
  if (containsBannedWords) {
    return {
      isValid: false,
      reason: 'Content contains prohibited words or links'
    };
  }

  const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsPercentage > 0.7) {
    return {
      isValid: false,
      reason: 'Too many capital letters'
    };
  }

  if (/(.)\1{4,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Repeated characters detected'
    };
  }

  if (text.trim().length < 2) {
    return {
      isValid: false,
      reason: 'Content is too short'
    };
  }

  if (text.length > 2000) {
    return {
      isValid: false,
      reason: 'Content is too long (maximum 2000 characters)'
    };
  }

  if (/[!?]{3,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Excessive punctuation detected'
    };
  }

  const emojiCount = (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
  if (emojiCount > 10) {
    return {
      isValid: false,
      reason: 'Too many emojis'
    };
  }

  return { isValid: true };
};

function Community() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [user, setUser] = useState(null);
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
  const [announcement, setAnnouncement] = useState('Welcome to our community! Please read the rules before posting.');
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    dailyPosts: 0,
    dailyComments: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), id: auth.currentUser.uid });
          setProfilePicUrl(userDoc.data().profilePicUrl || '');
        }
      }
    };

    fetchUserData();

    const messagesQuery = query(collection(db, 'community_messages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
    });

    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const reportsUnsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const newReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(newReports);
    });

    const fetchCommunityStats = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalMembers = usersSnapshot.size;

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineUsersQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', Timestamp.fromDate(fiveMinutesAgo))
        );
        const onlineUsersSnapshot = await getDocs(onlineUsersQuery);
        const onlineMembers = onlineUsersSnapshot.size;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const postsQuery = query(
          collection(db, 'community_messages'),
          where('timestamp', '>=', Timestamp.fromDate(today))
        );
        const postsSnapshot = await getDocs(postsQuery);
        const dailyPosts = postsSnapshot.size;

        let dailyComments = 0;
        postsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.comments) {
            dailyComments += data.comments.filter(comment => 
              new Date(comment.timestamp) >= today
            ).length;
          }
        });

        setCommunityStats({
          totalMembers,
          onlineMembers,
          dailyPosts,
          dailyComments
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
      }
    };

    const fetchAnnouncement = async () => {
      try {
        const announcementDoc = await getDoc(doc(db, 'system', 'announcement'));
        if (announcementDoc.exists()) {
          setAnnouncement(announcementDoc.data().text);
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    fetchAnnouncement();
    fetchCommunityStats();
    const statsInterval = setInterval(fetchCommunityStats, 60000);

    return () => {
      unsubscribe();
      reportsUnsubscribe();
      clearInterval(statsInterval);
    };
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
      setUser(prev => ({ ...prev, profilePicUrl }));
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleVote = async (messageId, direction) => {
    if (!auth.currentUser) return;

    const messageRef = doc(db, 'community_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    const currentVotes = messageDoc.data().votes || 0;
    const userVotes = messageDoc.data().userVotes || {};
    const currentUserVote = userVotes[auth.currentUser.uid] || 0;

    let newVoteCount = currentVotes;
    let newUserVote = direction;

    if (currentUserVote === direction) {
      newVoteCount -= direction;
      newUserVote = 0;
    } else {
      newVoteCount = currentVotes - currentUserVote + direction;
    }

    await updateDoc(messageRef, {
      votes: newVoteCount,
      [`userVotes.${auth.currentUser.uid}`]: newUserVote
    });
  };

  const handleCommentVote = async (messageId, commentId, direction) => {
    if (!auth.currentUser) return;

    const messageRef = doc(db, 'community_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    const comments = messageDoc.data().comments || [];

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const currentVotes = comment.votes || 0;
        const userVotes = comment.userVotes || {};
        const currentUserVote = userVotes[auth.currentUser.uid] || 0;

        let newVoteCount = currentVotes;
        let newUserVote = direction;

        if (currentUserVote === direction) {
          newVoteCount -= direction;
          newUserVote = 0;
        } else {
          newVoteCount = currentVotes - currentUserVote + direction;
        }

        return {
          ...comment,
          votes: newVoteCount,
          userVotes: {
            ...userVotes,
            [auth.currentUser.uid]: newUserVote
          }
        };
      }
      return comment;
    });

    await updateDoc(messageRef, { comments: updatedComments });
  };

  const handleComment = async (messageId) => {
    if (!newComments[messageId]?.trim() || !auth.currentUser) return;

    const moderationResult = moderateContent(newComments[messageId]);
    if (!moderationResult.isValid) {
      alert(`Comment rejected: ${moderationResult.reason}`);
      return;
    }

    const messageRef = doc(db, 'community_messages', messageId);
    await updateDoc(messageRef, {
      comments: arrayUnion({
        id: Date.now().toString(),
        text: newComments[messageId],
        userId: auth.currentUser.uid,
        username: user.username,
        timestamp: new Date().toISOString(),
        votes: 0,
        userVotes: {}
      })
    });

    setNewComments(prev => ({ ...prev, [messageId]: '' }));
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

  const handleReport = async (messageId) => {
    if (!auth.currentUser) return;
    
    setSelectedPostId(messageId);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!auth.currentUser || !selectedPostId || !reportReason.trim() || !reportDetails.trim()) return;
    
    try {
      const reportRef = collection(db, 'reports');
      await addDoc(reportRef, {
        messageId: selectedPostId,
        reportedBy: auth.currentUser.uid,
        reportedUserId: messages.find(m => m.id === selectedPostId)?.userId,
        timestamp: serverTimestamp(),
        status: 'pending',
        reason: reportReason,
        details: reportDetails
      });
      
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
      setSelectedPostId(null);
      alert('Post reported. Our moderators will review it.');
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handlePin = async (messageId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      await updateDoc(messageRef, {
        isPinned: !messageDoc.data().isPinned
      });
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      await deleteDoc(doc(db, 'community_messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCommentDelete = async (messageId, commentId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      const comments = messageDoc.data().comments || [];
      
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = async (messageId, commentId, replyText) => {
    if (!auth.currentUser) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      const comments = messageDoc.data().comments || [];

      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), {
              id: Date.now().toString(),
              text: replyText,
              userId: auth.currentUser.uid,
              username: user.username,
              timestamp: new Date().toISOString(),
              votes: 0,
              userVotes: {}
            }]
          };
        }
        return comment;
      });

      await updateDoc(messageRef, {
        comments: updatedComments
      });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleMarkReportAsDone = async (reportId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: auth.currentUser.uid
      });
    } catch (error) {
      console.error('Error marking report as done:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const filteredMessages = messages
    .filter(message => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return message.title.toLowerCase().includes(searchLower) || 
               message.id.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'new':
          return b.timestamp - a.timestamp;
        case 'top':
          return b.votes - a.votes;
        case 'hot':
          const scoreA = b.votes + (b.comments?.length || 0) * 2;
          const scoreB = a.votes + (a.comments?.length || 0) * 2;
          return scoreB - scoreA;
        default:
          return 0;
      }
    });

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredMessages.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredMessages.length / POSTS_PER_PAGE);

  const communityRules = [
    "Be respectful and civil - No harassment, hate speech, or personal attacks",
    "No spam or self-promotion - Including referral links or excessive self-promotion",
    "No NSFW content - Keep content family-friendly and appropriate",
    "Use appropriate flairs - Tag your posts correctly",
    "Follow Reddit's content policy - Adhere to general content guidelines",
    "No harassment or bullying - Zero tolerance for targeted harassment",
    "Keep discussions on topic - Stay relevant to the community",
    "No duplicate posts - Check before posting similar content",
    "Verify information - Don't spread misinformation",
    "Respect privacy - Don't share personal information",
    "Use appropriate language - No excessive profanity",
    "Follow formatting guidelines - Make posts readable and clear",
    "Credit original content - Give credit where due",
    "No political discussions - Keep community neutral",
    "Report violations - Help maintain community standards"
  ];

  return (
    <div className="min-h-screen bg-[#030303]">
      <CommunityBanner />
      
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <CommunityHeader />

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

            <div className="bg-[#141414] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts by title or ID..."
                  className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] pl-10"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#141414] p-4 rounded-lg border border-[#2a2a2a]">
              <PostFilters 
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedTimeframe={selectedTimeframe}
                setSelectedTimeframe={setSelectedTimeframe}
              />
            </div>

            {auth.currentUser?.email === 'andres_rios_xyz@outlook.com' && (
              <div className="bg-[#141414] p-4 rounded-lg border border-[#2a2a2a]">
                <button
                  onClick={() => setShowReports(!showReports)}
                  className="flex items-center space-x-2 text-white mb-4"
                >
                  <FaExclamationTriangle className="text-red-500" />
                  <span>Show Reports ({reports.length})</span>
                </button>

                {showReports && (
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div
                        key={report.id}
                        className="bg-[#1f1f1f] p-4 rounded-lg border border-[#2a2a2a]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white">
                              <span className="text-gray-400">Reporter ID:</span> {report.reportedBy}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Reported User ID:</span> {report.reportedUserId}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Post ID:</span> {report.messageId}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Reason:</span> {report.reason}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Details:</span> {report.details}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Status:</span>{' '}
                              <span className={report.status === 'resolved' ? 'text-green-500' : 'text-yellow-500'}>
                                {report.status}
                              </span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {report.status === 'pending' && (
                              <button
                                onClick={() => handleMarkReportAsDone(report.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-white text-black'
                        : 'bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Sidebar 
            communityStats={communityStats}
            communityRules={communityRules}
            announcement={announcement}
          />
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1B] p-6 rounded-lg w-96 border border-[#343536]">
            <h3 className="text-xl font-bold text-white mb-4">Report Post</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Reason</label>
                <input
                  type="text"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Enter reason for report"
                  className="w-full bg-[#272729] text-white px-4 py-2 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC]"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Details</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide additional details"
                  className="w-full bg-[#272729] text-white px-4 py-2 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC] min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDetails('');
                    setSelectedPostId(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;