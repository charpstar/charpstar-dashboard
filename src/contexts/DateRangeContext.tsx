"use client";

import React, { createContext, useContext, useState } from "react";
import { buildDateRange } from "@/utils/uiUtils";
import { useUser } from "./UserContext";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [dateRange, setDateRange] = useState<DateRange>(
    buildDateRange(user.metadata.monitoredSince)
  );

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}