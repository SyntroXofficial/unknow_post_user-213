import React, { useState } from 'react';
import { FaUserCircle, FaArrowUp, FaArrowDown, FaReply, FaTrash } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Comment({ comment, user, onReply, onVote, onDelete }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [commentUser, setCommentUser] = useState(null);
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', comment.userId));
        if (userDoc.exists()) {
          setCommentUser(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [comment.userId]);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
        {commentUser?.profilePicUrl ? (
          <img 
            src={commentUser.profilePicUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white font-medium">{comment.username}</span>
          {comment.userId === 'andres_rios_xyz@outlook.com' && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Admin</span>
          )}
          <span className="text-gray-400 text-sm">#{comment.userId}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400 text-sm">
            {new Date(comment.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-white">{comment.text}</p>
        <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onVote(comment.id, 1)}
              className={`hover:bg-[#272729] p-1 rounded ${comment.userVotes?.[user?.id] === 1 ? 'text-purple-500' : ''}`}
            >
              <FaArrowUp className="w-4 h-4" />
            </button>
            <span>{comment.votes || 0}</span>
            <button 
              onClick={() => onVote(comment.id, -1)}
              className={`hover:bg-[#272729] p-1 rounded ${comment.userVotes?.[user?.id] === -1 ? 'text-red-500' : ''}`}
            >
              <FaArrowDown className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)} 
            className="hover:bg-[#272729] px-2 py-1 rounded flex items-center space-x-1"
          >
            <FaReply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => onDelete(comment.id)}
              className="hover:bg-[#272729] px-2 py-1 rounded text-red-500 flex items-center space-x-1"
            >
              <FaTrash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-4 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[80px]"
              placeholder="Write your reply..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReplyInput(false)}
                className="px-4 py-1 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-4 py-1 bg-white text-[#1A1A1B] rounded-full text-sm font-bold hover:bg-gray-200"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {comment.replies?.map((reply) => (
          <div key={reply.id} className="mt-4 ml-8">
            <Comment 
              comment={reply} 
              user={user} 
              onReply={onReply}
              onVote={onVote}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comment;