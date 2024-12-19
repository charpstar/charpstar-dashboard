"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";
import { compToBq } from "@/utils/uiUtils";
import CVRTable from "@/components/CVRTable";
import DateRangePicker from "@/components/DateRangePicker";
import { useClientQuery } from "@/queries/useClientQuery";
import { useDateRange } from "@/contexts/DateRangeContext";

export default function CVRPage() {
  const user = useUser();
  const { monitoredSince } = user.metadata;
  const { dateRange, setDateRange } = useDateRange();

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  const { clientQueryResult, isQueryLoading } = useClientQuery({
    startTableName,
    endTableName,
    limit: 100,
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detailed Stats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive product performance statistics and conversion rates
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={new Date(monitoredSince)}
        />
      </div>

      <CVRTable
        isLoading={isQueryLoading}
        data={clientQueryResult}
        showColumns={{
          ar_sessions: true,
          _3d_sessions: true,
          total_purchases: true,
          purchases_with_service: true,
          avg_session_duration_seconds: true,
        }}
        showSearch={true}
      />
    </div>
  );
}