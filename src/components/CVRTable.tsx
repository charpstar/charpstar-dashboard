"use client";

import React from "react";

import {
  type ColumnDef,
  createColumnHelper,
  filterFns,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
} from "@remixicon/react";

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@tremor/react";

import { type executeClientQuery } from "@/utils/BigQuery/CVR";
import { classNames } from "@/utils/uiUtils";
import { Button } from "./Button";
import { TableSkeleton } from "./Skeleton";
import { Tooltip } from "./TremorRawTooltip";

interface CVRTableProps {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof executeClientQuery>>;

  showColumns: {
    total_purchases: boolean;
    purchases_with_service: boolean;
    _3d_sessions: boolean;
    ar_sessions: boolean;
    avg_session_duration_seconds: boolean;
  };

  showPaginationControls?: boolean;
  showSearch?: boolean;
}

type Row = CVRTableProps["data"][number];
const columnHelper = createColumnHelper<Row>();

export default function CVRTable({
  showColumns,
  showPaginationControls = true,
  isLoading,
  data,
  showSearch = false,
}: CVRTableProps) {
  const columns = [
    {
      header: "Product Name",
      accessorKey: "product_name",
      enableSorting: false,
      filterFn: filterFns.includesString,
      meta: {
        align: "text-left",
        width: "w-15 whitespace-normal",
        tooltip: "The name of the product",
      },
    },
    {
      header: "Total Sessions (CharpstAR)",
      accessorKey: "total_button_clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Total AR and 3D Button Clicks",
      },
    },
    columnHelper.accessor("default_conv_rate", {
      cell: (info) => info.getValue() + "%",
      header: "CVR (Default)",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Default Conversion Rate of the Product",
      },
    }),
    columnHelper.accessor("product_conv_rate", {
      cell: (info) => info.getValue() + "%",
      header: "CVR (CharpstAR)",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Conversion Rate of the product of users who have clicked either the AR or 3D Buttons",
      },
    }),

    columnHelper.accessor("avg_session_duration_seconds", {
      cell: (info) => info.getValue() + " seconds",
      header: "Avg Session Duration",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "The product page average session time in seconds",
      },
    }),

    columnHelper.accessor("avg_combined_session_duration", {
      cell: (info) => info.getValue() + " seconds",
      header: "Avg Session Duration (CharpstAR)",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "The average session duration in seconds of users who have visited a product page and clicked either the AR or 3D Button",
      },
    }),
  ] as ColumnDef<Row, unknown>[];

  if (showColumns.ar_sessions)
    columns.splice(1, 0, {
      header: "AR Sessions",
      accessorKey: "AR_Button_Clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Total AR Button Clicks",
      },
    });

  if (showColumns._3d_sessions)
    columns.splice(1, 0, {
      header: "3D Sessions",
      accessorKey: "_3D_Button_Clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Total 3D Button Clicks",
      },
    });

  if (showColumns.total_purchases)
    columns.push({
      header: "Total Purchases",
      accessorKey: "total_purchases",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Total Purchases of the product",
      },
    });

  if (showColumns.purchases_with_service)
    columns.push({
      header: "Total Purchases (CharpstAR)",
      accessorKey: "purchases_with_service",
      enableSorting: true,
      meta: {
        align: "text-right",
        tooltip: "Total Purchases of the product by users who have clicked either the AR or 3D Buttons",
      },
    });



  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    initialState: {
      sorting: [
        {
          id: "default_conv_rate",
          desc: true,
        },
      ],

      pagination: {
        pageSize: 15,
      },
    },
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <Card>
      {showSearch && ( // Conditionally render the search bar
        <TextInput
          placeholder="Search..."
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="mb-5"
        />
      )}
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-tremor-border dark:border-dark-tremor-border"
            >
              {headerGroup.headers.map((header) => (
                <TableHeaderCell
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : "",
                    "px-0.5 py-1.5",
                  )}
                  tabIndex={header.column.getCanSort() ? 0 : -1}
                >
                  <Tooltip
                    side="top"
                    content={header.column.columnDef.meta?.tooltip}
                  >
                    <div
                      className={classNames(
                        header.column.columnDef.enableSorting === true
                          ? "flex items-center justify-between gap-1 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
                          : header.column.columnDef.meta?.align,
                        " rounded-tremor-default px-1.5 py-1.5 text-xs",
                        header.column.columnDef.meta?.width,
                        "text-tremor-content-muted dark:text-dark-tremor-content-muted",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() ? (
                        <div className="-space-y-2">
                          <RiArrowUpSLine
                            className={classNames(
                              "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
                              header.column.getIsSorted() === "desc"
                                ? "opacity-30"
                                : "",
                            )}
                            aria-hidden={true}
                          />
                          <RiArrowDownSLine
                            className={classNames(
                              "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
                              header.column.getIsSorted() === "asc"
                                ? "opacity-30"
                                : "",
                            )}
                            aria-hidden={true}
                          />
                        </div>
                      ) : null}
                    </div>
                  </Tooltip>
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={classNames(
                    cell.column.columnDef.meta?.align,
                    cell.column.columnDef.meta?.width,
                    "text-tremor-content-strong dark:text-dark-tremor-content-strong text-sm p-3",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPaginationControls && (
        <div className="mt-10 flex items-center justify-between">
          <p className="text-tremor-default tabular-nums text-tremor-content dark:text-dark-tremor-content">
            Page{" "}
            <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{`${
              table.getState().pagination.pageIndex + 1
            }`}</span>{" "}
            of
            <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              {" "}
              {`${table.getPageCount()}`}
            </span>
          </p>
          <div className="inline-flex items-center rounded-tremor-full shadow-tremor-input ring-1 ring-inset ring-tremor-ring dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous</span>
              <RiArrowLeftSLine
                className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
                aria-hidden={true}
              />
            </Button>
            <span
              className="h-5 border-r border-tremor-border dark:border-dark-tremor-border"
              aria-hidden={true}
            />
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next</span>
              <RiArrowRightSLine
                className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
                aria-hidden={true}
              />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
