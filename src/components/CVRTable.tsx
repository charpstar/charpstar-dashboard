import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

// AR Sessions => AR_Click
// 3D Sessions => 3D_Click
export default function CVRTable({
  rows,
  showMore,
  onShowMoreClick,
}: {
  rows: {
    product_name: string;
    arSessionsCount: number;
    threeDSessionsCount: number;
    CVR: {
      default: string;
      charpstAR: string;
    };
  }[];
  showMore: boolean;
  onShowMoreClick: () => void;
}) {
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
        </TableRow>
      </TableHead>

      <TableBody className="text-white">
        {rows.map((row, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="w-15 whitespace-normal">{row.product_name}</div>
            </TableCell>
            <TableCell className="text-right">{row.arSessionsCount}</TableCell>
            <TableCell className="text-right">
              {row.threeDSessionsCount}
            </TableCell>
            <TableCell className="text-right">{row.CVR.default}</TableCell>
            <TableCell className="text-right">{row.CVR.charpstAR}</TableCell>
          </TableRow>
        ))}

        {showMore && (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              <button
                className="text-tremor-default text-tremor-content underline"
                type="button"
                onClick={onShowMoreClick}
              >
                Show more
              </button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
