import { type defaultEvents } from "@/utils/defaultEvents";
import React from "react";
import { Card } from "@/components/ui/card";
import { useEventsCount } from "@/queries/useEventsCount";

import Skeleton from "@/components/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    const isPercentageCard = [
      "percentage_charpstAR",
      "overall_conv_rate",
      "overall_conv_rate_CharpstAR",
    ].includes(event_name);
    const formattedCount = isPercentageCard ? (
      <>
        <span>{data.count}</span>
        <span style={{ fontSize: "0.8em" }}>%</span>
      </>
    ) : [
        "charpstAR_Load",
        "charpstAR_AR_Button_Click",
        "charpstAR_3D_Button_Click",
      ].includes(event_name) ? (
      (data.count ?? 0).toLocaleString()
    ) : ["combined_session_time", "session_time_default"].includes(
        event_name,
      ) ? (
      <>
        <span>{data.count ?? 0}</span>
        <span style={{ fontSize: "0.5em", color: "#eee", fontWeight: "300" }}>
          {" "}
          seconds
        </span>
      </>
    ) : (
      data.count ?? 0
    );

    return (
      <EventCountCard
        key={event_name}
        {...data}
        count={data.count}
        formattedCount={formattedCount}
      />
    );
  });
}

export function EventCountCard({
  title,
  count,
  tooltip,
  formattedCount,
}: (typeof defaultEvents)[string] & { formattedCount: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{tooltip}</TooltipTrigger>
        <TooltipContent>
          <Card>
            <h4 className="">{title}</h4>

            <p className="font-semibold">{formattedCount}</p>

            <p className="mt-4 flex items-center justify-between">
              {/* <span>Occurences</span> */}
              {/* <span>$225,000</span> */}
            </p>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
