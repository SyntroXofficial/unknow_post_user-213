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
  addDoc,
  deleteDoc,
  increment
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
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), id: auth.currentUser.uid });
        }

        // Set up real-time listener for the current user's data
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser({ ...doc.data(), id: auth.currentUser.uid });
          }
        });

        return () => unsubscribeUser();
      }
    };

    fetchUserData();

    const messagesQuery = query(collection(db, 'community_messages'), orderBy('timestamp', 'desc'));
    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, async (snapshot) => {
      const messagesData = [];
      for (const docSnapshot of snapshot.docs) {
        const messageData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Fetch user data for the message author
        if (messageData.userId) {
          const userDocRef = doc(db, 'users', messageData.userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            messageData.userData = userDoc.data();
          }
        }

        // Fetch user data for comments
        if (messageData.comments) {
          for (const comment of messageData.comments) {
            if (comment.userId) {
              const userDocRef = doc(db, 'users', comment.userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                comment.userData = userDoc.data();
              }
            }

            // Fetch user data for replies
            if (comment.replies) {
              for (const reply of comment.replies) {
                if (reply.userId) {
                  const userDocRef = doc(db, 'users', reply.userId);
                  const userDoc = await getDoc(userDocRef);
                  if (userDoc.exists()) {
                    reply.userData = userDoc.data();
                  }
                }
              }
            }
          }
        }

        messagesData.push(messageData);
      }
      setMessages(messagesData);
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

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const currentVotes = messageDoc.data().votes || 0;
      const userVotes = messageDoc.data().userVotes || {};
      const currentUserVote = userVotes[auth.currentUser.uid] || 0;

      let newVoteCount = currentVotes;
      let newUserVote = direction;

      // If user is clicking the same vote button again, remove their vote
      if (currentUserVote === direction) {
        newVoteCount -= direction;
        newUserVote = 0;
      } else {
        // Remove previous vote if it exists
        if (currentUserVote !== 0) {
          newVoteCount -= currentUserVote;
        }
        // Add new vote
        newVoteCount += direction;
      }

      await updateDoc(messageRef, {
        votes: newVoteCount,
        [`userVotes.${auth.currentUser.uid}`]: newUserVote
      });
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleComment = async (messageId, commentText) => {
    if (!commentText?.trim() || !auth.currentUser) return;

    try {
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
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReport = async (messageId, contentId, type, reason, details) => {
    if (!auth.currentUser) return;
    
    try {
      const reportRef = collection(db, 'reports');
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        console.error('Message not found');
        return;
      }

      const messageData = messageDoc.data();
      let reportedUserId = messageData.userId;

      // If reporting a comment or reply, find the correct user ID
      if (type === 'comment' || type === 'reply') {
        const comment = messageData.comments?.find(c => 
          c.id === contentId || c.replies?.some(r => r.id === contentId)
        );
        if (comment) {
          if (type === 'comment') {
            reportedUserId = comment.userId;
          } else {
            const reply = comment.replies?.find(r => r.id === contentId);
            if (reply) {
              reportedUserId = reply.userId;
            }
          }
        }
      }
      
      await addDoc(reportRef, {
        messageId,
        contentId,
        contentType: type,
        reportedBy: auth.currentUser.uid,
        reportedUserId,
        timestamp: serverTimestamp(),
        status: 'pending',
        reason: reason || 'No reason provided',
        details: details || 'No details provided'
      });
    } catch (error) {
      console.error('Error reporting content:', error);
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
      const messageRef = doc(db, 'community_messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCommentVote = async (messageId, commentId, direction) => {
    if (!auth.currentUser) return;

    try {
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
            if (currentUserVote !== 0) {
              newVoteCount -= currentUserVote;
            }
            newVoteCount += direction;
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
        
        // Check for votes in replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              const currentVotes = reply.votes || 0;
              const userVotes = reply.userVotes || {};
              const currentUserVote = userVotes[auth.currentUser.uid] || 0;

              let newVoteCount = currentVotes;
              let newUserVote = direction;

              if (currentUserVote === direction) {
                newVoteCount -= direction;
                newUserVote = 0;
              } else {
                if (currentUserVote !== 0) {
                  newVoteCount -= currentUserVote;
                }
                newVoteCount += direction;
              }

              return {
                ...reply,
                votes: newVoteCount,
                userVotes: {
                  ...userVotes,
                  [auth.currentUser.uid]: newUserVote
                }
              };
            }
            return reply;
          });

          return {
            ...comment,
            replies: updatedReplies
          };
        }

        return comment;
      });

      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleCommentDelete = async (messageId, commentId) => {
    if (!auth.currentUser) return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const comments = messageDoc.data().comments || [];
      const updatedComments = comments.filter(comment => {
        if (comment.id === commentId) {
          return !(auth.currentUser.email === 'andres_rios_xyz@outlook.com' || 
                  comment.userId === auth.currentUser.uid);
        }
        if (comment.replies) {
          comment.replies = comment.replies.filter(reply => 
            reply.id !== commentId || 
            !(auth.currentUser.email === 'andres_rios_xyz@outlook.com' || 
              reply.userId === auth.currentUser.uid)
          );
        }
        return true;
      });
      
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
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);
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