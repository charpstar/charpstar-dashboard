import CVRTable from "@/components/CVRTable";
import { useClientQuery } from "@/queries/useClientQuery";

export default function DashboardCVRTable({
  startTableName,
  endTableName,
}: {
  startTableName: string;
  endTableName: string;
}) {
  const { clientQueryResult, isQueryLoading } = useClientQuery({
    startTableName,
    endTableName,
    limit: 10,
  });

  return (
    <CVRTable
      isLoading={isQueryLoading}
      showPaginationControls={false}
      data={clientQueryResult}
      showColumns={{
        total_purchases: false,
        purchases_with_service: false,
        _3d_sessions: false,
        ar_sessions: false,
        avg_session_duration_seconds : false,
      }}
    />
  );
}
