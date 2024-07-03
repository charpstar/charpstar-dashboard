import React from "react";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

import UserLayout from "../UserLayout";
import Dashboard from "./Dashboard";

export default async function Index() {
  const supabase = createClient();
  const user = (await getUserWithMetadata(supabase))!;

  return (
    <UserLayout>
      <Dashboard dateRangePickerMinDate={user.metadata.monitoredSince} />
    </UserLayout>
  );
}
