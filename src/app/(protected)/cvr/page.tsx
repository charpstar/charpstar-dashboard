"use client";

import React from "react";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import CVRTable from "@/components/CVRTable";
import { buildDateRange, compToBq } from "@/utils/uiUtils";
import { useUser } from "@/contexts/UserContext";
import DateRangePicker from "@/components/DateRangePicker";

export default function Index() {
  const user = useUser();

  const [dateRange, setDateRange] = React.useState(buildDateRange());
  const [clientQueryResult, setClientQueryResult] = React.useState<
    React.ComponentProps<typeof CVRTable>["rows"] | null
  >(null);

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  React.useEffect(() => {
    if (!startTableName || !endTableName) return;
    if (!user) return;

    const { projectId, datasetId } = user.metadata;

    executeClientQuery({
      projectId,
      datasetId,

      startTableName,
      endTableName,

      limit: 100,
    }).then((r) => setClientQueryResult(r));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTableName, endTableName]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="col-span-3">
        <CVRTable
          rows={clientQueryResult}
          showColumns={{
            total_purchases: true,
            purchases_with_service: true,
          }}
        />
      </div>
    </div>
  );
}
