import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    align?: string;
    width?: string;
    tooltip?: string;
  }
}
