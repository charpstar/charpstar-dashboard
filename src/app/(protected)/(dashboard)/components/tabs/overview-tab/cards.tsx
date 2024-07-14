"use client";

import Skeleton from "@/components/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventsCount } from "@/queries/useEventsCount";

function DashboardCard({
  title,
  content,
  explanation,
  icon,
}: {
  title: string;
  content: string;
  explanation: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{content}</div>
        <p className="text-xs text-muted-foreground">{explanation}</p>
      </CardContent>
    </Card>
  );
}

export default function Cards() {
  const startTableName = "20240101";
  const endTableName = "20240431";

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
      <DashboardCard
        key={event_name}
        {...data}
        content={String(data.count ?? 0)}
        explanation={String(formattedCount)}
        icon={<div>Icon</div>}
      />
    );
  });
}
