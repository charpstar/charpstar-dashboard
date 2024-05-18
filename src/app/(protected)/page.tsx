"use client";

import React from "react";

import { Card } from "@tremor/react";
import Datepicker, {
  DateRangeType,
  DateValueType,
} from "react-tailwindcss-datepicker";

import dayjs from "@/utils/dayjs";

import { createClient } from "@/utils/supabase/client";
import { getEventsCount } from "@/utils/BigQuery/getCountByEventName";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import Skeleton from "@/components/Skeleton";

const defaultEvents = {
  charpstAR_Load: {
    title: "CharpstAR Load",
    count: 0,
  },
  charpstAR_AR_Button_Click: {
    title: "CharpstAR AR Click",
    count: 0,
  },
  charpstAR_3D_Button_Click: {
    title: "CharpstAR 3D Click",
    count: 0,
  },
};

const today = dayjs
  .utc()
  .set("hour", 0)
  .set("minute", 0)
  .set("second", 0)
  .toDate();

const previousWeek = dayjs(today).subtract(1, "week").toDate();

export default function Index() {
  const supabase = createClient();

  const [dateRange, setDateRange] = React.useState<DateRangeType>({
    startDate: previousWeek,
    endDate: today,
  });

  const [eventsCount, setEventsCount] = React.useState(defaultEvents);

  const handleValueChange = (newValue: DateValueType) => {
    if (newValue) setDateRange(newValue); // TODO: Handle timezone.
  };
  const fromTimestamp = dayjs(dateRange.startDate!).unix() * Math.pow(10, 6);
  const toTimestamp = dayjs(dateRange.endDate!).unix() * Math.pow(10, 6);

  React.useEffect(() => {
    if (!fromTimestamp || !toTimestamp) return;

    setEventsCount(defaultEvents);

    getUserWithMetadata(supabase).then((user) => {
      const { projectId, datasetId } = user!.metadata;

      getEventsCount({
        projectId,
        datasetId,

        fromTimestamp,
        toTimestamp,
      }).then((r) =>
        setEventsCount(
          Object.fromEntries(
            Object.entries(defaultEvents).map(([event_name, data]) => [
              event_name,
              {
                ...data,
                count: r[event_name] as number,
              },
            ]),
          ) as typeof defaultEvents,
        ),
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTimestamp, toTimestamp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <Datepicker
          value={dateRange}
          onChange={handleValueChange}
          showShortcuts={true}
          maxDate={today}
        />
      </div>

      <div className="col-span-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(eventsCount).map(([event_name, { title, count }]) => (
            <EventCountCard key={event_name} title={title} value={count} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCountCard({ title, value }: { title: string; value?: number }) {
  if (!value) return <Skeleton />;

  return (
    <Card>
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
