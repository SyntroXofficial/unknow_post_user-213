import React from 'react';
import { FaHotjar, FaClock, FaChartLine, FaComments } from 'react-icons/fa';
import Chat from './Chat';

function PostFilters({ sortBy, setSortBy, selectedTimeframe, setSelectedTimeframe }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortBy('hot')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                sortBy === 'hot' ? 'bg-[#272729] text-white' : 'text-gray-400'
              }`}
            >
              <FaHotjar className="w-4 h-4" />
              <span>Hot</span>
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                sortBy === 'new' ? 'bg-[#272729] text-white' : 'text-gray-400'
              }`}
            >
              <FaClock className="w-4 h-4" />
              <span>New</span>
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                sortBy === 'top' ? 'bg-[#272729] text-white' : 'text-gray-400'
              }`}
            >
              <FaChartLine className="w-4 h-4" />
              <span>Top</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-[#272729] text-white px-4 py-2 rounded-md border border-[#343536] focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Chat Section */}
      <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FaComments className="text-purple-500 w-5 h-5" />
          <h2 className="text-white font-bold">Live Community Chat</h2>
        </div>
        <Chat />
      </div>
    </div>
  );
}

export default PostFilters;