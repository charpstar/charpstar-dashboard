"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  trend?: number;
}

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) return null;
  
  const isPositive = value > 0;
  return (
    <div className="flex flex-col items-end">
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
      <span className="text-xs text-muted-foreground">vs previous 30 days</span>
    </div>
  );
}

export function EventCountCard({
  title,
  tooltip,
  formattedCount,
  trend,
}: EventCountCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {title}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{formattedCount}</div>
                {trend !== undefined && <TrendIndicator value={trend} />}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  const { dateRange } = useDateRange();
  const isMonthly = isMonthlyView(dateRange.startDate, dateRange.endDate);

  // Fetch previous period data for comparison if viewing monthly
  const previousStart = dayjs(dateRange.startDate).subtract(30, 'days').format('YYYY-MM-DD');
  const previousEnd = dayjs(dateRange.endDate).subtract(30, 'days').format('YYYY-MM-DD');
  
  const { eventsCount: previousEventsCount } = useClientQuery({
    startTableName: previousStart.replace(/-/g, ''),
    endTableName: previousEnd.replace(/-/g, ''),
    limit: 10,
  });

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

    // Calculate trend if viewing monthly data
    let trend: number | undefined;
    if (isMonthly && previousEventsCount) {
      const previousCount = previousEventsCount[eventName];
      if (previousCount !== undefined && previousCount !== 0) {
        trend = ((count - previousCount) / previousCount) * 100;
      }
    }

    return (
      <EventCountCard 
        key={eventName}
        title={eventMetadata.title}
        tooltip={eventMetadata.tooltip}
        count={count}
        formattedCount={formatCount(eventName, count)}
        trend={trend}
      />
    );
  }).filter(Boolean);
}