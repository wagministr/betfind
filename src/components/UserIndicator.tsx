"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function UserIndicator() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || null);
      setLoading(false);
    };

    getUser();

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 text-sm text-gray-600 dark:text-gray-300 flex items-center">
        <div className="h-3 w-3 mr-2 rounded-full bg-gray-300 animate-pulse"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed z-50 top-4 right-4 py-1 px-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
      {email ? (
        <div className="flex items-center">
          <div className="h-2 w-2 mr-2 rounded-full bg-green-500"></div>
          Signed in as: {email}
        </div>
      ) : (
        <div className="flex items-center">
          <div className="h-2 w-2 mr-2 rounded-full bg-gray-400"></div>
          Guest
        </div>
      )}
    </div>
  );
} 