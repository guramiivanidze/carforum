import React, { useState } from 'react';
import './BadgeUnlockModal.css';

/**
 * Badge Unlock Modal Component
 * Displays celebration modal when user unlocks new badges
 */
const BadgeUnlockModal = ({ badges, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose && onClose(), 300);
  };

  if (!badges || badges.length === 0) return null;

  return (
    <div 
      className={`badge-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`badge-modal ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Animation */}
        <div className="confetti-container">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`confetti confetti-${i % 5}`} />
          ))}
        </div>

        <div className="badge-modal-content">
          <h2 className="badge-modal-title">
            🎉 Badge{badges.length > 1 ? 's' : ''} Unlocked! 🎉
          </h2>

          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div 
                key={badge.id} 
                className="badge-unlock-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="badge-icon-large">{badge.icon}</div>
                <h3 className="badge-name">{badge.name}</h3>
                <p className="badge-description">{badge.description}</p>
                <div className="badge-reward">+{badge.xp_reward} XP</div>
              </div>
            ))}
          </div>

          <button className="badge-close-button" onClick={handleClose}>
            Awesome! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge Unlock Manager Hook
 * Manages badge unlock modal state
 */
export const useBadgeUnlock = () => {
  const [badges, setBadges] = useState(null);

  const showBadgeUnlockModal = (unlockedBadges) => {
    if (unlockedBadges && unlockedBadges.length > 0) {
      setBadges(unlockedBadges);
    }
  };

  const closeBadgeModal = () => {
    setBadges(null);
  };

  const BadgeUnlockModalComponent = () => (
    badges ? (
      <BadgeUnlockModal badges={badges} onClose={closeBadgeModal} />
    ) : null
  );

  return { showBadgeUnlockModal, BadgeUnlockModalComponent };
};

export default BadgeUnlockModal;
