"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/utils/supabase";
import ClientLayout from "@/components/ClientLayout";

export default function AuthPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setLoading(false);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    router.push("/dashboard"); // Redirect to dashboard or home page after successful auth
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center dark:text-white">BetFind</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">Sign in to your account</p>
        </div>

        {isAuthenticated ? (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md text-center">
            <p className="text-xl mb-4 dark:text-white">You are already logged in</p>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-200"
            >
              Sign Out
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <AuthModal onSuccess={handleAuthSuccess} />
        )}
      </div>
    </ClientLayout>
  );
} 