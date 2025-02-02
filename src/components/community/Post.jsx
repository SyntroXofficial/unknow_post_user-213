import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserCircle, FaArrowUp, FaArrowDown, FaRegCommentAlt,
  FaFlag, FaThumbtack, FaTrash, FaEdit
} from 'react-icons/fa';
import { auth } from '../../firebase';
import Comment from './Comment';
import { moderateContent, processContent } from '../../utils/contentModeration';

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
  onCommentDelete,
  onEditMessage,
  onEditComment,
  onEditReply,
  setShowReportModal,
  setSelectedPostId
}) {
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [editedTitle, setEditedTitle] = useState(message.title);
  const [editedTags, setEditedTags] = useState(message.tags || []);
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';
  const canEdit = isAdmin || message.userId === auth.currentUser?.uid;
  const canDelete = isAdmin || message.userId === auth.currentUser?.uid;

  const availableTags = [
    { name: 'Gaming', color: 'bg-blue-500' },
    { name: 'Movies', color: 'bg-purple-500' },
    { name: 'Important', color: 'bg-red-500' },
    { name: 'Information', color: 'bg-green-500' },
    { name: 'News', color: 'bg-yellow-500' },
    { name: 'Problems', color: 'bg-orange-500' },
    { name: 'Suggestions', color: 'bg-indigo-500' },
    { name: 'Talk', color: 'bg-pink-500' }
  ];

  const handleReportClick = () => {
    setSelectedPostId(message.id);
    setShowReportModal(true);
  };

  const handleCommentSubmit = () => {
    if (!newComments[message.id]?.trim()) return;

    const moderationResult = moderateContent(newComments[message.id].trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    handleComment(message.id, newComments[message.id]);
    setNewComments(prev => ({
      ...prev,
      [message.id]: ''
    }));
    setError('');
  };

  const handleEditSubmit = () => {
    if (!editedText.trim() || !editedTitle.trim()) return;

    const moderationResult = moderateContent(editedText.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    const titleModeration = moderateContent(editedTitle.trim());
    if (!titleModeration.isValid) {
      setError(titleModeration.reason);
      return;
    }

    onEditMessage(message.id, editedText.trim(), editedTitle.trim(), editedTags);
    setIsEditing(false);
    setError('');
  };

  const toggleTag = (tag) => {
    if (editedTags.includes(tag)) {
      setEditedTags(editedTags.filter(t => t !== tag));
    } else if (editedTags.length < 3) {
      setEditedTags([...editedTags, tag]);
    }
  };

  const handleReply = (commentId, replyText) => {
    onReply(message.id, commentId, replyText);
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
              {message.userData?.profilePicUrl ? (
                <img 
                  src={message.userData.profilePicUrl}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=?';
                  }}
                />
              ) : (
                <FaUserCircle className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-white font-medium">{message.username}</span>
              {message.userId === 'andres_rios_xyz@outlook.com' && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  Admin
                </span>
              )}
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
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a]"
                placeholder="Post Title"
              />

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      editedTags.includes(tag.name) ? tag.color : 'bg-gray-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {editedTags.length === 3 && (
                <p className="text-yellow-500 text-sm">Maximum 3 tags allowed</p>
              )}

              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[120px]"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(message.text);
                    setEditedTitle(message.title);
                    setEditedTags(message.tags || []);
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">{message.title}</h2>
              {message.tags && message.tags.length > 0 && (
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
              <div 
                className="text-white mb-4 whitespace-pre-wrap max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: processContent(message.text) }}
              />
            </>
          )}
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

          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded"
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={() => handlePin(message.id)}
              className={`flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded ${
                message.isPinned ? 'text-green-500' : ''
              }`}
            >
              <FaThumbtack />
              <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
          )}

          {canDelete && (
            <button 
              onClick={() => handleDelete(message.id)}
              className="flex items-center space-x-2 hover:bg-[#1f1f1f] px-2 py-1 rounded text-red-500"
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          )}

          <button 
            onClick={handleReportClick}
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=?';
                    }}
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
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCommentSubmit}
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
                  onReply={(commentId, replyText) => handleReply(commentId, replyText)}
                  onVote={onCommentVote}
                  onDelete={onCommentDelete}
                  onEdit={onEditComment}
                  onEditReply={onEditReply}
                  messageId={message.id}
                  setShowReportModal={setShowReportModal}
                  setSelectedPostId={setSelectedPostId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const getTagColor = (tag) => {
  const colors = {
    'Gaming': 'bg-blue-500',
    'Movies': 'bg-purple-500',
    'Important': 'bg-red-500',
    'Information': 'bg-green-500',
    'News': 'bg-yellow-500',
    'Problems': 'bg-orange-500',
    'Suggestions': 'bg-indigo-500',
    'Talk': 'bg-pink-500'
  };
  return colors[tag] || 'bg-gray-500';
};

export default Post;