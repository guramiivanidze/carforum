import React, { useState } from 'react';
import '../styles/SuccessModal.css';

/**
 * Success Modal Component
 * Displays a success message in a modal
 */
const SuccessModal = ({ message, icon = '✅', onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose && onClose(), 300);
  };

  return (
    <div 
      className={`success-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`success-modal ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-modal-content">
          <div className="success-icon">{icon}</div>
          <h2 className="success-title">Success!</h2>
          <p className="success-message">{message}</p>
          <button className="success-close-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
