import React, { useState } from 'react';
import { FaUsers, FaUserFriends, FaRegCommentAlt, FaComments, FaRegStar, FaBullhorn, FaEdit } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

function Sidebar({ communityStats, communityRules, announcement }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnnouncement, setEditedAnnouncement] = useState(announcement);
  const isAdmin = auth.currentUser?.email === 'andres_rios_xyz@outlook.com';

  const handleSaveAnnouncement = async () => {
    if (!isAdmin) return;
    
    try {
      const announcementRef = doc(db, 'system', 'announcement');
      
      // Check if the document exists
      const docSnap = await getDoc(announcementRef);
      
      if (!docSnap.exists()) {
        // Create the document if it doesn't exist
        await setDoc(announcementRef, {
          text: editedAnnouncement,
          lastUpdated: new Date()
        });
      } else {
        // Update the existing document
        await updateDoc(announcementRef, {
          text: editedAnnouncement,
          lastUpdated: new Date()
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  return (
    <div className="w-80 space-y-4">
      {/* Announcement */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FaBullhorn className="text-yellow-500" />
            <h2 className="text-white font-bold">Announcement</h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-white"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedAnnouncement}
              onChange={(e) => setEditedAnnouncement(e.target.value)}
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{announcement}</p>
        )}
      </div>

      {/* About Community */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">About Community</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Welcome to the AZCORP community! Share your experiences, ask questions, and connect with other members.
          </p>
          <div className="border-t border-[#343536] py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-gray-400" />
                <div>
                  <div className="text-white font-bold">{communityStats.totalMembers}</div>
                  <div className="text-sm text-gray-400">Members</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaUserFriends className="text-gray-400" />
                <div>
                  <div className="text-white font-bold">{communityStats.onlineMembers}</div>
                  <div className="text-sm text-gray-400">Online</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaRegCommentAlt className="text-gray-400" />
                <div>
                  <div className="text-white font-bold">{communityStats.dailyPosts}</div>
                  <div className="text-sm text-gray-400">Daily Posts</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaComments className="text-gray-400" />
                <div>
                  <div className="text-white font-bold">{communityStats.dailyComments}</div>
                  <div className="text-sm text-gray-400">Daily Comments</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#343536] pt-4">
            <p className="text-gray-400 text-sm flex items-center">
              <FaRegStar className="mr-2" />
              Created Jan 27, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Community Rules */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Community Rules</h2>
        </div>
        <div className="space-y-2">
          {communityRules.map((rule, index) => (
            <div key={index} className="text-gray-400 text-sm">
              {index + 1}. {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;