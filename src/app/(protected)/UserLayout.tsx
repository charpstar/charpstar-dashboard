"use client";

import React from "react";

import { useUser } from "@/contexts/UserContext";

export default function Index({ children }: { children: React.ReactNode }) {
  const user = useUser();

  return (
    <div className="grid grid-cols-12 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="col-span-12 lg:col-span-6 rounded-lg dark:border-gray-600">
        <h1
          className="text-2xl font-semibold dark:text-white"
          style={{ marginBottom: 0 }}
        >
          {user.metadata.name}
        </h1>
      </div>

      {children}
    </div>
  );
}
