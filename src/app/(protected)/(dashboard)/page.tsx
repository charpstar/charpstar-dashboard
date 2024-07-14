import React from "react";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import Dashboard from "./dashboard";

export default async function Index() {
  const supabase = createClient();
  const user = (await getUserWithMetadata(supabase))!;

  return <Dashboard />;
}
