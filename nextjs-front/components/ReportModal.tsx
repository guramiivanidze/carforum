'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaFlag } from 'react-icons/fa';
import { getReportReasons, createReport } from '@/lib/api';
import { ReportReason } from '@/types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyId: number;
  onReportSuccess?: () => void;
}

export default function ReportModal({ isOpen, onClose, replyId, onReportSuccess }: ReportModalProps) {
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      setSuccess(false);
      setError(null);
      setSelectedReason(null);
      setAdditionalInfo('');
    }
  }, [isOpen]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const data = await getReportReasons();
      setReasons(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to fetch report reasons:', err);
      setError('Failed to load report reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createReport(replyId, selectedReason, additionalInfo);
      
      // Show success message
      setSuccess(true);
      
      // Call success callback
      if (onReportSuccess) {
        onReportSuccess();
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit report';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaFlag className="text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Report Reply</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={submitting}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">
                Thank you for helping keep our community safe. We'll review this report shortly.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading reasons...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why are you reporting this reply? *
                    </label>
                    <div className="space-y-2">
                      {reasons.map((reason) => (
                        <label
                          key={reason.id}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                            selectedReason === reason.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={reason.id}
                            checked={selectedReason === reason.id}
                            onChange={() => setSelectedReason(reason.id)}
                            className="mt-1 mr-3"
                            disabled={submitting}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{reason.title}</div>
                            <div className="text-sm text-gray-600">{reason.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (optional)
                    </label>
                    <textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide any additional context that might help us review this report..."
                      disabled={submitting}
                      maxLength={500}
                    />
                    <p className="mt-1 text-sm text-gray-500">{additionalInfo.length}/500 characters</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !selectedReason}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
