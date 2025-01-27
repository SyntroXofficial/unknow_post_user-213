import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaArrowUp, FaArrowDown, FaRegCommentAlt, FaShare, 
  FaUserCircle, FaFlag, FaThList, FaThLarge
} from 'react-icons/fa';
import Comment from './Comment';

function Post({ 
  message, 
  user,
  showComments,
  setShowComments,
  handleVote,
  handleComment,
  handleShare,
  handleReport,
  newComments,
  setNewComments,
  viewMode
}) {
  // Function to check if string is an image URL
  const isImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  // Function to detect and replace image URLs in text
  const processContent = (text) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      if (isImageUrl(word)) {
        return (
          <div key={index} className="my-4">
            <img 
              src={word} 
              alt="User shared content" 
              className="max-w-full rounded-lg"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        );
      }
      return word + ' ';
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#141414] border border-[#2a2a2a] rounded-md ${
        viewMode === 'horizontal' ? 'flex gap-4' : ''
      }`}
    >
      {/* Vote buttons */}
      <div className={`flex ${viewMode === 'horizontal' ? 'flex-col p-4' : 'p-4'}`}>
        <button
          onClick={() => handleVote(message.id, 1)}
          className={`text-gray-400 hover:text-purple-500 transition-colors ${
            message.userVotes?.[user?.id] === 1 ? 'text-purple-500' : ''
          }`}
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
        <span className={`mx-2 ${
          message.userVotes?.[user?.id] === 1 ? 'text-purple-500' :
          message.userVotes?.[user?.id] === -1 ? 'text-purple-500' :
          'text-white'
        }`}>{message.votes}</span>
        <button
          onClick={() => handleVote(message.id, -1)}
          className={`text-gray-400 hover:text-purple-500 transition-colors ${
            message.userVotes?.[user?.id] === -1 ? 'text-purple-500' : ''
          }`}
        >
          <FaArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Post content */}
      <div className="flex-1 p-4">
        <div className="flex items-center space-x-2 mb-2">
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
          <span className="text-gray-400 text-sm">#{message.userId}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">
            {message.timestamp?.toDate().toLocaleDateString()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{message.title}</h2>
        <div className="text-white mb-4 whitespace-pre-wrap">
          {processContent(message.text)}
        </div>

        {/* Post actions */}
        <div className="flex items-center space-x-4 text-gray-400">
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
          <button 
            onClick={() => handleShare(message.id)}
            className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded"
          >
            <FaShare />
            <span>Share</span>
          </button>
          <button 
            onClick={() => handleReport(message.id)}
            className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded text-red-500"
          >
            <FaFlag />
            <span>Report</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments[message.id] && (
          <div className="border-t border-[#2a2a2a] p-4 mt-4">
            {/* Comment input */}
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

            {/* Comments list */}
            <div className="space-y-4">
              {message.comments?.map((comment) => (
                <Comment 
                  key={comment.id} 
                  comment={comment}
                  user={user}
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