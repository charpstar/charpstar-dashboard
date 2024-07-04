import { BigQuery } from "@google-cloud/bigquery";
import { GlobalRef } from "@/utils/GlobalRef";
import fs from "fs";
import path from "path";

export function getBigQueryClient({ projectId }: { projectId: string }) {
  
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT) {
    const credentialsPath = path.join(__dirname, "google-credentials.json");
    fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  }

  return new BigQuery({
    projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
}
