"use client";

import { useState, useEffect, useRef } from 'react';

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasoning?: string;
}

// Sample value bets for a match
const sampleValueBets = [
  { bet: "Liverpool Win", odds: 1.95, confidence: 0.78, value: 1.52 },
  { bet: "Over 2.5 Goals", odds: 1.85, confidence: 0.82, value: 1.68 },
  { bet: "Both Teams to Score", odds: 1.72, confidence: 0.85, value: 1.46 },
  { bet: "Mohamed Salah Anytime Scorer", odds: 2.20, confidence: 0.65, value: 1.43 },
];

// Default reasoning text
const defaultReasoning = `Based on recent form, Liverpool enters this match with a strong home advantage, having won 4 of their last 5 games at Anfield. Their attacking trio has been effective, averaging 2.1 goals per match, and Mohamed Salah appears to be in top shape.

Manchester City, on the other hand, has shown some inconsistency on the road, especially when facing high-press teams. While their overall possession stats remain high (averaging 62% per game), they have conceded early goals in 3 of their last 4 away fixtures.

From a tactical standpoint, Klopp is expected to press high and target City's flanks, especially exploiting the right side where City has allowed 40% of their xG conceded. Haaland remains a threat, but his touches in the box have decreased by 18% over the last three matches due to tighter marking.

Weather conditions at Anfield are mild with no expected rain, which typically benefits Liverpool's faster playstyle. Referee assignments suggest a higher likelihood of cards, which could influence momentum in the second half.

Overall, the expected goals (xG) model favors Liverpool slightly at 1.65 to 1.38, suggesting a tight contest but with a slight edge for the home side. This match is likely to produce goals, with Over 2.5 being statistically supported in 7 of the last 8 head-to-head matchups.

Value may lie in markets like "Both Teams to Score" and "Liverpool Win or Draw," especially considering current bookmaker odds undervalue the home advantage.`;

export default function ReasoningModal({ isOpen, onClose, reasoning = defaultReasoning }: ReasoningModalProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Set blur after 3 seconds from typing start, then show email popup after 1 second
  useEffect(() => {
    let blurTimeout: NodeJS.Timeout;
    let popupTimeout: NodeJS.Timeout;
    
    if (isOpen && !isUnlocked) {
      blurTimeout = setTimeout(() => {
        setIsBlurred(true);
        popupTimeout = setTimeout(() => {
          setShowEmailPopup(true);
        }, 1000);
      }, 3000);
    }
    
    return () => {
      clearTimeout(blurTimeout);
      clearTimeout(popupTimeout);
    };
  }, [isOpen, isUnlocked]);

  // Typing effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsBlurred(false);
      setIsUnlocked(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setIsBlurred(false);
      setShowEmailPopup(false);
      setIsUnlocked(true);
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-gray-900 text-white w-full h-full overflow-hidden flex flex-col transition-transform relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            AI Analysis
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none p-1 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content area */}
        <div className="p-6 md:p-12 overflow-y-auto flex-grow relative">
          <div className={`transition-all duration-500 ${isBlurred && !isUnlocked ? 'blur-sm' : ''}`}>
            {/* Reasoning text with typing effect */}
            <div className="mb-8 max-w-4xl mx-auto">
              <p className="text-2xl leading-relaxed text-gray-200 whitespace-pre-line">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>
            
            {/* Value Bets section - only shown when unlocked */}
            {isUnlocked && !isTyping && (
              <div className="mt-8 animate-fadeIn max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🏆</span> Top Value Bets for This Match
                </h3>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="grid grid-cols-4 gap-4 text-lg font-medium text-gray-400 mb-2">
                    <div>Bet</div>
                    <div>Odds</div>
                    <div>Confidence</div>
                    <div>Value</div>
                  </div>
                  {sampleValueBets.map((bet, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-4 gap-4 py-3 border-t border-gray-700 text-lg"
                    >
                      <div className="text-white">{bet.bet}</div>
                      <div className="text-white font-mono">{bet.odds.toFixed(2)}</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-3 mr-2">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${bet.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(bet.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span 
                          className={`px-3 py-1 rounded-full text-base font-semibold
                            ${bet.value >= 1.5 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-yellow-900 text-yellow-300'}`}
                        >
                          {bet.value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email unlock form */}
          {showEmailPopup && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center" style={{ perspective: '2000px' }}>
              <div className="bg-gray-800 p-10 rounded-xl shadow-xl max-w-lg w-full border border-blue-500/30 transform-gpu animate-popIn transition-all duration-700">
                <h3 className="text-3xl font-bold mb-4 text-white animate-fadeInUp transition-all duration-700">
                  Want to unlock the full analysis?
                </h3>
                <p className="mb-8 text-gray-300 text-xl animate-fadeInUp delay-100 transition-all duration-700">
                  Enter your email to access the AI prediction and top betting picks.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp delay-200 transition-all duration-700">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 border border-gray-600 rounded-lg bg-gray-700 text-white text-xl transition-all duration-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transform hover:scale-[1.01]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-4 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] text-xl"
                  >
                    Unlock
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 