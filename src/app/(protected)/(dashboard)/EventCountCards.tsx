"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { defaultEvents, type EventName, type EventsData } from "@/utils/defaultEvents";
import { isMonthlyView } from "@/utils/uiUtils";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useClientQuery } from "@/queries/useClientQuery";
import dayjs from "@/utils/dayjs";

// Define the order of metrics
const METRICS_ORDER: EventName[] = [
  "charpstAR_Load",
  "total_unique_users",
  "total_activated_users",
  "percentage_charpstAR",
  "overall_conv_rate",
  "overall_conv_rate_CharpstAR",
  "total_purchases_after_ar",
  "cart_percentage_default",
  "cart_after_ar_percentage",
  "average_order_value_all_users",
  "average_order_value_ar_users",
  "charpstAR_AR_Button_Click",
  "charpstAR_3D_Button_Click",
  "session_time_default",
  "combined_session_time",
  "average_pages_after_ar"
];

interface EventCountCardProps {
  title: string;
  tooltip: string;
  count: number;
  formattedCount: React.ReactNode;
}

export function EventCountCard({
  title,
  tooltip,
  formattedCount,
}: EventCountCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">{formattedCount}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCount(eventName: EventName, count: number): React.ReactNode {
  // Percentage metrics
  if ([
    "percentage_charpstAR",
    "overall_conv_rate",
    "overall_conv_rate_CharpstAR",
    "cart_percentage_default",
    "cart_after_ar_percentage"
  ].includes(eventName)) {
    return <><span>{count}</span><span className="text-sm ml-1">%</span></>;
  }

  // Time metrics
  if (["combined_session_time", "session_time_default"].includes(eventName)) {
    return <><span>{count}</span><span className="text-xs ml-1 text-muted-foreground">seconds</span></>;
  }

  // Currency metrics
  if (["average_order_value_all_users", "average_order_value_ar_users"].includes(eventName)) {
    return <><span>{count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></>;
  }

  // Large number metrics
  if ([
    "charpstAR_Load",
    "total_unique_users",
    "total_activated_users",
    "charpstAR_AR_Button_Click",
    "charpstAR_3D_Button_Click",
    "total_purchases_after_ar"
  ].includes(eventName)) {
    return count.toLocaleString();
  }

  // Default formatting
  return count;
}

export default function EventCountCards({
  eventsCount,
  isLoading,
}: {
  eventsCount: EventsData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <>
        {Array(4)
          .fill(undefined)
          .map((_, i) => (
            <Card key={i} className="w-full h-32 animate-pulse bg-muted">
              <CardContent className="p-6">
                <div className="h-4 w-3/4 bg-muted-foreground/20 rounded"></div>
                <div className="h-8 w-1/2 bg-muted-foreground/20 rounded mt-4"></div>
              </CardContent>
            </Card>
          ))}
      </>
    );
  }

  return METRICS_ORDER.map(eventName => {
    const count = eventsCount[eventName];
    const eventMetadata = defaultEvents[eventName];
    
    if (count === undefined || !eventMetadata) return null;

    return (
      <EventCountCard 
        key={eventName}
        title={eventMetadata.title}
        tooltip={eventMetadata.tooltip}
        count={count}
        formattedCount={formatCount(eventName, count)}
      />
    );
  }).filter(Boolean);
}