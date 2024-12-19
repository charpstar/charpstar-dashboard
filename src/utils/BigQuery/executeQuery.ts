// utils/BigQuery/executeQuery.ts - New central execution file
import { BigQuery } from "@google-cloud/bigquery";
import type { BigQueryResponse } from "./types";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 180000; // 3 minutes
const BYTES_LIMIT = 6000000000; // 6GB

async function executeQueryWithRetry(
  bigqueryClient: BigQuery,
  options: any,
  attempt = 1
): Promise<any> {
  try {
    const [job] = await bigqueryClient.createQueryJob({
      ...options,
      timeoutMs: TIMEOUT_MS,
      maximumBytesBilled: BYTES_LIMIT,
    });
    const [response] = await job.getQueryResults({
      timeoutMs: TIMEOUT_MS,
    });
    return response;
  } catch (error) {
    if (attempt === MAX_RETRIES) throw error;
    
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return executeQueryWithRetry(bigqueryClient, options, attempt + 1);
  }
}

export async function executeBigQuery<T = any>(
  bigqueryClient: BigQuery, 
  query: string, 
  projectId: string
): Promise<T> {
  const options = {
    query,
    projectId,
  };
  
  return executeQueryWithRetry(bigqueryClient, options);
}