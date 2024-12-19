import type { Query } from "@google-cloud/bigquery";

export interface BigQueryMetadata {
  pageToken?: string;
  totalRows?: string;
}

export interface BigQueryJobMetadata {
  jobComplete: boolean;
  totalRows: string;
  pageToken?: string;
  totalBytesProcessed?: string;
}

export interface BigQueryOptions extends Partial<Query> {
  maxResults?: number;
  pageToken?: string | undefined;
  timeoutMs?: number;
}