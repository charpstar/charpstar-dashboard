"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, DonutChart } from "@tremor/react";

import { defaultEvents } from "./defaultEvents";

import { buildDateRange, compToBq } from "@/utils/uiUtils";
import { useUser } from "@/contexts/UserContext";

import { RoundSkeleton } from "@/components/Skeleton";
import CVRTable from "@/components/CVRTable";
import DateRangePicker from "@/components/DateRangePicker";
import EventCountCard from "./EventCountCard";

import { getEventsCountFn } from "@/queries/getEventsCountFn";
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
      10,
    ],
    queryFn: executeClientQueryFn,
    enabled: shouldEnableFetching,
  });

  const clientQueryResult = _clientQueryResult || [];

  const { data: _eventsCount, isLoading: isEventsCountLoading } = useQuery({
    queryKey: [
      "eventsCount",
      projectId,
      datasetId,
      startTableName,
      endTableName,
    ],
    queryFn: getEventsCountFn,
    enabled: shouldEnableFetching,
  });

  const eventsCount = _eventsCount || defaultEvents;

  const pieData = [
    {
      name: "AR Sessions",
      value: eventsCount.charpstAR_AR_Button_Click?.count || 0,
    },
    {
      name: "3D Sessions",
      value: eventsCount.charpstAR_3D_Button_Click?.count || 0,
    },
  ];

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
          minDate={monitoredSince}
        />
      </div>

      <div className="col-span-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(eventsCount).map(([event_name, { title, count }]) => (
            <EventCountCard key={event_name} title={title} count={count} />
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <CVRTable
          isLoading={isQueryLoading}
          showPaginationControls={false}
          data={clientQueryResult}
          showColumns={{
            total_purchases: false,
            purchases_with_service: false,
            _3d_sessions: false,
            ar_sessions: false,
          }}
        />
      </div>

      <div className="col-span-12 lg:col-span-5">
        {eventsCount.charpstAR_AR_Button_Click?.count === undefined ? (
          <div className="flex items-center justify-center h-[320px]">
            <RoundSkeleton />
          </div>
        ) : (
          <Card>
            <div className="space-y-5">
              <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                CharpstAR Sessions (Tech Breakdown)
              </span>
              <div className="flex items-center justify-center h-[320px]">
                <DonutChart
                  data={pieData}
                  variant="pie"
                  valueFormatter={(number: number) => `${number} clicks`}
                  className="w-full h-full"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
