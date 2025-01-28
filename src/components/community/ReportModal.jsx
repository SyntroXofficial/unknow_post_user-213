import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

function ReportModal({ 
  show, 
  onClose, 
  reportReason, 
  setReportReason, 
  reportDetails, 
  setReportDetails,
  selectedPostId,
  onSubmit 
}) {
  useEffect(() => {
    if (!show) {
      // Clear stored content info when modal closes
      localStorage.removeItem('reportContentType');
      localStorage.removeItem('reportContentId');
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const contentType = localStorage.getItem('reportContentType') || 'post';
    const contentId = localStorage.getItem('reportContentId') || selectedPostId;
    onSubmit(selectedPostId, contentId, contentType, reportReason, reportDetails);
    onClose();
    setReportReason('');
    setReportDetails('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1B] p-6 rounded-lg w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 w-5 h-5" />
            <h3 className="text-xl font-bold text-white">Report Content</h3>
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
            <label className="text-gray-400 text-sm block mb-2">Reason for Report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              required
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Additional Details</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Please provide more information about your report..."
              className="w-full bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 min-h-[100px]"
              required
            />
          </div>

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

export default ReportModal;