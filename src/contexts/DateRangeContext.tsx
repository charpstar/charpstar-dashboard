"use client";

import React from "react";
import type { DateRange } from "react-day-picker";

type OptionalDateRange = DateRange | undefined;

export const DateRangeContext =
  React.createContext<OptionalDateRange>(undefined);

export const DateRangeProvider = ({
  children,
  dateRange,
}: React.PropsWithChildren<{
  dateRange: OptionalDateRange;
}>) => {
  return (
    <DateRangeContext.Provider value={dateRange}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = React.useContext(DateRangeContext);

  if (!context)
    throw new Error("useDateRange must be used within a DateRangeProvider");

  return context;
};
