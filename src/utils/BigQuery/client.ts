import { BigQuery } from "@google-cloud/bigquery";
import { getGCPCredentials } from "@/utils/getGCPCredentials"; // Add this import

export function getBigQueryClient({ projectId }: { projectId: string }) {
  const { credentials, projectId: envProjectId } = getGCPCredentials();
  
  return new BigQuery({
    projectId: projectId || envProjectId,
    credentials,
  });
}