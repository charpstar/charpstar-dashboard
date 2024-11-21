"use client";

import { useEventsCount } from "@/queries/useEventsCount";

export default function TechBreakdownPie({
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

  const arClicks = eventsCount.charpstAR_AR_Button_Click?.count ?? 0;
  const threeDClicks = eventsCount.charpstAR_3D_Button_Click?.count ?? 0;
  const total = arClicks + threeDClicks;

  const arPercentage = total > 0 ? (arClicks / total) * 100 : 0;
  const threeDPercentage = total > 0 ? (threeDClicks / total) * 100 : 0;

  if (isEventsCountLoading) {
    return (
      <div className="h-[280px] w-full animate-pulse bg-muted rounded-lg" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[280px]">
      {/* Custom SVG Donut Chart */}
      <div className="relative">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            className="text-muted/10"
          />
          {/* AR Usage Arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#414143"
            strokeWidth="24"
            strokeDasharray={`${arPercentage * 5.024} 502.4`}
          />
          {/* 3D Usage Arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#939395"
            strokeWidth="24"
            strokeDasharray={`${threeDPercentage * 5.024} 502.4`}
            strokeDashoffset={-arPercentage * 5.024}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">Total Sessions</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 mt-8">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#414143' }}></div>
          <span className="text-sm ml-2">AR ({arClicks})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#939395' }}></div>
          <span className="text-sm ml-2">3D ({threeDClicks})</span>
        </div>
      </div>
    </div>
  );
}