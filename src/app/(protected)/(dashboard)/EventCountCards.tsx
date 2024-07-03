import { type defaultEvents } from "@/utils/defaultEvents";

import { Card } from "@tremor/react";
import { useEventsCount } from "@/queries/useEventsCount";

import Skeleton from "@/components/Skeleton";

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

  return Object.entries(eventsCount).map(([event_name, { title, count }]) => (
    <EventCountCard key={event_name} title={title} count={count} />
  ));
}

export function EventCountCard({
  title,
  count,
}: (typeof defaultEvents)[string]) {
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
