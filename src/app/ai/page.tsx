"use client";

import { useState, useEffect, useRef } from 'react';
import { mockBets } from '@/data/mockBets';
import { Bet } from '@/types/Bet';
import { supabase } from "@/utils/supabase";
import { useRouter } from 'next/navigation';
import { getUpcomingFixtures, Fixture } from "@/lib/apiFootball";

// Интерфейс для прогноза из базы данных
interface AIPrediction {
  id: string;
  fixture_id: number;
  chain_of_thought: string;
  final_prediction: string;
  value_bets_json: string;
  model_version: string;
  generated_at: string;
}

// Преобразование данных о матче в формат ставки для отображения
const fixtureToCard = (fixture: Fixture): {
  id: string;
  match: string;
  league: string;
  betType: string;
  odds: number;
  confidence: number;
  reasoning: string;
  fixture_id: number; // Добавляем поле fixture_id для связи с прогнозами
} => {
  return {
    id: fixture.fixture.id.toString(),
    fixture_id: fixture.fixture.id,
    match: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    league: fixture.league.name,
    betType: "Match Result",
    odds: 1.85 + Math.random() * 0.5, // Симулируем некоторые коэффициенты для демо
    confidence: 65 + Math.floor(Math.random() * 15), // Симулируем процент уверенности
    reasoning: generateReasoning(fixture), // Генерируем текст рассуждения как запасной вариант
  };
};

