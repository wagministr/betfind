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
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("User is already authenticated, redirecting to dashboard");
        // Redirect to dashboard immediately if already authenticated
        router.push("/dashboard");
      }
      
      setIsAuthenticated(!!data.session);
      setLoading(false);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newAuthStatus = !!session;
      setIsAuthenticated(newAuthStatus);
      
      // Redirect to dashboard when user signs in
      if (newAuthStatus) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleAuthSuccess = () => {
    router.push("/dashboard"); // Redirect to dashboard after successful auth
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

  // This will only show if the user is not authenticated
  // Otherwise, they'll be redirected to dashboard
  return (
    <ClientLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center dark:text-white">BetFind</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">Sign in to your account</p>
        </div>

        <AuthModal onSuccess={handleAuthSuccess} />
      </div>
    </ClientLayout>
  );
} 