import { BigQuery } from "@google-cloud/bigquery";
import { getGCPCredentials } from "@/utils/getGCPCredentials";

export function getBigQueryClient({ projectId }: { projectId: string }) {
  const { credentials, projectId: envProjectId } = getGCPCredentials();
  
  return new BigQuery({
    projectId: projectId || envProjectId,
    credentials,
    retryOptions: {
      retryDelayMultiplier: 2,
      totalTimeout: 90000, // 90 seconds total including retries
      maxRetries: 3
    },
    queryOptions: {
      maximumBytesBilled: "1000000000", // 1GB
      useQueryCache: true,
      priority: "INTERACTIVE"
    }
  });
}