import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-all ${
          currentPage === 1
            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <FaChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => onPageChange(index + 1)}
            className={`w-10 h-10 rounded-lg transition-all ${
              currentPage === index + 1
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-all ${
          currentPage === totalPages
            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <FaChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default Pagination;