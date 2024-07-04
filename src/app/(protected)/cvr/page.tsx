"use client";

import React from "react";

import { useUser } from "@/contexts/UserContext";
import { buildDateRange, compToBq } from "@/utils/uiUtils";

import UserLayout from "../UserLayout";

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
    <UserLayout>
      <>
        <div className="col-span-12 lg:col-span-3 lg:col-start-10 rounded-lg dark:border-gray-600">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            minDate={new Date(monitoredSince)}
          />
        </div>

        <div className="col-span-12">
          <CVRTable
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
          />
        </div>
      </>
    </UserLayout>
  );
}
