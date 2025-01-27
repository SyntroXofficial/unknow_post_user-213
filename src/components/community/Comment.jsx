import React from 'react';
import { FaUserCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';

function Comment({ comment, user }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
        {comment.userId === user?.id && user?.profilePicUrl ? (
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
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white font-medium">{comment.username}</span>
          <span className="text-gray-400 text-sm">#{comment.userId}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400 text-sm">
            {new Date(comment.timestamp).toLocaleDateString()}
          </span>
        </div>
        <p className="text-white">{comment.text}</p>
        <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
          <button className="flex items-center space-x-1 hover:bg-[#272729] px-2 py-1 rounded">
            <FaArrowUp className="w-4 h-4" />
            <span>{comment.votes || 0}</span>
            <FaArrowDown className="w-4 h-4" />
          </button>
          <button className="hover:bg-[#272729] px-2 py-1 rounded">Reply</button>
          <button className="hover:bg-[#272729] px-2 py-1 rounded">Share</button>
          <button className="hover:bg-[#272729] px-2 py-1 rounded text-red-500">
            Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comment;