import { useState, useEffect, useCallback } from 'react';
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
  increment,
  writeBatch
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
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState(new Map());

  // Cache user data
  const getUserData = useCallback(async (userId) => {
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    const userDocRef = doc(db, 'users', userId);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserCache(prev => new Map(prev).set(userId, userData));
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  }, [userCache]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userData = await getUserData(currentUser.uid);
        setUser({ ...userData, id: currentUser.uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [getUserData]);

  useEffect(() => {
    let unsubscribeMessages = () => {};
    let unsubscribeReports = () => {};

    if (user) {
      const messagesQuery = query(
        collection(db, 'community_messages'),
        orderBy('timestamp', 'desc')
      );

      // Use a batch to update user data for messages
      const updateMessageUserData = async (messages) => {
        const userPromises = messages.map(async (message) => {
          if (message.userId) {
            message.userData = await getUserData(message.userId);
            
            if (message.comments) {
              await Promise.all(message.comments.map(async (comment) => {
                if (comment.userId) {
                  comment.userData = await getUserData(comment.userId);
                }
                if (comment.replies) {
                  await Promise.all(comment.replies.map(async (reply) => {
                    if (reply.userId) {
                      reply.userData = await getUserData(reply.userId);
                    }
                  }));
                }
              }));
            }
          }
          return message;
        });

        const updatedMessages = await Promise.all(userPromises);
        setMessages(updatedMessages);
      };

      unsubscribeMessages = onSnapshot(messagesQuery, 
        (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          updateMessageUserData(messagesData);
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );

      if (user.email === 'andres_rios_xyz@outlook.com') {
        const reportsQuery = query(
          collection(db, 'reports'),
          orderBy('timestamp', 'desc')
        );

        unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
          const newReports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setReports(newReports);
        });
      }

      // Update community stats every 30 seconds instead of every minute
      const fetchCommunityStats = async () => {
        try {
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
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
      const statsInterval = setInterval(fetchCommunityStats, 30000);

      return () => {
        unsubscribeMessages();
        unsubscribeReports();
        clearInterval(statsInterval);
      };
    }
  }, [user, getUserData]);

  const handleVote = async (messageId, direction) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const batch = writeBatch(db);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;
      
      const currentVotes = messageDoc.data().votes || 0;
      const userVotes = messageDoc.data().userVotes || {};
      const currentUserVote = userVotes[user.id] || 0;

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

      batch.update(messageRef, {
        votes: newVoteCount,
        [`userVotes.${user.id}`]: newUserVote
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleComment = async (messageId, commentText) => {
    if (!commentText?.trim() || !user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const batch = writeBatch(db);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;
      
      const currentComments = messageDoc.data().comments || [];
      
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
        votes: 0,
        userVotes: {},
        replies: []
      };

      batch.update(messageRef, {
        comments: [...currentComments, newComment]
      });

      await batch.commit();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReport = async (messageId, contentId, type, reason, details) => {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      const reportRef = doc(collection(db, 'reports'));
      const messageRef = doc(db, 'community_messages', messageId);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        console.error('Message not found');
        return;
      }

      const messageData = messageDoc.data();
      let reportedUserId = messageData.userId;

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
      
      batch.set(reportRef, {
        messageId,
        contentId,
        contentType: type,
        reportedBy: user.id,
        reportedUserId,
        timestamp: serverTimestamp(),
        status: 'pending',
        reason: reason || 'No reason provided',
        details: details || 'No details provided'
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reporting content:', error);
    }
  };

  const handlePin = async (messageId) => {
    if (!user || user.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const batch = writeBatch(db);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;
      
      batch.update(messageRef, {
        isPinned: !messageDoc.data().isPinned
      });

      await batch.commit();
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!user) return;
    
    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      // Allow deletion if user is admin or the message owner
      if (user.email === 'andres_rios_xyz@outlook.com' || messageDoc.data().userId === user.id) {
        const batch = writeBatch(db);
        batch.delete(messageRef);
        await batch.commit();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCommentVote = async (messageId, commentId, direction) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const batch = writeBatch(db);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;
      
      const comments = messageDoc.data().comments || [];
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const currentVotes = comment.votes || 0;
          const userVotes = comment.userVotes || {};
          const currentUserVote = userVotes[user.id] || 0;

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
              [user.id]: newUserVote
            }
          };
        }
        
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              const currentVotes = reply.votes || 0;
              const userVotes = reply.userVotes || {};
              const currentUserVote = userVotes[user.id] || 0;

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
                  [user.id]: newUserVote
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

      batch.update(messageRef, { comments: updatedComments });
      await batch.commit();
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
      let updatedComments = [...comments];
      let commentFound = false;

      // First try to find and delete a reply
      updatedComments = updatedComments.map(comment => {
        if (comment.replies) {
          const originalRepliesLength = comment.replies.length;
          comment.replies = comment.replies.filter(reply => {
            if (reply.id === commentId) {
              const canDelete = reply.userId === auth.currentUser.uid || 
                              auth.currentUser.email === 'andres_rios_xyz@outlook.com';
              if (canDelete) {
                commentFound = true;
                return false; // Remove this reply
              }
            }
            return true;
          });
          
          if (comment.replies.length !== originalRepliesLength) {
            return { ...comment };
          }
        }
        return comment;
      });

      // If no reply was found, try to delete the comment itself
      if (!commentFound) {
        updatedComments = updatedComments.filter(comment => {
          if (comment.id === commentId) {
            const canDelete = comment.userId === auth.currentUser.uid || 
                            auth.currentUser.email === 'andres_rios_xyz@outlook.com';
            return !canDelete; // Keep comment if we can't delete it
          }
          return true;
        });
      }

      // Update the database
      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment/reply:', error);
    }
  };

  const handleReply = async (messageId, commentId, replyText) => {
    if (!user || !replyText?.trim()) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const batch = writeBatch(db);
      
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) return;
      
      const comments = messageDoc.data().comments || [];
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const replies = comment.replies || [];
          const newReply = {
            id: Date.now().toString(),
            text: replyText,
            userId: user.id,
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

      batch.update(messageRef, { comments: updatedComments });
      await batch.commit();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleMarkReportAsDone = async (reportId) => {
    if (!user || user.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const reportRef = doc(db, 'reports', reportId);
      const batch = writeBatch(db);
      
      batch.update(reportRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: user.id
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking report as done:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!user || user.email !== 'andres_rios_xyz@outlook.com') return;
    
    try {
      const reportRef = doc(db, 'reports', reportId);
      const batch = writeBatch(db);
      batch.delete(reportRef);
      await batch.commit();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleEditMessage = async (messageId, newText, newTitle, newTags) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      const messageData = messageDoc.data();

      // Only allow edit if user is author or admin
      if (messageData.userId !== user.id && user.email !== 'andres_rios_xyz@outlook.com') {
        return;
      }

      const updates = {
        text: newText,
        title: newTitle,
        tags: newTags || [], // Ensure tags is always an array
        editedAt: serverTimestamp()
      };

      await updateDoc(messageRef, updates);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleEditComment = async (messageId, commentId, newText) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      const comments = messageDoc.data().comments || [];
      
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          // Only allow edit if user is author or admin
          if (comment.userId === user.id || user.email === 'andres_rios_xyz@outlook.com') {
            return {
              ...comment,
              text: newText,
              editedAt: new Date().toISOString()
            };
          }
        }
        return comment;
      });

      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleEditReply = async (messageId, commentId, replyId, newText) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'community_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      const comments = messageDoc.data().comments || [];
      
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const updatedReplies = (comment.replies || []).map(reply => {
            if (reply.id === replyId) {
              // Only allow edit if user is author or admin
              if (reply.userId === user.id || user.email === 'andres_rios_xyz@outlook.com') {
                return {
                  ...reply,
                  text: newText,
                  editedAt: new Date().toISOString()
                };
              }
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });

      await updateDoc(messageRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error editing reply:', error);
    }
  };

  return {
    messages,
    user,
    communityStats,
    reports,
    loading,
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
  };
}