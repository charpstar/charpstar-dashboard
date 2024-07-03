"use client";

import React from "react";

import { useUser } from "@/contexts/UserContext";
import { buildDateRange, compToBq } from "@/utils/uiUtils";

import CVRTable from "@/components/CVRTable";
import DateRangePicker from "@/components/DateRangePicker";
import { useClientQuery } from "@/queries/useClientQuery";

export default function Index() {
  const user = useUser();
  const { monitoredSince } = user.metadata;

  const [dateRange, setDateRange] = React.useState(buildDateRange());

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  const { clientQueryResult, isQueryLoading } = useClientQuery({
    startTableName,
    endTableName,
    limit: 100,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="rounded-lg dark:border-gray-600">
        <h1
          className="text-2xl font-semibold dark:text-white"
          style={{ marginBottom: 0 }}
        >
          {user.metadata.name}
        </h1>
      </div>

      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={monitoredSince}
        />
      </div>

      <div className="col-span-3">
        <CVRTable
          isLoading={isQueryLoading}
          data={clientQueryResult}
          showColumns={{
            ar_sessions: true,
            _3d_sessions: true,
            total_purchases: true,
            purchases_with_service: true,
          }}
          showSearch={true}
        />
      </div>
    </div>
  );
}
