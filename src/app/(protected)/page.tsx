"use client";

import React from "react";

import { Card } from "@tremor/react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

import dayjs from "@/utils/dayjs";

import { createClient } from "@/utils/supabase/client";
import { getEventsCount } from "@/utils/BigQuery/getEventsCount";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import Skeleton from "@/components/Skeleton";
import { executeClientQuery } from "@/utils/BigQuery/CVR";
import CVRTable from "@/components/CVRTable";

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

function dayjsToComp(date: dayjs.Dayjs) {
  return date.format("YYYY-MM-DD");
}

function compToBq(date: string) {
  return date.replace(/-/g, "");
}

function buildDateRange(
  startDate: dayjs.Dayjs = dayjs().subtract(7, "days"),
  endDate: dayjs.Dayjs = dayjs(),
) {
  return {
    startDate: dayjsToComp(startDate),
    endDate: dayjsToComp(endDate),
  };
}

export default function Index() {
  const supabase = createClient();
  const [eventsCount, setEventsCount] = React.useState(defaultEvents);
  const [dateRange, setDateRange] = React.useState(buildDateRange());
  const [clientQueryResult, setClientQueryResult] = React.useState<
    React.ComponentProps<typeof CVRTable>["rows"]
  >([]);

  const handleValueChange = (newValue: DateValueType) => {
    const { startDate: startDateStr, endDate: endDateStr } = newValue ?? {};

    if (
      startDateStr &&
      endDateStr &&
      typeof startDateStr === "string" &&
      typeof endDateStr === "string"
    ) {
      setDateRange(newValue as { startDate: string; endDate: string });
    }
  };

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  React.useEffect(() => {
    if (!startTableName || !endTableName) return;

    setEventsCount(defaultEvents);

    getUserWithMetadata(supabase).then((user) => {
      const { projectId, datasetId } = user!.metadata;

      executeClientQuery({
        projectId,
        datasetId,
        limit: 10,
      })
        .then((r) =>
          r.map((row) => {
            return {
              product_name: row.products_name,
              arSessionsCount: row.AR_Button_Clicks,
              threeDSessionsCount: row._3D_Button_Clicks,
              CVR: {
                default: 0,
                charpstAR: 0,
              },
            };
          }),
        )
        .then((r) => setClientQueryResult(r));

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
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTableName, endTableName]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <Datepicker
          value={dateRange}
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

      <div className="col-span-2">
        <CVRTable rows={clientQueryResult} onShowMoreClick={() => {}} />
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
