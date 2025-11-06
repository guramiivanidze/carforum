'use client';

import { useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageModalProps {
  images: Array<{ id: number; image_url?: string; image: string; caption?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ImageModal({ images, currentIndex, onClose, onNext, onPrev }: ImageModalProps) {
  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultipleImages) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasMultipleImages) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [hasMultipleImages, onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition z-10"
        title="Close (Esc)"
      >
        <FaTimes size={24} />
      </button>

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-4 text-white text-lg font-medium z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Previous Button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-50 hover:bg-opacity-70 hover:scale-110 text-white rounded-full transition-all duration-200 shadow-lg z-50"
          title="Previous (Left Arrow)"
        >
          <FaChevronLeft size={28} />
        </button>
      )}

      {/* Next Button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-50 hover:bg-opacity-70 hover:scale-110 text-white rounded-full transition-all duration-200 shadow-lg z-50"
          title="Next (Right Arrow)"
        >
          <FaChevronRight size={28} />
        </button>
      )}

      {/* Image Content */}
      <div
        className="max-w-7xl max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.image_url || currentImage.image}
          alt={currentImage.caption || 'Image preview'}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        
        {/* Caption */}
        {currentImage.caption && (
          <div className="mt-4 text-white text-center max-w-2xl">
            <p className="text-lg">{currentImage.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
