import { type defaultEvents } from "@/utils/defaultEvents";
import React from "react"; 
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

    return Object.entries(eventsCount).map(([event_name, data]) => {
      const isPercentageCard = ["percentage_charpstAR", "overall_conv_rate", "overall_conv_rate_CharpstAR"].includes(event_name);
      const formattedCount = isPercentageCard 
      ? <><span>{data.count}</span><span style={{ fontSize: '0.8em' }}>%</span></>
      : ["charpstAR_Load", "charpstAR_AR_Button_Click", "charpstAR_3D_Button_Click"].includes(event_name) 
        ? (data.count ?? 0).toLocaleString() 
        : ["combined_session_time", "session_time_default"].includes(event_name)
          ? <><span>{data.count ?? 0}</span><span style={{ fontSize: '0.5em', color: '#eee', fontWeight: '300' }}> seconds</span></>
          : data.count ?? 0;

    return <EventCountCard key={event_name} {...data} count={data.count} formattedCount={formattedCount} />;
  });
}
 

  export function EventCountCard({
    title,
    count,
    tooltip,
    formattedCount,
  }: (typeof defaultEvents)[string] & { formattedCount: React.ReactNode }) { // Update the type here
    return (
      <Tooltip side="top" content={tooltip}>
        <Card>
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            {title}
          </h4>
  
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {formattedCount}
          </p>
  
          <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            {/* <span>Occurences</span> */}
            {/* <span>$225,000</span> */}
          </p>
        </Card>
      </Tooltip>
    );
  }