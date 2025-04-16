"use client";

import HeroSection from "@/components/HeroSection"
import MatchScroller from "@/components/MatchScroller"

export default function AiLanding() {
  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <HeroSection />
      <div className="mt-8">
        <MatchScroller />
      </div>
    </main>
  )
} 