"use client";

import React from "react";

import { Card } from "@tremor/react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

import dayjs from "@/utils/dayjs";

import { createClient } from "@/utils/supabase/client";
import { getEventsCount } from "@/utils/BigQuery/getCountByEventName";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import Skeleton from "@/components/Skeleton";

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

function normalizeDate(date: dayjs.ConfigType, isEnd: boolean) {
  return dayjs(date)
    .utc(true)
    .set("hour", isEnd ? 23 : 0)
    .set("minute", isEnd ? 59 : 0)
    .set("second", isEnd ? 59 : 0);
}

function buildDateRange(startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs) {
  return {
    startDate: (
      startDate ?? normalizeDate(undefined, false).subtract(7, "days")
    ).toDate(),
    endDate: (endDate ?? normalizeDate(undefined, true)).toDate(),
  };
}

function dateToBqTableName(date: Date) {
  return dayjs(date).utc().format("YYYYMMDD");
}

export default function Index() {
  const supabase = createClient();
  const [eventsCount, setEventsCount] = React.useState(defaultEvents);
  const [dateRange, setDateRange] = React.useState(buildDateRange());

  const handleValueChange = (newValue: DateValueType) => {
    const { startDate: startDateStr, endDate: endDateStr } = newValue ?? {};

    if (
      startDateStr &&
      endDateStr &&
      typeof startDateStr === "string" &&
      typeof endDateStr === "string"
    ) {
      const startDate = normalizeDate(startDateStr, false);
      const endDate = normalizeDate(endDateStr, true);

      setDateRange(buildDateRange(startDate, endDate));
    }
  };

  const startTableName = dateToBqTableName(dateRange.startDate);
  const endTableName = dateToBqTableName(dateRange.endDate);

  console.log({
    startTableName,
    endTableName,
  });

  React.useEffect(() => {
    if (!startTableName || !endTableName) return;

    setEventsCount(defaultEvents);

    getUserWithMetadata(supabase).then((user) => {
      const { projectId, datasetId } = user!.metadata;

      getEventsCount({
        projectId,
        datasetId,

        startTableName,
        endTableName,
      }).then(
        (r) =>
          console.table(r) ||
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
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTableName, endTableName]);

  const componentDateRange = {
    startDate: dayjs(dateRange.startDate).toISOString().split("T")[0],
    endDate: dayjs(dateRange.endDate).toISOString().split("T")[0],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <Datepicker
          value={componentDateRange}
          onChange={handleValueChange}
          showShortcuts={true}
          maxDate={dayjs().add(1, "day").toDate()}
        />
      </div>

      <div className="col-span-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(eventsCount).map(([event_name, { title, count }]) => (
            <EventCountCard key={event_name} title={title} count={count} />
          ))}
        </div>
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
