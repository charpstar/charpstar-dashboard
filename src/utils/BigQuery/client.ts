import { BigQuery } from "@google-cloud/bigquery";
import { getGCPCredentials } from "@/utils/getGCPCredentials";

export function getBigQueryClient({ projectId }: { projectId: string }) {
  const { credentials, projectId: envProjectId } = getGCPCredentials();
  
  return new BigQuery({
    projectId: projectId || envProjectId,
    credentials,
    // Add timeout and retry settings
    timeout: 60000, // 60 seconds
    retryOptions: {
      retryDelayMultiplier: 2,
      totalTimeout: 90000, // 90 seconds total including retries
      maxRetries: 3
    }
  });
}
