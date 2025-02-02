import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaPaperPlane, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { moderateContent, processContent } from '../../utils/contentModeration';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userData, setUserData] = useState({});
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('timestamp', 'asc'), // Changed to ascending order
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = [];
      const changes = snapshot.docChanges();
      let shouldScroll = false;

      // Only scroll if a new message is added
      changes.forEach(change => {
        if (change.type === 'added' && change.doc.data().timestamp) {
          shouldScroll = true;
        }
      });

      for (const docSnapshot of snapshot.docs) {
        const messageData = { id: docSnapshot.id, ...docSnapshot.data() };
        if (!userData[messageData.userId]) {
          const userDoc = await getDoc(doc(db, 'users', messageData.userId));
          if (userDoc.exists()) {
            setUserData(prev => ({
              ...prev,
              [messageData.userId]: userDoc.data()
            }));
          }
        }
        newMessages.push(messageData); // Changed from unshift to push
      }
      setMessages(newMessages);
      if (shouldScroll) {
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const moderationResult = moderateContent(newMessage.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const username = userDoc.data()?.username || 'Anonymous';

      await addDoc(collection(db, 'chat_messages'), {
        text: newMessage.trim(),
        userId: auth.currentUser.uid,
        username: username,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleDelete = async (messageId, userId) => {
    if (!auth.currentUser) return;
    
    if (isAdmin || userId === auth.currentUser.uid) {
      try {
        await deleteDoc(doc(db, 'chat_messages', messageId));
      } catch (error) {
        console.error('Error deleting message:', error);
        setError('Failed to delete message');
      }
    }
  };

  const handleEdit = async (messageId) => {
    if (!editText.trim()) return;

    const moderationResult = moderateContent(editText.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    try {
      await updateDoc(doc(db, 'chat_messages', messageId), {
        text: editText.trim(),
        edited: true,
        editedAt: serverTimestamp()
      });
      setEditingMessage(null);
      setEditText('');
      setError('');
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
    }
  };

  const startEdit = (message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
  };

  return (
    <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
      <div
        ref={chatContainerRef}
        className="h-[300px] overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.userId === auth.currentUser?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {userData[message.userId]?.profilePicUrl ? (
                <img 
                  src={userData[message.userId].profilePicUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=?';
                  }}
                />
              ) : (
                <FaUserCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[70%] ${
                message.userId === auth.currentUser?.uid
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#272729] text-white'
              } rounded-lg p-3`}
            >
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/70">{userData[message.userId]?.username || message.username || 'Anonymous'}</p>
                  <div className="flex items-center text-[10px] text-white/50">
                    <FaClock className="w-3 h-3 mr-1" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                <p className="text-[10px] text-white/50 font-mono">{message.userId}</p>
              </div>
              
              {editingMessage === message.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-black/30 text-white p-2 rounded border border-white/20 focus:outline-none focus:border-white/40"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingMessage(null);
                        setEditText('');
                      }}
                      className="px-2 py-1 text-sm text-white/70 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(message.id)}
                      className="px-2 py-1 text-sm bg-white/10 rounded hover:bg-white/20"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="text-sm break-words"
                    dangerouslySetInnerHTML={{ __html: processContent(message.text) }}
                  />
                  {message.edited && (
                    <p className="text-[10px] text-white/50 mt-1">(edited)</p>
                  )}
                </>
              )}

              {auth.currentUser && (message.userId === auth.currentUser.uid || isAdmin) && (
                <div className="flex justify-end space-x-2 mt-2">
                  {message.userId === auth.currentUser.uid && (
                    <button
                      onClick={() => startEdit(message)}
                      className="text-white/50 hover:text-white"
                    >
                      <FaEdit className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id, message.userId)}
                    className="text-white/50 hover:text-white"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#343536]">
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message... (You can paste image URLs)"
            className="flex-1 bg-[#272729] text-white px-4 py-2 rounded-lg border border-[#343536] focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;