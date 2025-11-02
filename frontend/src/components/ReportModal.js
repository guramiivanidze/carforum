import React, { useState, useEffect } from 'react';
import { getReportReasons, createReport } from '../services/api';
import '../styles/ReportModal.css';

function ReportModal({ replyId, onClose, onSuccess }) {
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const data = await getReportReasons();
        // Handle both array and paginated response formats
        const reasonsArray = Array.isArray(data) ? data : (data.results || []);
        setReasons(reasonsArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report reasons:', err);
        setError('Failed to load report reasons');
        setLoading(false);
      }
    };

    fetchReasons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createReport({
        reply: replyId,
        reason: selectedReason,
        additional_info: additionalInfo
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      const errorMsg = err.response?.data?.error || 'Failed to submit report. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚨 Report Reply</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="modal-body">
            <p>Loading reasons...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="report-description">
                Please select a reason for reporting this reply. Your report will be reviewed by moderators.
              </p>

              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="reason">Reason for report *</label>
                <select
                  id="reason"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Select a reason --</option>
                  {Array.isArray(reasons) && reasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.title}
                    </option>
                  ))}
                </select>
                {selectedReason && Array.isArray(reasons) && (
                  <p className="reason-description">
                    {reasons.find(r => r.id === parseInt(selectedReason))?.description}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="additional-info">Additional information (optional)</label>
                <textarea
                  id="additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Provide any additional details that might help moderators..."
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting || !selectedReason}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
