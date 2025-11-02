import React, { useState, useEffect } from 'react';
import './XPNotification.css';

/**
 * XP Notification Component
 * Shows animated notification when user gains XP
 */
const XPNotification = ({ xp, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`xp-notification ${isVisible ? 'show' : 'hide'}`}>
      <div className="xp-content">
        <div className="xp-amount">+{xp} XP</div>
        <div className="xp-message">{message}</div>
      </div>
      <div className="xp-sparkles">✨</div>
    </div>
  );
};

/**
 * XP Notification Manager Hook
 * Manages queue of XP notifications
 */
export const useXPNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const showXPNotification = ({ xp, message }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, xp, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NotificationContainer = () => (
    <div className="xp-notifications-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ top: `${index * 80}px` }}
        >
          <XPNotification
            xp={notification.xp}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );

  return { showXPNotification, NotificationContainer };
};

export default XPNotification;
