import { useState, useEffect, useRef } from 'react';

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasoning: string;
}

export default function ReasoningModal({ isOpen, onClose, reasoning }: ReasoningModalProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Typing effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    const textLength = reasoning.length;
    const typingSpeed = 15; // milliseconds per character
    
    const typingInterval = setInterval(() => {
      if (index < textLength) {
        setDisplayedText(prev => prev + reasoning.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);
    
    return () => {
      clearInterval(typingInterval);
    };
  }, [isOpen, reasoning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50 transition-opacity">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col transition-transform"
      >
        <div className="flex justify-between items-center p-3 sm:p-4 border-b dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            AI Analysis
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none p-1"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        
        <div className="p-3 sm:p-4 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 