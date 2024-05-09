"use client";

import React from "react";

import { Card } from "@tremor/react";
import { DatePicker } from "@/components/DatePicker";

import { createClient } from "@/utils/supabase/client";
import { getCountByEventName } from "@/utils/BigQuery/getCountByEventName";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

const events = [
  "charpstAR_Load",
  "charpstAR_AR_Button_Click",
  "charpstAR_3D_Button_Click",
];

const emptyEventsCount = Object.fromEntries(
  events.map((event) => [event, "∞"]),
);

function EventCountCard({
  title,
  value = "∞",
}: {
  title: string;
  value?: string;
}) {
  return (
    <Card className="max-w-md">
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {title}
      </h4>

      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {value}
      </p>

      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {/* <span>Occurences</span> */}
        {/* <span>$225,000</span> */}
      </p>
    </Card>
  );
}

function DateSelector({
  title,
  setDate,
}: {
  title: string;
  setDate: (date: Date) => void;
}) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold pb-2">{title}</h1>
      <DatePicker handleChange={setDate} />
    </div>
  );
}

export default function Index() {
  const supabase = createClient();

  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const fromTimestampSecs = fromDate?.getTime();
  const toTimestampSecs = toDate?.getTime();

  const fromTimestamp = fromTimestampSecs && fromTimestampSecs * 1000;
  const toTimestamp = toTimestampSecs && toTimestampSecs * 1000;

  const [eventsCount, setEventsCount] = React.useState(emptyEventsCount);

  React.useEffect(() => {
    if (!fromTimestamp || !toTimestamp) return;

    console.log(fromTimestamp, toTimestamp);

    setEventsCount(emptyEventsCount);

    getUserWithMetadata(supabase).then((user) => {
      const { projectId, datasetId, tableName } = user!.metadata;

      for (const event_name of events) {
        getCountByEventName({
          projectId,
          datasetId,
          tableName,

          event_name,
          fromTimestamp,
          toTimestamp,
        }).then((count) =>
          setEventsCount((prev) => ({
            ...prev,
            [event_name]: String(count),
          })),
        );
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTimestamp, toTimestamp]);

  return (
    <div className="grid grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="col-start-2 rounded-lg dark:border-gray-600">
        <DateSelector title="From" setDate={setFromDate} />
      </div>

      <div className="col-start-3 rounded-lg dark:border-gray-600">
        <DateSelector title="To" setDate={setToDate} />
      </div>

      {Object.entries(eventsCount).map(([event, count]) => (
        <div key={event}>
          <EventCountCard title={event} value={count} />
        </div>
      ))}
    </div>
  );
}
