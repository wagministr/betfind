"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { getUpcomingFixtures, Fixture } from '@/lib/apiFootball';

export default function TestPrediction() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [generatingPrediction, setGeneratingPrediction] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);

  // Load fixtures when component mounts
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setLoading(true);
        setError(null);
        const upcomingFixtures = await getUpcomingFixtures([39, 140], 3);
        console.log('Loaded fixtures:', upcomingFixtures);
        setFixtures(upcomingFixtures);
      } catch (err) {
        console.error('Error loading fixtures:', err);
        setError(err instanceof Error ? err.message : 'Error loading matches');
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, []);

  // Load existing predictions
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_predictions')
          .select('*')
          .order('generated_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        console.log('Loaded predictions:', data);
        setPredictions(data || []);
      } catch (err) {
        console.error('Error loading predictions:', err);
      }
    };

    loadPredictions();
  }, []);

  // Function to generate a prediction
  const generatePrediction = async (fixtureId: number) => {
    setGeneratingPrediction(true);
    setResult(null);
    try {
      // This endpoint will trigger our serverless function to run the prediction script
      const res = await fetch('/api/generate-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fixtureId }),
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      
      const data = await res.json();
      setResult(data);
      
      // Reload predictions
      const { data: newPredictions, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('generated_at', { ascending: false });
        
      if (!error && newPredictions) {
        setPredictions(newPredictions);
      }
    } catch (err) {
      console.error('Error generating prediction:', err);
      setResult({ error: err instanceof Error ? err.message : 'Error generating prediction' });
    } finally {
      setGeneratingPrediction(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Prediction Generation</h1>
      
      {loading ? (
        <p>Loading matches...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Select a match to generate prediction:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixtures.map(fixture => (
              <div 
                key={fixture.fixture.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFixtureId === fixture.fixture.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFixtureId(fixture.fixture.id)}
              >
                <div className="font-semibold">{fixture.teams.home.name} vs {fixture.teams.away.name}</div>
                <div className="text-sm text-gray-600">{fixture.league.name}</div>
                <div className="text-sm text-gray-600">
                  {new Date(fixture.fixture.date).toLocaleString()}
                </div>
                <div className="mt-2">
                  {predictions.some(p => p.fixture_id === fixture.fixture.id) ? (
                    <span className="text-green-600 text-sm">✓ Prediction exists</span>
                  ) : (
                    <span className="text-gray-400 text-sm">No prediction</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              className={`px-4 py-2 rounded ${
                selectedFixtureId && !generatingPrediction
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!selectedFixtureId || generatingPrediction}
              onClick={() => selectedFixtureId && generatePrediction(selectedFixtureId)}
            >
              {generatingPrediction ? 'Generating...' : 'Generate Prediction'}
            </button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Result:</h3>
              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Predictions ({predictions.length})</h2>
        <div className="overflow-auto max-h-96">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Fixture ID</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Generated At</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map(prediction => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{prediction.id}</td>
                  <td className="p-2 border">{prediction.fixture_id}</td>
                  <td className="p-2 border">{prediction.type}</td>
                  <td className="p-2 border">
                    {new Date(prediction.generated_at).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      onClick={() => {
                        const fixture = fixtures.find(f => f.fixture.id === prediction.fixture_id);
                        if (fixture) {
                          window.open(`/ai?fixtureid=${fixture.fixture.id}`, '_blank');
                        }
                      }}
                    >
                      View on AI Page
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 