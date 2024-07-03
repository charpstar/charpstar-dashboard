import type { SupabaseClient } from "@supabase/supabase-js";
import { type TDatasets } from "../BigQuery/clientQueries";

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getUserWithMetadata(supabase: SupabaseClient) {
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: metadata, error } = await supabase
    .from("profiles")
    .select(
      "projectId:projectid, datasetId:datasetid, monitoredSince: monitoredsince, name",
    )
    .eq("id", user.id)
    .single();

  if (error) return null;

  return {
    ...user,
    metadata: metadata as {
      projectId: string;
      datasetId: TDatasets;
      monitoredSince: string;
      name: string;
    },
  };
}
