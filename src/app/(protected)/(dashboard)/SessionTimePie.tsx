import { Card, CardContent } from "@/components/ui/card";
import { useEventsCount } from "@/queries/useEventsCount";

import { RoundSkeleton } from "@/components/Skeleton";

export default function SessionTimePie({
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

  const pieData = [
    {
      name: "AR Sessions",
      value: eventsCount.charpstAR_AR_Button_Click?.count ?? 0,
    },
    {
      name: "3D Sessions",
      value: eventsCount.charpstAR_3D_Button_Click?.count ?? 0,
    },
  ];

  if (isEventsCountLoading)
    return (
      <div className="flex items-center justify-center h-[320px]">
        <RoundSkeleton />
      </div>
    );

  return (
    <Card>
      <CardContent>
        <div className="space-y-5">
          <span className="text-center block font-mono">
            Sessions Time (Tech Breakdown)
          </span>
          <div className="flex items-center justify-center h-[320px]">
            {/* <DonutChart
              data={pieData}
              variant="pie"
              valueFormatter={(number: number) => `${number} clicks`}
              className="w-full h-full"
            /> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
