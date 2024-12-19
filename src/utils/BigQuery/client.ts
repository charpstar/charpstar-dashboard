// utils/BigQuery/client.ts
import { BigQuery } from "@google-cloud/bigquery";
import { getGCPCredentials } from "@/utils/getGCPCredentials";

export function getBigQueryClient({ projectId }: { projectId: string }) {
  const { credentials, projectId: envProjectId } = getGCPCredentials();
  
  return new BigQuery({
    projectId: projectId || envProjectId,
    credentials,
    retryOptions: {
      retryDelayMultiplier: 2,
      totalTimeout: 180000, // 3 minutes
    },
  });
}