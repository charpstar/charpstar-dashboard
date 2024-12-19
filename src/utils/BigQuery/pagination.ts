import type { BigQuery, Job } from "@google-cloud/bigquery";

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
    // Create query job with proper typing
    const jobResponse = await client.createQueryJob({
      query,
      maximumBytesBilled: "10000000000", // 1GB limit
      timeoutMs,
      useLegacySql: false
    });

    // Extract the job from the response
    const job: Job = jobResponse[0];

    // Get query results with pagination
    const [rows, metadata] = await job.getQueryResults({
      maxResults: pageSize,
      pageToken: pageToken || undefined,
      timeoutMs
    });

    return {
      rows: rows || [],
      nextPageToken: metadata?.pageToken || null,
      totalRows: metadata?.totalRows || null
    };
  } catch (error) {
    console.error("Error executing paged query:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown query error");
  }
}