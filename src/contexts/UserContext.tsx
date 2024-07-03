"use client";

import React from "react";
import { type getUserWithMetadata } from "@/utils/supabase/getUser";

type UserOrNull = Awaited<ReturnType<typeof getUserWithMetadata>> | null;

export const UserContext = React.createContext<UserOrNull>(null);

export const UserProvider = ({
  children,
  user,
}: React.PropsWithChildren<{
  user: UserOrNull;
}>) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = React.useContext(UserContext);

  if (!context) throw new Error("useUser must be used within a UserProvider");

  return context;
};
