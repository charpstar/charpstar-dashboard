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
  onShowMoreClick,
}: {
  rows: {
    product_name: string;
    arSessionsCount: number;
    threeDSessionsCount: number;
    CVR: {
      default: number;
      charpstAR: number;
    };
  }[];
  onShowMoreClick: () => void;
}) {
  return (
    <Table className="table-fixed">
      {/* <div className="mx-auto max-w-2xl"></div> */}
      <TableHead>
        <TableRow>
          <TableHeaderCell className="w-3">Product name</TableHeaderCell>
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
            <TableCell className="w-3 break-words">
              {row.product_name}
            </TableCell>
            <TableCell className="text-right">{row.arSessionsCount}</TableCell>
            <TableCell className="text-right">
              {row.threeDSessionsCount}
            </TableCell>
            <TableCell className="text-right">{row.CVR.default}</TableCell>
            <TableCell className="text-right">{row.CVR.charpstAR}</TableCell>
          </TableRow>
        ))}

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
      </TableBody>
    </Table>
  );
}
