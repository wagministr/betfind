"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from '@/utils/supabase';
import ClientLayout from "@/components/ClientLayout";
import ValueBetsTable from "@/components/ValueBetsTable";
import { mockBets } from "@/data/mockBets";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Store the user instead of immediately redirecting
      if (session) {
        console.log("User is logged in");
        setUser(session.user);
      } else {
        console.log("User is not logged in");
        setUser(null);
      }
      
      setCheckingAuth(false);
    };

    checkAuth();

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLoginClick = () => {
    router.push("/auth");
  };

  // Show a loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ClientLayout>
      <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            BetFind with Supabase Integration
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="text-4xl font-bold mb-6">Welcome to BetFind</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl">
            Your source for high-value betting opportunities backed by data-driven analysis.
          </p>
          <div className="flex space-x-4 mb-12">
            {!user ? (
              <Link 
                href="/auth" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
              >
                Sign In / Register
              </Link>
            ) : (
              <Link 
                href="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
        
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Today's Value Picks
            </h2>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2">
                Our algorithm analyzes thousands of betting opportunities to find the best value.
                Higher value index indicates a potentially profitable wager.
              </p>
            </div>
            
            <ValueBetsTable 
              bets={mockBets} 
              isAuthed={!!user} 
              onLoginClick={handleLoginClick} 
            />
          </div>
        </div>

        <div className="grid text-center lg:grid-cols-3 lg:text-left gap-6 w-full max-w-6xl">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">
              Data-Driven Analysis
            </h3>
            <p className="m-0 text-sm opacity-80">
              Our AI analyzes historical data, current form, and market trends to identify value bets.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">
              Value Betting Strategy
            </h3>
            <p className="m-0 text-sm opacity-80">
              Focus on bets with positive expected value over time, not just winning picks.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">
              Premium Insights
            </h3>
            <p className="m-0 text-sm opacity-80">
              Create an account to access all value picks, detailed analysis, and AI-powered recommendations.
            </p>
          </div>
        </div>
      </main>
    </ClientLayout>
  );
}
