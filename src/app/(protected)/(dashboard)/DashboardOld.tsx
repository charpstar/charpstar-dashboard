"use client";

import React from "react";

import { buildDateRange, compToBq } from "@/utils/uiUtils";
import DateRangePicker from "@/components/DateRangePicker";

import EventCountCards from "./EventCountCards";
import TechBreakdownPie from "./TechBreakdownPie";


export default function Dashboard({
  dateRangePickerMinDate,
}: {
  dateRangePickerMinDate: string;
}) {
  const [dateRange, setDateRange] = React.useState(buildDateRange());

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  return (
    <>
      <div className="col-span-12 lg:col-span-3 lg:col-start-10 rounded-lg dark:border-gray-600">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={new Date(dateRangePickerMinDate)}
        />
      </div>

      <div className="col-span-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <EventCountCards
            startTableName={startTableName}
            endTableName={endTableName}
          />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <TechBreakdownPie
          startTableName={startTableName}
          endTableName={endTableName}
        />
      </div>
    </>
  );
}
