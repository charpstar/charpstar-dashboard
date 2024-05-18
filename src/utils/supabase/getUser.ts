import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserWithMetadata(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: metadata, error } = await supabase
    .from("profiles")
    .select("projectId:projectid, datasetId:datasetid")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return { ...user, metadata };
}
