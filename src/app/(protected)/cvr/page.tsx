"use client";

import React from "react";

import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

import dayjs from "@/utils/dayjs";

import { createClient } from "@/utils/supabase/client";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import CVRTable from "@/components/CVRTable";
import { buildDateRange, compToBq } from "../page";

export default function Index() {
  const supabase = createClient();
  const [dateRange, setDateRange] = React.useState(buildDateRange());
  const [clientQueryResult, setClientQueryResult] = React.useState<
    React.ComponentProps<typeof CVRTable>["rows"]
  >([]);

  const handleValueChange = (newValue: DateValueType) => {
    const { startDate: startDateStr, endDate: endDateStr } = newValue ?? {};

    if (
      startDateStr &&
      endDateStr &&
      typeof startDateStr === "string" &&
      typeof endDateStr === "string"
    ) {
      setDateRange(newValue as { startDate: string; endDate: string });
    }
  };

  const startTableName = compToBq(dateRange.startDate);
  const endTableName = compToBq(dateRange.endDate);

  React.useEffect(() => {
    if (!startTableName || !endTableName) return;

    getUserWithMetadata(supabase).then((user) => {
      const { projectId, datasetId } = user!.metadata;

      executeClientQuery({
        projectId,
        datasetId,

        startTableName,
        endTableName,

        limit: 100,
      }).then((r) => setClientQueryResult(r));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTableName, endTableName]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 dark:text-gray-400 justify-end">
      <div className="lg:col-start-3 rounded-lg dark:border-gray-600">
        <Datepicker
          value={dateRange}
          onChange={handleValueChange}
          showShortcuts={true}
          maxDate={dayjs().add(1, "day").toDate()}
        />
      </div>

      <div className="col-span-3">
        <CVRTable
          rows={clientQueryResult}
          onShowMoreClick={() => {}}
          showMore={false}
          showColumns={{
            total_purchases: true,
            purchases_with_service: true,
          }}
        />
      </div>
    </div>
  );
}
