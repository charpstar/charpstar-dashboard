"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      {children}
    </div>
  );
}