import type { SupabaseClient } from "@supabase/supabase-js";
import { type TDatasets } from "../BigQuery/clientQueries";

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) console.log("error", error);

  return user;
}

export async function getUserMetadata(
  supabase: SupabaseClient,
  user_id: string,
) {
  const { data: metadata, error } = await supabase
    .from("profiles")
    .select(
      "projectId:projectid, datasetId:datasetid, monitoredSince: monitoredsince, name",
    )
    .eq("id", user_id)
    .single();

  if (error) {
    if (error) console.log("error", error);
    return null;
  }

  return metadata as {
    projectId: string;
    datasetId: TDatasets;
    monitoredSince: string;
    name: string;
  };
}

export async function getUserWithMetadata(supabase: SupabaseClient) {
  const user = await getUser(supabase);
  if (!user) return null;

  const metadata = await getUserMetadata(supabase, user.id);
  if (!metadata) return null;

  return {
    ...user,
    metadata,
  };
}
