"use client";

import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { type executeClientQuery } from "@/utils/BigQuery/CVR";
import { cn } from "@/lib/utils";

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

export default function CVRTable({
  showColumns,
  showPaginationControls = true,
  isLoading,
  data,
  showSearch = false,
}: CVRTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<Row>[]>(() => {
    const cols: ColumnDef<Row>[] = [
      {
        accessorKey: "product_name",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  Product Name
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>The name of the product</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: "total_button_clicks",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  Total Sessions
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Total AR and 3D Button Clicks</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("total_button_clicks")}</div>
        ),
      },
      {
        accessorKey: "default_conv_rate",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  CVR (Default)
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Default Conversion Rate of the Product</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("default_conv_rate")}%</div>
        ),
      },
      {
        accessorKey: "product_conv_rate",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  CVR (CharpstAR)
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Conversion Rate of the product of users who have clicked either the AR or 3D Buttons
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("product_conv_rate")}%</div>
        ),
      },
    ];

    if (showColumns.ar_sessions) {
      cols.splice(1, 0, {
        accessorKey: "AR_Button_Clicks",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  AR Sessions
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Total AR Button Clicks</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("AR_Button_Clicks")}</div>
        ),
      });
    }

    if (showColumns._3d_sessions) {
      cols.splice(1, 0, {
        accessorKey: "_3D_Button_Clicks",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  3D Sessions
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Total 3D Button Clicks</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("_3D_Button_Clicks")}</div>
        ),
      });
    }

    if (showColumns.purchases_with_service) {
      cols.push({
        accessorKey: "purchases_with_service",
        header: ({ column }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="w-full justify-between gap-2"
                >
                  Purchases with AR/3D
                  {column.getIsSorted() === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Total Purchases of the product by users who have clicked either the AR or 3D Buttons
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("purchases_with_service")}</div>
        ),
      });
    }

    return cols;
  }, [showColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[400px] w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {showSearch && (
          <div className="flex items-center py-4">
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {showPaginationControls && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}