import { useState, useEffect } from 'react';
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

export function useCommunityData() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    dailyPosts: 0,
    dailyComments: 0
  });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), id: auth.currentUser.uid });
        }
      }
    };

    fetchUserData();

    const messagesQuery = query(collection(db, 'community_messages'), orderBy('timestamp', 'desc'));
    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        comments: doc.data().comments || []
      }));
      setMessages(newMessages);
    });

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
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

    fetchCommunityStats();
    const statsInterval = setInterval(fetchCommunityStats, 60000);

    return () => {
      unsubscribeMessages();
      unsubscribeReports();
      clearInterval(statsInterval);
    };
  }, []);

  const handleVote = async (messageId, direction) => {
    if (!auth.currentUser) return;

    const messageRef = doc(db, 'community_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
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

  const handleComment = async (messageId, commentText) => {
    if (!commentText?.trim() || !auth.currentUser) return;

    const messageRef = doc(db, 'community_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
    const currentComments = messageDoc.data().comments || [];
    
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      userId: auth.currentUser.uid,
      username: user.username,
      timestamp: new Date().toISOString(),
      votes: 0,
      userVotes: {},
      replies: []
    };

    await updateDoc(messageRef, {
      comments: [...currentComments, newComment]
    });
  };

  const handleReport = async (messageId, reason, details) => {
    if (!auth.currentUser) return;
    
    try {
      const reportRef = collection(db, 'reports');
      const messageDoc = await getDoc(doc(db, 'community_messages', messageId));
      
      if (!messageDoc.exists()) {
        console.error('Message not found');
        return;
      }

      const messageData = messageDoc.data();
      
      await addDoc(reportRef, {
        messageId,
        reportedBy: auth.currentUser.uid,
        reportedUserId: messageData.userId,
        timestamp: serverTimestamp(),
        status: 'pending',
        reason: reason || 'No reason provided',
        details: details || 'No details provided'
      });
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handlePin = async (messageId) => {
    if (!auth.currentUser || auth.currentUser.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const currentData = messageDoc.data();
      
      await updateDoc(messageRef, {
        isPinned: !currentData.isPinned
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

  const handleCommentVote = async (messageId, commentId, direction) => {
    if (!auth.currentUser) return;

    const messageRef = doc(db, 'community_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) return;
    
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

  const handleCommentDelete = async (messageId, commentId) => {
    if (!auth.currentUser) return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const comments = messageDoc.data().comments || [];
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          // If it's a reply, filter it out from the parent comment's replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => 
                auth.currentUser.email === 'andres_rios_xyz@outlook.com' || 
                reply.userId === auth.currentUser.uid
              )
            };
          }
          // For main comments, only allow deletion if admin or comment owner
          return auth.currentUser.email === 'andres_rios_xyz@outlook.com' || 
                 comment.userId === auth.currentUser.uid ? null : comment;
        }
        return comment;
      }).filter(Boolean); // Remove null entries
      
      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = async (messageId, commentId, replyText) => {
    if (!auth.currentUser || !replyText?.trim()) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const comments = messageDoc.data().comments || [];
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const replies = comment.replies || [];
          const newReply = {
            id: Date.now().toString(),
            text: replyText,
            userId: auth.currentUser.uid,
            username: user.username,
            timestamp: new Date().toISOString(),
            votes: 0,
            userVotes: {}
          };
          
          return {
            ...comment,
            replies: [...replies, newReply]
          };
        }
        return comment;
      });

      await updateDoc(messageRef, { comments: updatedComments });
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

  return {
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
  };
}