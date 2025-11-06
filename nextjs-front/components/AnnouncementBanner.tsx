'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface AnnouncementBannerProps {
  show: boolean;
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  linkText?: string;
}

const AnnouncementBanner = ({ show, text, type, link, linkText }: AnnouncementBannerProps) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this announcement
    const dismissed = localStorage.getItem('announcement_dismissed');
    if (dismissed === text) {
      setIsDismissed(true);
      setIsVisible(false);
    } else {
      setIsVisible(show);
    }
  }, [show, text]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('announcement_dismissed', text);
  };

  if (!isVisible || isDismissed || !text) {
    return null;
  }

  // Color schemes for different types
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600 dark:text-blue-400',
      button: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
      link: 'text-blue-700 hover:text-blue-900 underline font-medium dark:text-blue-300 dark:hover:text-blue-100',
      Icon: FaInfoCircle,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600 dark:text-yellow-400',
      button: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
      link: 'text-yellow-700 hover:text-yellow-900 underline font-medium dark:text-yellow-300 dark:hover:text-yellow-100',
      Icon: FaExclamationTriangle,
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: 'text-green-600 dark:text-green-400',
      button: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
      link: 'text-green-700 hover:text-green-900 underline font-medium dark:text-green-300 dark:hover:text-green-100',
      Icon: FaCheckCircle,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: 'text-red-600 dark:text-red-400',
      button: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
      link: 'text-red-700 hover:text-red-900 underline font-medium dark:text-red-300 dark:hover:text-red-100',
      Icon: FaTimesCircle,
    },
  };

  const style = styles[type] || styles.info;
  const IconComponent = style.Icon;

  return (
    <div className={`${style.bg} ${style.border} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <IconComponent className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
            <p className={`text-sm ${style.text} flex-1`}>
              {text}
              {link && linkText && (
                <>
                  {' '}
                  <Link href={link} className={style.link}>
                    {linkText}
                  </Link>
                </>
              )}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className={`${style.button} transition-colors flex-shrink-0`}
            aria-label="Dismiss announcement"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
