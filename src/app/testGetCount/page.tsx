"use client";

import React from "react";
import { getCountByEventName } from "@/utils/BigQuery/getCountByEventName";

export default function Test() {
  const projectId = "fast-lattice-421210";

  const datasetId = "analytics_370057646";
  const tableName = "events_20240430";
  const fromTimestamp = 1714437100788724;
  const toTimestamp = 1714506417087651;

  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    getCountByEventName({
      projectId,
      datasetId,
      tableName,

      event_name: "charpstAR_Load",
      fromTimestamp,
      toTimestamp,
    }).then(setCount);
  }, []);

  return (
    <div>
      <h1>Count: {count}</h1>
    </div>
  );
}
