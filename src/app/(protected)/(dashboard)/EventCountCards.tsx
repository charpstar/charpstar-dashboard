import { type defaultEvents } from "@/utils/defaultEvents";

import { Card } from "@tremor/react";
import { useEventsCount } from "@/queries/useEventsCount";

import Skeleton from "@/components/Skeleton";
import { Tooltip } from "@/components/TremorRawTooltip";

export default function EventCountCards({
  startTableName,
  endTableName,
}: {
  startTableName: string;
  endTableName: string;
}) {
  const { eventsCount, isEventsCountLoading } = useEventsCount({
    startTableName,
    endTableName,
  });

  if (isEventsCountLoading)
    return (
      <>
        {Array(Object.keys(eventsCount).length)
          .fill(undefined)
          .map((_, i) => (
            <Skeleton key={i} />
          ))}
      </>
    );

  return Object.entries(eventsCount).map(([event_name, data]) => (
    <EventCountCard key={event_name} {...data} />
  ));
}

export function EventCountCard({
  title,
  count,
  tooltip,
}: (typeof defaultEvents)[string]) {
  return (
    <Tooltip side="top" content={tooltip}>
      <Card>
        <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          {title}
        </h4>

        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {count?.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>

        <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          {/* <span>Occurences</span> */}
          {/* <span>$225,000</span> */}
        </p>
      </Card>
    </Tooltip>
  );
}
