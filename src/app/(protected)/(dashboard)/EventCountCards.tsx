import { type defaultEvents } from "@/utils/defaultEvents";
import React from "react"; 
import { useEventsCount } from "@/queries/useEventsCount";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
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

  if (isEventsCountLoading) {
    return (
      <>
        {Array(Object.keys(eventsCount).length)
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

  return Object.entries(eventsCount).map(([event_name, data]) => {
    const isPercentageCard = ["percentage_charpstAR", "overall_conv_rate", "overall_conv_rate_CharpstAR"].includes(event_name);
    const formattedCount = isPercentageCard 
      ? <><span>{data.count}</span><span className="text-sm ml-1">%</span></>
      : ["charpstAR_Load", "charpstAR_AR_Button_Click", "charpstAR_3D_Button_Click"].includes(event_name) 
        ? (data.count ?? 0).toLocaleString() 
        : ["combined_session_time", "session_time_default"].includes(event_name)
          ? <><span>{data.count ?? 0}</span><span className="text-xs ml-1 text-muted-foreground"> seconds</span></>
          : data.count ?? 0;

    return <EventCountCard key={event_name} {...data} count={data.count} formattedCount={formattedCount} />;
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
        <TooltipTrigger asChild>
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formattedCount}</div>
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