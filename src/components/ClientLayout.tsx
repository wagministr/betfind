"use client";

import React from "react";
import UserIndicator from "./UserIndicator";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserIndicator />
      {children}
    </>
  );
} 