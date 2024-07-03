"use client";

import React from "react";

import { buildDateRange, compToBq } from "@/utils/uiUtils";
import { useUser } from "@/contexts/UserContext";

import DateRangePicker from "@/components/DateRangePicker";

import EventCountCards from "./EventCountCards";
import TechBreakdownPie from "./TechBreakdownPie";
import DashboardCVRTable from "./DashboardCVRTable";

export default function Index() {
  const user = useUser();
  const { monitoredSince } = user.metadata;

  const [dateRange, setDateRange] = React.useState(buildDateRange());

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

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

      <div className="col-span-12 lg:col-span-4 lg:col-start-10 rounded-lg dark:border-gray-600">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={new Date(monitoredSince)}
        />
      </div>

      <div className="col-span-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <EventCountCards
            startTableName={startTableName}
            endTableName={endTableName}
          />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <DashboardCVRTable
          startTableName={startTableName}
          endTableName={endTableName}
        />
      </div>

      <div className="col-span-12 lg:col-span-5">
        <TechBreakdownPie
          startTableName={startTableName}
          endTableName={endTableName}
        />
      </div>
    </div>
  );
}
