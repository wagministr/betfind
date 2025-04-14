"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/auth");
        return;
      }
      
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BetFind Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Welcome to your Dashboard</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 dark:text-white">Account Information</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p className="dark:text-gray-200"><strong>Email:</strong> {user?.email}</p>
              <p className="dark:text-gray-200"><strong>ID:</strong> {user?.id}</p>
              <p className="dark:text-gray-200"><strong>Last Sign In:</strong> {new Date(user?.last_sign_in_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Your Content</h3>
            <p className="text-gray-600 dark:text-gray-300">Your personalized dashboard content will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 