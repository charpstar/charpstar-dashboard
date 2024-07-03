import Skeleton from "@/components/Skeleton";
import { defaultEvents } from "./defaultEvents";
import { Card } from "@tremor/react";

export default function EventCountCard({
  title,
  count,
}: (typeof defaultEvents)[string]) {
  if (count === undefined) return <Skeleton />;

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
