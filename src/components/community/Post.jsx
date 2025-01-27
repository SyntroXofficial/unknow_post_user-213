import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserCircle, FaArrowUp, FaArrowDown, FaRegCommentAlt,
  FaFlag, FaThumbtack, FaTrash
} from 'react-icons/fa';
import { auth } from '../../firebase';
import Comment from './Comment';

function Post({ 
  message, 
  user,
  showComments,
  setShowComments,
  handleVote,
  handleComment,
  handleReport,
  handlePin,
  handleDelete,
  newComments,
  setNewComments,
  onReply,
  onCommentVote,
  onCommentDelete
}) {
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

  const isImageUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null || 
           url.includes('imgur.com') ||
           url.includes('ibb.co') ||
           url.includes('postimg.cc') ||
           url.includes('piximg.com');
  };

  const processContent = (text) => {
    if (!text) return '';
    
    // Split by newlines first to preserve line breaks
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const words = line.split(' ');
      const elements = [];
      let currentText = '';

      words.forEach((word, index) => {
        if (isImageUrl(word)) {
          if (currentText) {
            elements.push(<span key={`text-${lineIndex}-${index}`}>{currentText}</span>);
            currentText = '';
          }
          elements.push(
            <div key={`img-${lineIndex}-${index}`} className="my-4">
              <img 
                src={word} 
                alt="User shared content" 
                className="max-w-full rounded-lg max-h-96 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          );
        } else {
          currentText += (index === 0 ? '' : ' ') + word;
        }
      });

      if (currentText) {
        elements.push(<span key={`text-${lineIndex}-final`}>{currentText}</span>);
      }

      // Add a line break after each line except the last one
      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {elements}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const getTagColor = (tag) => {
    const colors = {
      gaming: 'bg-blue-500',
      movies: 'bg-purple-500',
      important: 'bg-red-500',
      information: 'bg-green-500',
      news: 'bg-yellow-500',
      default: 'bg-gray-500'
    };
    return colors[tag.toLowerCase()] || colors.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-[#2a2a2a] rounded-md"
    >
      <div className="p-4 max-w-3xl">
        <div className="flex flex-col space-y-1 mb-2">
          <div className="flex items-center space-x-2">
            {message.isPinned && (
              <FaThumbtack className="text-green-500 w-4 h-4" />
            )}
            <span className="text-gray-400">Posted by</span>
            <div className="flex items-center space-x-2">
              {message.userId === user?.id && user?.profilePicUrl ? (
                <img 
                  src={user.profilePicUrl}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-white font-medium">{message.username}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">
              {message.timestamp?.toDate().toLocaleDateString()}
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            <span>User ID: {message.userId}</span>
            <span className="mx-2">•</span>
            <span>Post ID: {message.id}</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">{message.title}</h2>
          {message.tags && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`px-2 py-1 rounded-full text-white text-sm ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-white mb-4 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {processContent(message.text)}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote(message.id, 1)}
              className={`text-gray-400 hover:text-purple-500 transition-colors ${
                message.userVotes?.[user?.id] === 1 ? 'text-purple-500' : ''
              }`}
            >
              <FaArrowUp className="w-5 h-5" />
            </button>
            <span className={`${
              message.userVotes?.[user?.id] === 1 ? 'text-purple-500' :
              message.userVotes?.[user?.id] === -1 ? 'text-red-500' :
              'text-white'
            }`}>{message.votes}</span>
            <button
              onClick={() => handleVote(message.id, -1)}
              className={`text-gray-400 hover:text-red-500 transition-colors ${
                message.userVotes?.[user?.id] === -1 ? 'text-red-500' : ''
              }`}
            >
              <FaArrowDown className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowComments(prev => ({
              ...prev,
              [message.id]: !prev[message.id]
            }))}
            className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded"
          >
            <FaRegCommentAlt />
            <span>{message.comments?.length || 0} Comments</span>
          </button>

          {user?.email === 'andres_rios_xyz@outlook.com' && (
            <>
              <button 
                onClick={() => handlePin(message.id)}
                className={`flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded ${
                  message.isPinned ? 'text-green-500' : ''
                }`}
              >
                <FaThumbtack />
                <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
              </button>
              <button 
                onClick={() => handleDelete(message.id)}
                className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded text-red-500"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </>
          )}

          <button 
            onClick={() => handleReport(message.id)}
            className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded text-red-500"
          >
            <FaFlag />
            <span>Report</span>
          </button>
        </div>

        {showComments[message.id] && (
          <div className="border-t border-[#2a2a2a] p-4 mt-4">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                {user?.profilePicUrl ? (
                  <img 
                    src={user.profilePicUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComments[message.id] || ''}
                  onChange={(e) => setNewComments(prev => ({
                    ...prev,
                    [message.id]: e.target.value
                  }))}
                  placeholder="What are your thoughts?"
                  className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleComment(message.id)}
                    className="px-4 py-1 bg-white text-[#1A1A1B] rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {message.comments?.map((comment) => (
                <Comment 
                  key={comment.id} 
                  comment={comment}
                  user={user}
                  onReply={onReply}
                  onVote={(commentId, direction) => onCommentVote(message.id, commentId, direction)}
                  onDelete={(commentId) => onCommentDelete(message.id, commentId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Post;