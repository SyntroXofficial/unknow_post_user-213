import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaPaperPlane, FaImage } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { moderateContent, processContent } from '../../utils/contentModeration';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userData, setUserData] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = [];
      for (const docSnapshot of snapshot.docs) {
        const messageData = { id: docSnapshot.id, ...docSnapshot.data() };
        // Fetch user data if not already cached
        if (!userData[messageData.userId]) {
          const userDoc = await getDoc(doc(db, 'users', messageData.userId));
          if (userDoc.exists()) {
            setUserData(prev => ({
              ...prev,
              [messageData.userId]: userDoc.data()
            }));
          }
        }
        newMessages.unshift(messageData);
      }
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden">
      {/* Messages */}
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
                <p className="text-xs text-white/70">{userData[message.userId]?.username || message.username || 'Anonymous'}</p>
                <p className="text-[10px] text-white/50 font-mono">{message.userId}</p>
              </div>
              <div 
                className="text-sm break-words"
                dangerouslySetInnerHTML={{ __html: processContent(message.text) }}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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