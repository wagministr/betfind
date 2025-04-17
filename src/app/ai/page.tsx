"use client";

import { useState, useEffect, useRef } from 'react';
import { mockBets } from '@/data/mockBets';
import { Bet } from '@/types/Bet';
import { supabase } from "@/utils/supabase";
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
      
      // Clear any pending timeouts when component unmounts
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsLoggedIn(false);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Filter bets based on search query
  const filteredBets = mockBets.filter(bet => 
    bet.match.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to add human-like typing with natural pauses
  const humanLikeTyping = (text: string) => {
    // Clear any existing timeouts or intervals
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    
    let index = 0;
    setDisplayedText('');
    
    // Set blur after 3 seconds
    blurTimeoutRef.current = setTimeout(() => {
      setIsBlurred(true);
    }, 3000);
    
    // Set email popup after 4 seconds
    emailTimeoutRef.current = setTimeout(() => {
      setShowEmailPopup(true);
    }, 4000);
    
    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
        
        // Determine next delay with natural pauses
        let delay = 15; // Base typing speed
        
        // Add longer pauses at sentence endings
        const nextChar = text.charAt(index);
        const currentChar = text.charAt(index - 1);
        
        if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
          delay = Math.random() * 500 + 400; // 400-900ms pause after sentences
        } else if (currentChar === ',' || currentChar === ';' || currentChar === ':') {
          delay = Math.random() * 200 + 200; // 200-400ms pause after commas
        } else if (nextChar === ' ' || currentChar === ' ') {
          delay = Math.random() * 50 + 40; // 40-90ms pause for spaces
        } else {
          // Random variation for normal typing
          delay = Math.random() * 30 + 10; // 10-40ms for regular typing
        }
        
        setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };
    
    setIsTyping(true);
    typeNextChar();
  };

  // Handle bet selection
  const handleBetSelect = (bet: Bet) => {
    setSelectedBet(bet);
    setIsTyping(true);
    setDisplayedText('');
    setIsBlurred(false);
    setShowEmailPopup(false);
    
    // Start human-like typing effect
    humanLikeTyping(bet.reasoning);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setIsBlurred(false);
      setShowEmailPopup(false);
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0D1117] font-['Noto_Sans',sans-serif]">
      {/* Top navbar */}
      <nav className="h-12 sticky top-0 z-[100] flex items-center justify-between px-4 md:px-6 bg-[#0D1117]/90 backdrop-blur-sm border-b border-[#30363D]">
        <div className="w-8">
          {/* Burger icon placeholder */}
          <svg className="w-6 h-6 text-[#8B949E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        
        <div className="font-medium text-lg text-[#ECEEF3]">MrBets AI</div>
        
        {/* Sign out button - only show when logged in */}
        {!isCheckingAuth && isLoggedIn ? (
          <button 
            onClick={handleSignOut}
            className="text-[#CCD2DD] text-sm py-1 px-3 rounded hover:bg-[#1E222A] transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        ) : (
          <div className="w-8"></div> // Empty div for spacing
        )}
      </nav>
    
      {/* Main content with reduced padding */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pb-10">
        {/* Hero section when no bet selected */}
        {!selectedBet && (
          <section className="min-h-[35vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 w-full text-center">
              What are we going to bet on today?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-md mx-auto text-center">
              Our AI analyzes thousands of data points to find the best betting opportunities.
              Select a match below to get detailed analysis and predictions.
            </p>
          </section>
        )}

        {/* Chat messages */}
        {selectedBet && (
          <div className="py-6 space-y-6">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#1A88FF]/20 border border-[#1A88FF]/30 text-[#ECEEF3] rounded-2xl py-3 px-4 max-w-xs md:max-w-md">
                {selectedBet.match}
              </div>
            </div>

            {/* AI response with typing effect */}
            <div className="relative w-full max-w-3xl">
              <div className={`relative bg-[#161B22] rounded-2xl p-6 transition-all duration-700 ${isBlurred ? 'blur-sm' : ''}`}>
                <div className="mb-4 flex items-center">
                  <div className="w-8 h-8 bg-[#1A88FF] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">AI</span>
                  </div>
                  <h3 className="ml-3 text-xl font-medium text-[#ECEEF3]">AI Analysis</h3>
                </div>
                
                <div className="text-lg md:text-xl leading-relaxed text-[#ECEEF3] whitespace-pre-line">
                  {displayedText}
                  {isTyping && <span className="animate-pulse ml-1">|</span>}
                </div>
                
                {!isBlurred && !isTyping && (
                  <div className="mt-8">
                    <h4 className="text-xl font-semibold text-[#ECEEF3] mb-4">🏆 Best Value Bets for {selectedBet.match}</h4>
                    <div className="space-y-3">
                      {[
                        { market: selectedBet.betType, odds: selectedBet.odds, confidence: selectedBet.confidence },
                        { market: "Draw No Bet - " + selectedBet.match.split(" vs ")[0], odds: selectedBet.odds - 0.3, confidence: selectedBet.confidence - 10 },
                        { market: "Under 3.5 Goals", odds: 1.65, confidence: 65 }
                      ].map((bet, i) => (
                        <div key={i} className="flex items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex-1 text-[#ECEEF3]">{bet.market}</div>
                          <div className="font-mono text-[#1A88FF] mx-3">@{bet.odds.toFixed(2)}</div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            bet.confidence > 75 ? 'bg-[#00C776]/20 text-[#00C776]' : 
                            bet.confidence > 60 ? 'bg-[#FFB454]/20 text-[#FFB454]' : 
                            'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                          }`}>
                            {bet.confidence}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match scroller - positioned 10% higher than before */}
      {!selectedBet && (
        <div className="fixed bottom-[calc(3.5rem+10%)] left-0 right-0 mb-1 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#ECEEF3] text-sm font-medium mb-2 text-center">Popular Matches</h2>
            <div className="relative overflow-hidden">
              <div className="overflow-x-auto scrollbar-none touch-pan-x pb-2">
                <div className="flex space-x-2 min-w-max justify-center">
                  {filteredBets.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBetSelect(bet)}
                      className="min-w-[160px] h-[90px] bg-white/5 backdrop-blur-sm rounded-lg p-2 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-[#30363D]/50 cursor-pointer flex flex-col justify-between"
                    >
                      <p className="text-[10px] uppercase text-[#8B949E] font-medium tracking-wider">{bet.league}</p>
                      <h3 className="text-sm font-medium text-[#ECEEF3] truncate">{bet.match}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 truncate max-w-[100px]">{bet.betType}</span>
                        <span className="text-[#1A88FF] font-mono text-xs">@{bet.odds.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0D1117] to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0D1117] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117] border-t border-[#30363D]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col py-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for matches..."
                className="w-full h-10 px-4 bg-[#0E1117] text-[#ECEEF3] rounded-full border border-[#30363D] focus:border-[#1A88FF] focus:ring-1 focus:ring-[#1A88FF]/20 focus:outline-none shadow-inner text-sm"
              />
            </div>
            <p className="text-xs text-[#555F6B] text-center mt-1">
              MrBets AI provides data-driven insights. Please bet responsibly.
            </p>
          </div>
        </div>
      </div>

      {/* Blur-to-unlock overlay */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-center bg-black/70 backdrop-blur-sm">
          <div className="w-[280px] bg-[#161B22] rounded-2xl p-6 shadow-xl border border-[#30363D] transform-gpu animate-popIn transition-all duration-700">
            <h3 className="text-xl font-semibold mb-4 text-[#ECEEF3] animate-fadeInUp transition-all duration-700">
              Unlock Full Analysis
            </h3>
            <p className="mb-6 text-[#8B949E] animate-fadeInUp delay-100 transition-all duration-700">
              Enter your email to access the AI prediction and top betting picks.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp delay-200 transition-all duration-700">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#0E1117] border border-[#30363D] rounded-md text-[#ECEEF3] transition-all duration-300 focus:border-[#1A88FF] focus:ring-2 focus:ring-[#1A88FF]/20 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1A88FF] hover:bg-[#0070E0] text-white font-medium rounded-md transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 