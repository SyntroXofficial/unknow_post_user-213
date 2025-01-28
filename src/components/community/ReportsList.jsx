{/* Update the ReportsList component to handle long messages better */}

import React from 'react';
import { FaCheck, FaTimes, FaFlag, FaUser, FaCalendar, FaExclamationTriangle } from 'react-icons/fa';

function ReportsList({ 
  showReports, 
  setShowReports, 
  reports, 
  handleMarkReportAsDone, 
  handleDeleteReport 
}) {
  if (!showReports) return null;

  return (
    <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaFlag className="text-red-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-white">Reported Content</h2>
        </div>
        <button
          onClick={() => setShowReports(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Hide Reports
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <FaExclamationTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No reports found</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-black/30 p-4 rounded-lg border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white truncate">
                        <span className="text-gray-400">Reporter:</span> {report.reportedBy}
                      </p>
                      <p className="text-white truncate">
                        <span className="text-gray-400">Reported User:</span> {report.reportedUserId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-gray-400 flex-shrink-0" />
                    <p className="text-white truncate">
                      <span className="text-gray-400">Date:</span>{' '}
                      {report.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-white break-words">
                      <span className="text-gray-400">Post ID:</span> {report.messageId}
                    </p>
                    <p className="text-white break-words">
                      <span className="text-gray-400">Reason:</span> {report.reason}
                    </p>
                    <p className="text-white break-words">
                      <span className="text-gray-400">Details:</span> {report.details}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      report.status === 'resolved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => handleMarkReportAsDone(report.id)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      title="Mark as Resolved"
                    >
                      <FaCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete Report"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsList;