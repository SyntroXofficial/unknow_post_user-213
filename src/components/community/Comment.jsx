import React, { useState } from 'react';
import { FaUserCircle, FaArrowUp, FaArrowDown, FaReply, FaTrash, FaArrowRight, FaFlag, FaEdit } from 'react-icons/fa';
import { auth } from '../../firebase';
import { moderateContent, processContent } from '../../utils/contentModeration';

function Comment({ 
  comment, 
  user,
  onReply, 
  onVote, 
  onDelete,
  onEdit,
  onEditReply,
  onReport,
  messageId,
  setShowReportModal,
  setSelectedPostId 
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';
  const canEdit = isAdmin || (auth.currentUser && comment.userId === auth.currentUser.uid);
  const canDelete = isAdmin || (auth.currentUser && comment.userId === auth.currentUser.uid);

  const handleEditSubmit = () => {
    if (!editedText.trim()) return;

    const moderationResult = moderateContent(editedText.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    onEdit(messageId, comment.id, editedText.trim());
    setIsEditing(false);
    setError('');
  };

  const handleReplySubmit = () => {
    setError('');
    
    const moderationResult = moderateContent(replyText.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleReport = (type, contentId) => {
    setSelectedPostId(messageId);
    setShowReportModal(true);
    localStorage.setItem('reportContentType', type);
    localStorage.setItem('reportContentId', contentId);
  };

  const handleDelete = () => {
    if (canDelete) {
      onDelete(messageId, comment.id);
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
        {comment.userData?.profilePicUrl ? (
          <img 
            src={comment.userData.profilePicUrl}
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

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[80px]"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(comment.text);
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
          <div 
            className="text-white whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: processContent(comment.text) }}
          />
        )}

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

          {canEdit && (
            <button 
              onClick={() => setIsEditing(true)}
              className="hover:bg-[#272729] px-2 py-1 rounded flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}

          <button 
            onClick={() => setShowReplyInput(!showReplyInput)} 
            className="hover:bg-[#272729] px-2 py-1 rounded flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
          >
            <FaReply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button 
            onClick={() => handleReport('comment', comment.id)}
            className="hover:bg-[#272729] px-2 py-1 rounded text-red-500 flex items-center space-x-1 hover:bg-red-500/10 transition-colors"
          >
            <FaFlag className="w-4 h-4" />
            <span>Report</span>
          </button>
          {canDelete && (
            <button 
              onClick={handleDelete}
              className="hover:bg-[#272729] px-2 py-1 rounded text-red-500 flex items-center space-x-1 hover:bg-red-500/10 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-4 space-y-2">
            <div className="flex items-start space-x-4">
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
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                  <FaReply className="w-3 h-3" />
                  <span>Replying to</span>
                  <span className="text-purple-400 font-medium">{comment.username}</span>
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[80px]"
                  placeholder={`Reply to ${comment.username}...`}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyText('');
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyText.trim()}
                    className={`px-4 py-2 bg-white text-black rounded-lg text-sm font-bold transition-colors ${
                      replyText.trim() ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <ReplyComponent
                key={reply.id}
                reply={reply}
                user={user}
                messageId={messageId}
                commentId={comment.id}
                onVote={onVote}
                onDelete={onDelete}
                onEdit={onEditReply}
                setShowReportModal={setShowReportModal}
                setSelectedPostId={setSelectedPostId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyComponent({
  reply,
  user,
  messageId,
  commentId,
  onVote,
  onDelete,
  onEdit,
  setShowReportModal,
  setSelectedPostId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.text);
  const [error, setError] = useState('');
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';
  const canEdit = isAdmin || (auth.currentUser && reply.userId === auth.currentUser.uid);
  const canDelete = isAdmin || (auth.currentUser && reply.userId === auth.currentUser.uid);

  const handleEditSubmit = () => {
    if (!editedText.trim()) return;

    const moderationResult = moderateContent(editedText.trim());
    if (!moderationResult.isValid) {
      setError(moderationResult.reason);
      return;
    }

    onEdit(messageId, commentId, reply.id, editedText.trim());
    setIsEditing(false);
    setError('');
  };

  const handleReport = (type, contentId) => {
    setSelectedPostId(messageId);
    setShowReportModal(true);
    localStorage.setItem('reportContentType', type);
    localStorage.setItem('reportContentId', contentId);
  };

  const handleDelete = () => {
    if (canDelete) {
      onDelete(messageId, reply.id);
    }
  };

  return (
    <div className="ml-8">
      <div className="flex items-start space-x-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          {reply.userData?.profilePicUrl ? (
            <img 
              src={reply.userData.profilePicUrl}
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
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white font-medium">{reply.username}</span>
            {reply.userId === 'andres_rios_xyz@outlook.com' && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Admin</span>
            )}
            <span className="text-gray-400 text-sm">#{reply.userId}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 text-sm">
              {new Date(reply.timestamp).toLocaleString()}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white p-3 rounded-md border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a] min-h-[80px]"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(reply.text);
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
            <div 
              className="text-white whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: processContent(reply.text) }}
            />
          )}

          <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => onVote(reply.id, 1)}
                className={`hover:bg-[#272729] p-1 rounded ${reply.userVotes?.[user?.id] === 1 ? 'text-purple-500' : ''}`}
              >
                <FaArrowUp className="w-4 h-4" />
              </button>
              <span>{reply.votes || 0}</span>
              <button 
                onClick={() => onVote(reply.id, -1)}
                className={`hover:bg-[#272729] p-1 rounded ${reply.userVotes?.[user?.id] === -1 ? 'text-red-500' : ''}`}
              >
                <FaArrowDown className="w-4 h-4" />
              </button>
            </div>

            {canEdit && (
              <button 
                onClick={() => setIsEditing(true)}
                className="hover:bg-[#272729] px-2 py-1 rounded flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
              >
                <FaEdit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            <button 
              onClick={() => handleReport('reply', reply.id)}
              className="hover:bg-[#272729] px-2 py-1 rounded text-red-500 flex items-center space-x-1 hover:bg-red-500/10 transition-colors"
            >
              <FaFlag className="w-4 h-4" />
              <span>Report</span>
            </button>
            {canDelete && (
              <button 
                onClick={handleDelete}
                className="hover:bg-[#272729] px-2 py-1 rounded text-red-500 flex items-center space-x-1 hover:bg-red-500/10 transition-colors"
              >
                <FaTrash className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Comment;