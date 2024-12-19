export interface PaginatedResponse<T> {
  data: T[];
  nextPageToken: string | null;
  totalRows: string | null;
}

export interface PaginationParams {
  pageToken?: string | null;
  pageSize?: number;
}