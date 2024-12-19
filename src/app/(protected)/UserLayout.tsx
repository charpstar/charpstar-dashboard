"use client";

import React from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      {children}
    </div>
  );
}