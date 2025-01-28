import React from 'react';
import { FaEdit, FaMarkdown, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

function CreatePost({ 
  user,
  showProfileEdit,
  setShowProfileEdit,
  profilePicUrl,
  setProfilePicUrl,
  handleUpdateProfilePic,
  showPostOptions,
  setShowPostOptions,
  postType,
  setPostType,
  postTitle,
  setPostTitle,
  newMessage,
  setNewMessage,
  selectedTags,
  setSelectedTags,
  cooldown,
  cooldownTime,
  handleSubmit
}) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
      <div className="flex items-center space-x-4">
        <div className="relative group cursor-pointer" onClick={() => setShowProfileEdit(true)}>
          {user?.profilePicUrl ? (
            <img 
              src={user.profilePicUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <FaUserCircle className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <FaEdit className="text-white w-4 h-4" />
          </div>
        </div>
        <input
          type="text"
          placeholder="Create Post"
          onClick={() => setShowPostOptions(true)}
          className="flex-1 bg-[#272729] text-white px-4 py-2 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC] cursor-pointer"
          readOnly
        />
      </div>

      <AnimatePresence>
        {showProfileEdit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-[#1A1A1B] p-6 rounded-lg w-96">
              <h3 className="text-white text-lg font-bold mb-4">Update Profile Picture</h3>
              <input
                type="text"
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
                placeholder="Enter image URL"
                className="w-full bg-[#272729] text-white px-4 py-2 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC] mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfilePic}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showPostOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => setPostType('text')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  postType === 'text' ? 'bg-purple-500 text-white' : 'bg-[#272729] text-gray-400'
                }`}
              >
                <FaMarkdown className="w-4 h-4" />
                <span>Text</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Post Title (Required)"
                className="w-full bg-[#272729] text-white p-4 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC]"
                required
              />

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      selectedTags.includes(tag.name) ? tag.color : 'bg-gray-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length === 3 && (
                <p className="text-yellow-500 text-sm">Maximum 3 tags allowed</p>
              )}

              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full bg-[#272729] text-white p-4 rounded-md border border-[#343536] focus:outline-none focus:border-[#D7DADC] min-h-[100px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                {cooldown && (
                  <span className="text-gray-400">
                    Wait {cooldownTime}s
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowPostOptions(false);
                    setNewMessage('');
                    setPostTitle('');
                    setPostType('text');
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 rounded-full text-gray-400 hover:bg-[#272729]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cooldown}
                  className={`px-6 py-2 bg-white text-[#1A1A1B] rounded-full font-bold transition-colors ${
                    cooldown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                  }`}
                >
                  Post
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreatePost;