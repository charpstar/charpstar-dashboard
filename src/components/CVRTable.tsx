import { executeClientQuery } from "@/utils/BigQuery/CVR";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { TableSkeleton } from "./Skeleton";

interface CVRTableProps {
  rows: Awaited<ReturnType<typeof executeClientQuery>> | null;

  showColumns: {
    total_purchases: boolean;
    purchases_with_service: boolean;
  };
}

// AR Sessions => AR_Click
// 3D Sessions => 3D_Click
export default function CVRTable({ rows, showColumns }: CVRTableProps) {
  const isLoading = !rows;

  return (
    <Table className="table-fixed">
      <TableHead>
        <TableRow>
          <TableHeaderCell className="w-15">Product name</TableHeaderCell>
          <TableHeaderCell className="text-right">AR Sessions</TableHeaderCell>
          <TableHeaderCell className="text-right">3D Sessions</TableHeaderCell>
          <TableHeaderCell className="text-right">CVR</TableHeaderCell>
          <TableHeaderCell className="text-right">
            CVR (CharpstAR)
          </TableHeaderCell>

          <TableHeaderCell className="text-right">Total Clicks</TableHeaderCell>

          {showColumns.total_purchases && (
            <TableHeaderCell className="text-right">
              Total Purchases
            </TableHeaderCell>
          )}

          {showColumns.purchases_with_service && (
            <TableHeaderCell className="text-right">
              Purchase with Service
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHead>

      <TableBody className="text-white">
        {isLoading && (
          <TableRow>
            <TableCell colSpan={8}>
              <TableSkeleton />
            </TableCell>
          </TableRow>
        )}

        {rows && rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        )}

        {rows &&
          rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="w-15 whitespace-normal">{row.product_name}</div>
              </TableCell>
              <TableCell className="text-right">
                {row.AR_Button_Clicks}
              </TableCell>
              <TableCell className="text-right">
                {row._3D_Button_Clicks}
              </TableCell>
              <TableCell className="text-right">{row.CVR.default}</TableCell>
              <TableCell className="text-right">{row.CVR.charpstAR}</TableCell>
              <TableCell className="text-right">
                {row.total_button_clicks}
              </TableCell>

              {showColumns.total_purchases && (
                <TableCell className="text-right">
                  {row.total_purchases}
                </TableCell>
              )}

              {showColumns.purchases_with_service && (
                <TableCell className="text-right">
                  {row.purchases_with_service}
                </TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
