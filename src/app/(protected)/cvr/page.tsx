"use client";

import React from "react";

import { useUser } from "@/contexts/UserContext";
import { buildDateRange, compToBq } from "@/utils/uiUtils";

import DateRangePicker from "@/components/DateRangePicker";
import { useClientQuery } from "@/queries/useClientQuery";
import { DataTable } from "@/components/cvr-table/data-table";
import { columns } from "@/components/cvr-table/columns";

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

  return <DataTable columns={columns} data={clientQueryResult} />;

  /* <CVRTable
            isLoading={isQueryLoading}
            data={clientQueryResult}
            showColumns={{
              ar_sessions: false,
              _3d_sessions: false,
              total_purchases: true,
              purchases_with_service: true,
              avg_session_duration_seconds : true,
            }}
            showSearch={true}
          /> */
}
