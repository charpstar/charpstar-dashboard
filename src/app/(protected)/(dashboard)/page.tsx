import React from "react";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";
import { redirect } from "next/navigation";

import UserLayout from "../UserLayout";
import Dashboard from "./Dashboard";

export default async function Index() {
  const supabase = createClient();
  const user = await getUserWithMetadata(supabase);

  if (!user || !user.metadata) {
    redirect("/no-data");
  }

  return (
    <UserLayout>
      <Dashboard dateRangePickerMinDate={user.metadata.monitoredSince} />
    </UserLayout>
  );
}