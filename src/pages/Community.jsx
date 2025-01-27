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
  addDoc
} from 'firebase/firestore';
import CommunityBanner from '../components/community/CommunityBanner';
import CommunityHeader from '../components/community/CommunityHeader';
import CreatePost from '../components/community/CreatePost';
import PostFilters from '../components/community/PostFilters';
import Post from '../components/community/Post';
import Sidebar from '../components/community/Sidebar';
import { FaThList, FaThLarge } from 'react-icons/fa';

// Banned words list (simplified example)
const BANNED_WORDS = [
  'spam', 'scam', 'hack', 'cheat', 'crack', 'leak', 'steal', 'fraud',
  // Add more banned words as needed
];

// Content moderation function
const moderateContent = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for banned words
  const containsBannedWords = BANNED_WORDS.some(word => lowerText.includes(word));
  if (containsBannedWords) {
    return {
      isValid: false,
      reason: 'Content contains prohibited words'
    };
  }

  // Check for excessive caps (spam prevention)
  const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsPercentage > 0.7) {
    return {
      isValid: false,
      reason: 'Too many capital letters'
    };
  }

  // Check for repeated characters (spam prevention)
  if (/(.)\1{4,}/.test(text)) {
    return {
      isValid: false,
      reason: 'Repeated characters detected'
    };
  }

  // Check for minimum length
  if (text.trim().length < 2) {
    return {
      isValid: false,
      reason: 'Content is too short'
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
  const [showRules, setShowRules] = useState(false);
  const [viewMode, setViewMode] = useState('vertical');
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    dailyPosts: 0,
    dailyComments: 0
  });

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

    fetchCommunityStats();
    const statsInterval = setInterval(fetchCommunityStats, 60000);

    return () => {
      unsubscribe();
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

  const handleComment = async (messageId) => {
    if (!newComments[messageId]?.trim() || !auth.currentUser) return;

    // Moderate comment content
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
        votes: 0
      })
    });

    setNewComments(prev => ({ ...prev, [messageId]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !postTitle.trim() || !auth.currentUser || cooldown) return;

    // Moderate post content
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
        awards: []
      });
      setNewMessage('');
      setPostTitle('');
      setPostType('text');
      setShowPostOptions(false);
      setCooldown(true);
      setCooldownTime(15);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleShare = (messageId) => {
    const url = `${window.location.origin}/community/post/${messageId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleReport = async (messageId) => {
    if (!auth.currentUser) return;
    
    try {
      const reportRef = collection(db, 'reports');
      await addDoc(reportRef, {
        messageId,
        reportedBy: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      alert('Post reported. Our moderators will review it.');
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

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

  const filteredMessages = messages
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

  return (
    <div className="min-h-screen bg-[#030303]">
      <CommunityBanner />
      
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <CommunityHeader />

        <div className="flex gap-4">
          {/* Left Column - Posts */}
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
              cooldown={cooldown}
              cooldownTime={cooldownTime}
              handleSubmit={handleSubmit}
            />

            <div className="flex items-center justify-between bg-[#141414] p-4 rounded-lg border border-[#2a2a2a]">
              <PostFilters 
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedTimeframe={selectedTimeframe}
                setSelectedTimeframe={setSelectedTimeframe}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('vertical')}
                  className={`p-2 rounded ${viewMode === 'vertical' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <FaThList className="text-white" />
                </button>
                <button
                  onClick={() => setViewMode('horizontal')}
                  className={`p-2 rounded ${viewMode === 'horizontal' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <FaThLarge className="text-white" />
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Post
                  key={message.id}
                  message={message}
                  user={user}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  handleVote={handleVote}
                  handleComment={handleComment}
                  handleShare={handleShare}
                  handleReport={handleReport}
                  newComments={newComments}
                  setNewComments={setNewComments}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <Sidebar 
            communityStats={communityStats}
            showRules={showRules}
            setShowRules={setShowRules}
            communityRules={communityRules}
          />
        </div>
      </div>
    </div>
  );
}

export default Community;