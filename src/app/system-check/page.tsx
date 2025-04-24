"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { validateEnv } from '@/utils/envCheck';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

export default function SystemCheckPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'success' | 'warning' | 'error'>('success');

  useEffect(() => {
    runSystemChecks();
  }, []);

  useEffect(() => {
    // Calculate overall status based on test results
    if (results.some(r => !r.success)) {
      setOverallStatus('error');
    } else if (results.some(r => r.message.includes('warning'))) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('success');
    }
  }, [results]);

  async function runSystemChecks() {
    setLoading(true);
    const checkResults: TestResult[] = [];

    // 1. Check environment variables
    try {
      const envCheck = validateEnv();
      checkResults.push({
        name: 'Environment Variables',
        success: envCheck.isValid,
        message: envCheck.message,
        details: !envCheck.isValid ? { error: envCheck.message } : undefined
      });
    } catch (error) {
      checkResults.push({
        name: 'Environment Variables',
        success: false,
        message: `Error checking environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 2. Test Supabase connection
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('fixture_id')
        .limit(1);

      checkResults.push({
        name: 'Supabase Connection',
        success: !error,
        message: error ? `Error connecting to Supabase: ${error.message}` : 'Successfully connected to Supabase',
        details: error ? error : { rowCount: data?.length || 0 }
      });
    } catch (error) {
      checkResults.push({
        name: 'Supabase Connection',
        success: false,
        message: `Exception connecting to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 3. Test API-Football connection
    try {
      const response = await fetch('/api/test-football', {
        method: 'GET',
      });

      const apiResult = await response.json();

      checkResults.push({
        name: 'API-Football Connection',
        success: response.ok,
        message: response.ok ? 'Successfully connected to API-Football' : 'Error connecting to API-Football',
        details: apiResult
      });
    } catch (error) {
      checkResults.push({
        name: 'API-Football Connection',
        success: false,
        message: `Exception testing API-Football: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 4. Check tables in Supabase
    try {
      // Check if fixtures table exists and has data
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('count', { count: 'exact', head: true });

      const fixturesCount = fixtures || 0;

      // Check if ai_predictions table exists and has data
      const { data: predictions, error: predictionsError } = await supabase
        .from('ai_predictions')
        .select('count', { count: 'exact', head: true });

      const predictionsCount = predictions || 0;

      const tablesResult = !fixturesError && !predictionsError;
      const message = tablesResult 
        ? `Database tables checked: fixtures (${fixturesCount} rows), ai_predictions (${predictionsCount} rows)` 
        : `Error checking database tables: ${fixturesError?.message || ''} ${predictionsError?.message || ''}`;

      checkResults.push({
        name: 'Database Tables',
        success: tablesResult,
        message,
        details: { fixturesCount, predictionsCount }
      });
    } catch (error) {
      checkResults.push({
        name: 'Database Tables',
        success: false,
        message: `Exception checking database tables: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // 5. Test cron endpoint
    try {
      // Only test this in development mode
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/api/test-cron', {
          method: 'GET',
        });

        const result = await response.json();

        checkResults.push({
          name: 'Cron Endpoint',
          success: response.ok,
          message: response.ok ? 'Successfully tested cron endpoint' : 'Error testing cron endpoint',
          details: result
        });
      } else {
        checkResults.push({
          name: 'Cron Endpoint',
          success: true,
          message: 'Cron endpoint test skipped in production',
        });
      }
    } catch (error) {
      checkResults.push({
        name: 'Cron Endpoint',
        success: false,
        message: `Exception testing cron endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults(checkResults);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">System Configuration Check</h1>
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${
              overallStatus === 'success' ? 'bg-green-500' :
              overallStatus === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              Overall Status: {
                overallStatus === 'success' ? 'All Systems Operational' :
                overallStatus === 'warning' ? 'System Operating with Warnings' :
                'System Error Detected'
              }
            </span>
          </div>
          
          <button
            onClick={() => runSystemChecks()}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? 'Running Checks...' : 'Run Checks Again'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
                  ${result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{result.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{result.message}</p>
                  
                  {result.details && (
                    <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-md p-3 overflow-auto max-h-48">
                      <pre className="text-sm text-gray-800 dark:text-gray-200">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}