import React from 'react';
import { FaUsers, FaUserFriends, FaRegCommentAlt, FaComments, FaRegStar } from 'react-icons/fa';

function Sidebar({ communityStats, communityRules }) {
  return (
    <div className="w-80 space-y-4">
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