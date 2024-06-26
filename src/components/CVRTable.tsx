"use client";

import React from "react";

import {
  flexRender,
  getCoreRowModel,
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
} from "@tremor/react";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import { classNames } from "@/utils/uiUtils";
import { Button } from "./Button";
import { TableSkeleton } from "./Skeleton";

interface CVRTableProps {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof executeClientQuery>>;

  showColumns: {
    total_purchases: boolean;
    purchases_with_service: boolean;
  };
}

export default function CVRTable({
  showColumns,
  isLoading,
  data,
}: CVRTableProps) {
  const columns = [
    {
      header: "Product Name",
      accessorKey: "product_name",
      enableSorting: false,
      meta: {
        align: "text-left",
      },
    },
    {
      header: "AR Sessions",
      accessorKey: "AR_Button_Clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    },
    {
      header: "3D Sessions",
      accessorKey: "_3D_Button_Clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    },
    {
      header: "CVR",
      accessorKey: "default_conv_rate",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    },
    {
      header: "CVR (CharpstAR)",
      accessorKey: "product_conv_rate",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    },
    {
      header: "Total Clicks",
      accessorKey: "total_button_clicks",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    },
  ];

  if (showColumns.total_purchases)
    columns.push({
      header: "Total Purchases",
      accessorKey: "total_purchases",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    });

  if (showColumns.purchases_with_service)
    columns.push({
      header: "Purchase with Service",
      accessorKey: "purchases_with_service",
      enableSorting: true,
      meta: {
        align: "text-right",
      },
    });

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      sorting: [
        {
          id: "default_conv_rate",
          desc: true,
        },
      ],

      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <Card>
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
                  <div
                    className={classNames(
                      header.column.columnDef.enableSorting === true
                        ? "flex items-center justify-between gap-2 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
                        : header.column.columnDef.meta?.align,
                      " rounded-tremor-default px-3 py-1.5",
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
                  className={classNames(cell.column.columnDef.meta?.align)}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </Card>
  );
}