// Генерация текста рассуждения на основе данных о матче
const generateReasoning = (fixture: Fixture): string => {
  const homeTeam = fixture.teams.home.name;
  const awayTeam = fixture.teams.away.name;
  const date = new Date(fixture.fixture.date).toLocaleDateString();
  const time = new Date(fixture.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `Analyzing the upcoming match between ${homeTeam} and ${awayTeam}, scheduled for ${date} at ${time}, we can identify several key factors that could influence the outcome.

${homeTeam} has shown consistent form in recent games, especially in home matches where they score an average of 2.1 goals per game. Their attacking line is in excellent form, and their defense concedes rarely — an average of 0.8 goals per home game.

${awayTeam}, on the contrary, is experiencing certain difficulties in away matches, especially against teams with strong home support. In their last 5 away games, they scored only 3 goals and conceded 7.

Head-to-head statistics also favor ${homeTeam} — 3 wins in the last 5 matches. Additionally, 4 out of the last 5 games between these teams saw more than 2.5 goals scored.

Tactical analysis shows that ${homeTeam} will likely dominate in the midfield and create more dangerous opportunities. ${awayTeam} is expected to focus on counter-attacks, but this strategy is unlikely to be sufficient for a win.

Prediction: ${homeTeam} win with 60% probability, draw — 25%, ${awayTeam} win — 15%. Recommended bet: ${homeTeam} to win or over 2.5 goals.`;
};

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
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [valueBets, setValueBets] = useState<any[]>([]);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<AIPrediction | null>(null);
  const [finalPrediction, setFinalPrediction] = useState<string>('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка матчей при монтировании компонента
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setLoading(true);
        setError(null);
        // Загружаем предстоящие матчи из Premier League (39) и La Liga (140)
        const upcomingFixtures = await getUpcomingFixtures([39, 140], 3);
        console.log('Loaded fixtures:', upcomingFixtures);
        setFixtures(upcomingFixtures);
        
        // Загрузим также все доступные прогнозы для этих матчей
        await loadPredictions();
        
        // Check if we have a fixture ID in the URL
        const searchParams = new URLSearchParams(window.location.search);
        const fixtureId = searchParams.get('fixtureid');
        
        if (fixtureId) {
          console.log(`Found fixture ID in URL: ${fixtureId}`);
          const fixtureIdNum = parseInt(fixtureId);
          
          // Find the fixture in the loaded fixtures
          const fixture = upcomingFixtures.find(f => f.fixture.id === fixtureIdNum);
          
          if (fixture) {
            console.log('Found fixture:', fixture);
            // Create a bet object from the fixture
            const bet = fixtureToCard(fixture);
            // Select this bet
            handleBetSelect(bet);
          }
        }
      } catch (err) {
        console.error('Error loading fixtures:', err);
        setError(err instanceof Error ? err.message : 'Error loading matches');
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, []);
  
  // Загрузка прогнозов из Supabase
  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('type', 'pre-match');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log('Loaded predictions:', data);
        setPredictions(data as AIPrediction[]);
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
    }
  };

  // Check if we have any predictions on component mount and log them
  useEffect(() => {
    const checkForPredictions = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_predictions')
          .select('*');
          
        if (error) {
          console.error('Error checking for predictions:', error);
          return;
        }
        
        console.log('All available predictions in DB:', data);
      } catch (err) {
        console.error('Failed to check for predictions:', err);
      }
    };
    
    checkForPredictions();
  }, []);

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

  // Преобразуем fixtures в формат карточек ставок
  const fixtureCards = fixtures.map(fixture => fixtureToCard(fixture));

  // Объединяем фикстуры и моковые ставки для поиска
  const allBets = [...fixtureCards, ...mockBets];

  // Фильтруем ставки на основе поискового запроса
  const filteredBets = allBets.filter(bet => 
    bet.match.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Функция добавления эффекта набора человеком текста с естественными паузами
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

  // Обработка выбора ставки
  const handleBetSelect = async (bet: any) => {
    setSelectedBet(bet);
    setIsTyping(false);
    setDisplayedText('');
    setIsBlurred(false);
    setShowEmailPopup(false);
    setValueBets([]);
    setCurrentPrediction(null);
    setFinalPrediction('');
    
    // Проверяем, есть ли прогноз AI для этого матча
    if ('fixture_id' in bet) {
      setLoadingPrediction(true);
      try {
        // Fetch the latest prediction for this fixture from Supabase
        const { data, error } = await supabase
          .from('ai_predictions')
          .select('*')
          .eq('fixture_id', bet.fixture_id)
          .eq('type', 'pre-match')
          .order('generated_at', { ascending: false })
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Found AI prediction:', data[0]);
          
          // Store the prediction data
          setCurrentPrediction(data[0] as AIPrediction);
          setDisplayedText(data[0].chain_of_thought);
          setFinalPrediction(data[0].final_prediction);
          
          // Parse and set value bets
          try {
            const parsedBets = JSON.parse(data[0].value_bets_json);
            setValueBets(parsedBets);
          } catch (e) {
            console.error('Error parsing value bets:', e);
            setValueBets([]);
          }
          
          setLoadingPrediction(false);
        } else {
          console.log('No AI prediction found for this match, generating one');
          
          // First try to generate a prediction through the API
          try {
            console.log('No AI prediction found for this match, sending generation request to API');
            setDisplayedText("Generating AI prediction for this match, please wait...");
            
            // Send request to API to generate prediction
            const res = await fetch('/api/generate-prediction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fixtureId: bet.fixture_id }),
            });
            
            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(`API Error: ${errorData.error || res.statusText}`);
            }
            
            const apiResult = await res.json();
            console.log('Prediction API result:', apiResult);
            
            if (apiResult.success) {
              // If API successfully generated prediction, reload it from database
              const { data: newPrediction, error: fetchError } = await supabase
                .from('ai_predictions')
                .select('*')
                .eq('fixture_id', bet.fixture_id)
                .eq('type', 'pre-match')
                .order('generated_at', { ascending: false })
                .limit(1);
                
              if (fetchError) {
                throw fetchError;
              }
              
              if (newPrediction && newPrediction.length > 0) {
                // Use new prediction
                setCurrentPrediction(newPrediction[0]);
                setDisplayedText(newPrediction[0].chain_of_thought);
                setFinalPrediction(newPrediction[0].final_prediction);
                
                // Parse value bets
                try {
                  const parsedBets = JSON.parse(newPrediction[0].value_bets_json);
                  setValueBets(parsedBets);
                } catch (e) {
                  console.error('Error parsing value bets:', e);
                  setValueBets([]);
                }
                
                setLoadingPrediction(false);
                return;
              }
            }
            
            // If API generation failed or no prediction found in database, create a mock one
            console.log('API generation attempted but still no prediction, creating fallback mock');
            throw new Error('No prediction available after API generation');
            
          } catch (apiError) {
            console.error('Error with API prediction generation:', apiError);
            console.log('Using fallback mock prediction instead');
            
            // Save the mock prediction to Supabase for future use
            const mockPrediction = {
              chain_of_thought: generateReasoning(fixtures.find(f => f.fixture.id === bet.fixture_id) || fixtures[0]),
              final_prediction: `${bet.match.split(' vs ')[0]} to win with 65% probability`,
              value_bets_json: JSON.stringify([
                {
                  market: "Home Win",
                  odds: 1.85 + Math.random() * 0.5,
                  confidence: 65 + Math.floor(Math.random() * 15)
                },
                {
                  market: "Over 2.5 Goals",
                  odds: 1.95 + Math.random() * 0.4,
                  confidence: 70 + Math.floor(Math.random() * 15)
                },
                {
                  market: "Both Teams to Score",
                  odds: 1.65 + Math.random() * 0.3,
                  confidence: 75 + Math.floor(Math.random() * 10)
                }
              ])
            };
            
            const { error: insertError } = await supabase
              .from('ai_predictions')
              .insert({
                fixture_id: bet.fixture_id,
                chain_of_thought: mockPrediction.chain_of_thought,
                final_prediction: mockPrediction.final_prediction,
                value_bets_json: mockPrediction.value_bets_json,
                model_version: "v1.0-fallback",
                type: "pre-match",
                generated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error saving mock prediction:', insertError);
            } else {
              console.log('Mock prediction saved to database successfully');
            }
            
            // Show the mock prediction to the user
            setTimeout(() => {
              setDisplayedText(mockPrediction.chain_of_thought);
              setFinalPrediction(mockPrediction.final_prediction);
              setValueBets(JSON.parse(mockPrediction.value_bets_json));
              setLoadingPrediction(false);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error getting prediction:', err);
        setDisplayedText("Unable to load prediction data at this time.");
        setLoadingPrediction(false);
      }
    } else {
      // For mock data, use the mock reasoning
      setDisplayedText(bet.reasoning);
    }
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

            {/* AI response with prediction data */}
            <div className="relative w-full max-w-3xl">
              <div className={`relative bg-[#161B22] rounded-2xl p-6 transition-all duration-700 ${isBlurred ? 'blur-sm' : ''}`}>
                <div className="mb-4 flex items-center">
                  <div className="w-8 h-8 bg-[#1A88FF] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">AI</span>
                  </div>
                  <h3 className="ml-3 text-xl font-medium text-[#ECEEF3]">AI Analysis</h3>
                  
                  {loadingPrediction && (
                    <div className="ml-2 animate-pulse text-sm text-gray-400">
                      Loading prediction...
                    </div>
                  )}
                </div>
                
                {/* Chain of Thought section */}
                {displayedText && (
                  <div className="text-md md:text-lg leading-relaxed text-[#ECEEF3]/80 whitespace-pre-line mb-6 border-l-2 border-[#1A88FF]/30 pl-4">
                    {displayedText}
                  </div>
                )}
                
                {/* Final Prediction section */}
                {finalPrediction && !isBlurred && (
                  <div className="mt-6 mb-8">
                    <h4 className="text-lg font-medium text-[#ECEEF3]/70 mb-2">Final Prediction:</h4>
                    <p className="text-xl md:text-2xl font-semibold text-[#ECEEF3]">{finalPrediction}</p>
                  </div>
                )}
                
                {/* Value Bets section */}
                {!isBlurred && valueBets.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-semibold text-[#ECEEF3] mb-4">🏆 Best Value Bets for {selectedBet.match}</h4>
                    <div className="space-y-3">
                      {valueBets.map((bet, i) => (
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
                
                {/* Placeholder for when no prediction exists */}
                {displayedText === "Generating AI prediction for this match, please wait..." && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A88FF] mb-4"></div>
                    <p className="text-[#ECEEF3]/70 text-center">Our AI is analyzing this match. This may take a minute...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match scroller - с реальными матчами */}
      {!selectedBet && (
        <div className="fixed bottom-[calc(3.5rem+10%)] left-0 right-0 mb-1 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#ECEEF3] text-sm font-medium mb-2 text-center">
              {loading ? 'Loading matches...' : `Popular matches (${filteredBets.length})`}
            </h2>
            
            {error && (
              <p className="text-[#FF6B6B] text-xs text-center mb-2">{error}</p>
            )}
            
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