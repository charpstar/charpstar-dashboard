"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";

import { compToBq } from "@/utils/uiUtils";
import DateRangePicker from "@/components/DateRangePicker";
import EventCountCards from "./EventCountCards";
import TechBreakdownPie from "./TechBreakdownPie";
import PerformanceTrends from "./PerformanceTrends";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useClientQuery } from "@/queries/useClientQuery";

export default function Dashboard({
  dateRangePickerMinDate,
}: {
  dateRangePickerMinDate: string;
}) {
  const { dateRange, setDateRange } = useDateRange();

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  const { eventsCount, isQueryLoading } = useClientQuery({
    startTableName,
    endTableName,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Your CharpstAR analytics overview
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={new Date(dateRangePickerMinDate)}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <EventCountCards
            eventsCount={eventsCount}
            isLoading={isQueryLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <PerformanceTrends />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <LayoutGrid className="h-4 w-4" />
                Technology Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TechBreakdownPie
                eventsCount={eventsCount}
                isLoading={isQueryLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}