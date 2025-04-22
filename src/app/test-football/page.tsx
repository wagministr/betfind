"use client";

import { useState } from 'react';
import { getUpcomingFixtures, getLiveFixtures, getOddsForFixture, getPredictionsForFixture } from '@/lib/apiFootball';
import type { Fixture } from '@/lib/apiFootball';

export default function TestFootballPage() {
  const [loading, setLoading] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleTestApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test API with Premier League (39) and La Liga (140)
      const upcomingFixtures = await getUpcomingFixtures([39, 140]);
      console.log('API Response:', upcomingFixtures);
      setFixtures(upcomingFixtures);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Football API Test</h1>
      
      <div className="mb-8">
        <button
          onClick={handleTestApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test getUpcomingFixtures API'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {fixtures.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Fixtures ({fixtures.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.map((fixture) => (
              <div key={fixture.fixture.id} className="p-4 border rounded shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">{fixture.league.name}</span>
                  <span className="text-xs text-gray-500">{new Date(fixture.fixture.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img 
                      src={fixture.teams.home.logo} 
                      alt={fixture.teams.home.name} 
                      className="w-6 h-6 mr-2" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span>{fixture.teams.home.name}</span>
                  </div>
                  <span className="mx-2">vs</span>
                  <div className="flex items-center">
                    <span>{fixture.teams.away.name}</span>
                    <img 
                      src={fixture.teams.away.logo} 
                      alt={fixture.teams.away.name} 
                      className="w-6 h-6 ml-2" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Date: {new Date(fixture.fixture.date).toLocaleString()}</p>
                  <p>Venue: {fixture.fixture.referee ? `Referee: ${fixture.fixture.referee}` : 'No referee info'}</p>
                </div>
                
                <div className="mt-4">
                  <button 
                    className="text-sm text-blue-600 hover:underline mr-4"
                    onClick={async () => {
                      try {
                        const odds = await getOddsForFixture(fixture.fixture.id);
                        console.log('Odds:', odds);
                        alert('Odds loaded! Check console for details.');
                      } catch (e) {
                        console.error('Error fetching odds:', e);
                        alert('Error fetching odds. Check console.');
                      }
                    }}
                  >
                    Get Odds
                  </button>
                  
                  <button 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={async () => {
                      try {
                        const predictions = await getPredictionsForFixture(fixture.fixture.id);
                        console.log('Predictions:', predictions);
                        alert('Predictions loaded! Check console for details.');
                      } catch (e) {
                        console.error('Error fetching predictions:', e);
                        alert('Error fetching predictions. Check console.');
                      }
                    }}
                  >
                    Get Predictions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 