import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';

function ReportDetailsModal({ show, onClose, itemName, itemId, type }) {
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [issueType, setIssueType] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!serviceName.trim()) {
      setError('Please enter the service/game name');
      return;
    }

    if (!issueType) {
      setError('Please select an issue type');
      return;
    }

    if (!reportReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (!reportDetails.trim()) {
      setError('Please provide additional details');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        itemId,
        itemName,
        type,
        serviceName: serviceName.trim(),
        issueType,
        reason: reportReason,
        details: reportDetails.trim(),
        reportedBy: auth.currentUser.uid,
        reportedUserId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      onClose();
      setReportReason('');
      setReportDetails('');
      setServiceName('');
      setIssueType('');
      setError('');
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1B] p-6 rounded-lg w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 w-5 h-5" />
            <h3 className="text-xl font-bold text-white">Report {type}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Service/Game Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              placeholder="Enter exact service/game name"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              required
            >
              <option value="">Select issue type</option>
              <option value="not_working">Not Working</option>
              <option value="login_issues">Login Issues</option>
              <option value="connection_error">Connection Error</option>
              <option value="account_locked">Account Locked</option>
              <option value="wrong_credentials">Wrong Credentials</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Reason for Report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              required
            >
              <option value="">Select a reason</option>
              <option value="not_working">Service Not Working</option>
              <option value="incorrect_info">Incorrect Information</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="account_issue">Account Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Additional Details</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Please provide specific details about the issue..."
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 min-h-[100px]"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportDetailsModal;