"use client";

import React from "react";

import { Card, DonutChart } from "@tremor/react";

import { getEventsCount } from "@/utils/BigQuery/getEventsCount";
import Skeleton, { RoundSkeleton } from "@/components/Skeleton";
import { executeClientQuery } from "@/utils/BigQuery/CVR";
import CVRTable from "@/components/CVRTable";
import { buildDateRange, compToBq } from "@/utils/uiUtils";
import { useUser } from "@/contexts/UserContext";
import DateRangePicker from "@/components/DateRangePicker";

const defaultEvents = {
  charpstAR_Load: {
    title: "CharpstAR Load",
    count: undefined,
  },
  charpstAR_AR_Button_Click: {
    title: "CharpstAR AR Click",
    count: undefined,
  },
  charpstAR_3D_Button_Click: {
    title: "CharpstAR 3D Click",
    count: undefined,
  },
} as { [event_name: string]: { title: string; count: number | undefined } };

export default function Index() {
  const user = useUser();
  const { monitoredSince, projectId, datasetId } = user.metadata;

  const [eventsCount, setEventsCount] = React.useState(defaultEvents);
  const [dateRange, setDateRange] = React.useState(buildDateRange());
  const [clientQueryResult, setClientQueryResult] = React.useState<
    React.ComponentProps<typeof CVRTable>["data"]
  >([]);

  const [isQueryLoading, setIsQueryLoading] = React.useState(false);

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  React.useEffect(() => {
    if (!startTableName || !endTableName) return;
    if (!user) return;

    setEventsCount(defaultEvents);
    setClientQueryResult([]);
    setIsQueryLoading(true);

    executeClientQuery({
      projectId,
      datasetId,

      startTableName,
      endTableName,

      limit: 10,
    })
      .then((r) => setClientQueryResult(r))
      .finally(() => setIsQueryLoading(false));

    getEventsCount({
      projectId,
      datasetId,

      startTableName,
      endTableName,
    }).then((r) =>
      setEventsCount(
        Object.fromEntries(
          Object.entries(defaultEvents).map(([event_name, data]) => [
            event_name,
            {
              ...data,
              count: r[event_name] || 0,
            },
          ]),
        ) as typeof defaultEvents,
      ),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTableName, endTableName]);

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

function EventCountCard({ title, count }: (typeof defaultEvents)[string]) {
  if (count === undefined) return <Skeleton />;

  return (
    <Card>
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {title}
      </h4>

      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {count}
      </p>

      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {/* <span>Occurences</span> */}
        {/* <span>$225,000</span> */}
      </p>
    </Card>
  );
}
