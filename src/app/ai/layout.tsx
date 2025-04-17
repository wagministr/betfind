"use client";

import React from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function AILayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={handleSignOut}
        className="fixed z-50 top-4 right-4 py-1 px-3 bg-gray-800/80 backdrop-blur-sm rounded-md shadow-sm text-sm text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
      >
        Sign Out
      </button>
      {children}
    </>
  );
} 