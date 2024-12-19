import type { BigQuery, Job } from "@google-cloud/bigquery";
import type { BigQueryMetadata, BigQueryOptions } from "@/types/bigquery";

export interface PaginationOptions {
  pageSize?: number;
  pageToken?: string | null;
  timeoutMs?: number;
}

export interface QueryResult {
  rows: unknown[];
  nextPageToken: string | null;
  totalRows: string | null;
}

export async function executePagedQuery(
  client: BigQuery,
  query: string,
  options: PaginationOptions = {}
): Promise<QueryResult> {
  const {
    pageSize = 1000,
    pageToken = null,
    timeoutMs = 60000
  } = options;

  try {
    const jobResponse = await client.createQueryJob({
      query,
      maximumBytesBilled: "100000000000", // 1GB limit
      jobTimeoutMs: timeoutMs,
      useLegacySql: false
    });

    const job: Job = jobResponse[0];

    const queryOptions: BigQueryOptions = {
      maxResults: pageSize,
      timeoutMs
    };

    if (pageToken) {
      queryOptions.pageToken = pageToken;
    }

    const [rows, metadata] = await job.getQueryResults(queryOptions);

    const queryMetadata = metadata as BigQueryMetadata;

    return {
      rows: rows || [],
      nextPageToken: queryMetadata?.pageToken || null,
      totalRows: queryMetadata?.totalRows || null
    };
  } catch (error) {
    console.error("Error executing paged query:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown query error");
  }
}