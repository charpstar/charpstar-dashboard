"use client";

import React from "react";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import CVRTable from "@/components/CVRTable";
import { buildDateRange, compToBq } from "@/utils/uiUtils";
import { useUser } from "@/contexts/UserContext";
import DateRangePicker from "@/components/DateRangePicker";
import { useQuery } from "@tanstack/react-query";
import { executeClientQueryFn } from "@/queries/executeClientQueryFn";

export default function Index() {
  const user = useUser();
  const { monitoredSince, projectId, datasetId } = user.metadata;

  const [dateRange, setDateRange] = React.useState(buildDateRange());

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  const shouldEnableFetching = Boolean(user && startTableName && endTableName);

  const { data: _clientQueryResult, isLoading: isQueryLoading } = useQuery({
    queryKey: [
      "clientQuery",
      projectId,
      datasetId,
      startTableName,
      endTableName,
      100,
    ],
    queryFn: executeClientQueryFn,
    enabled: shouldEnableFetching,
  });

  const clientQueryResult = _clientQueryResult || [];

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
