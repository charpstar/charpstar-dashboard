import { defaultEvents } from "@/utils/defaultEvents";

import Skeleton from "@/components/Skeleton";
import { Card } from "@tremor/react";

export default function EventCountCard({
  title,
  count,
  isLoading,
}: (typeof defaultEvents)[string] & { isLoading: boolean }) {
  if (isLoading) return <Skeleton />;

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
