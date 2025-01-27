import React from 'react';
import { FaHotjar, FaClock, FaChartLine } from 'react-icons/fa';

function PostFilters({ sortBy, setSortBy, selectedTimeframe, setSelectedTimeframe }) {
  return (
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
  );
}

export default PostFilters;