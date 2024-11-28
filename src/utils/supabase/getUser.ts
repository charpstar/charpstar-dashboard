import type { SupabaseClient } from "@supabase/supabase-js";
import { type TDatasets } from "../BigQuery/clientQueries";

export async function getUser(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function getUserWithMetadata(supabase: SupabaseClient) {
  try {
    const user = await getUser(supabase);
    if (!user) return null;

    const { data: metadata, error } = await supabase
      .from("profiles")
      .select(
        "projectId:projectid, datasetId:datasetid, monitoredSince:monitoredsince, name"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error getting user metadata:", error);
      return null;
    }

    if (!metadata) {
      console.error("No metadata found for user");
      return null;
    }

    return {
      ...user,
      metadata: metadata as {
        projectId: string;
        datasetId: TDatasets;
        monitoredSince: string;
        name: string;
      },
    };
  } catch (error) {
    console.error("Error in getUserWithMetadata:", error);
    return null;
  }
}