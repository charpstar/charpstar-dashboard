import { redirect } from "next/navigation";

import AppLayout from "@/components/AppLayout";
import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

export default async function ProtectedLayout({
  children,
}: React.PropsWithChildren) {
  const supabase = createClient();
  const user = await getUserWithMetadata(supabase);

  if (!user) return redirect("/login");

  return <AppLayout>{children}</AppLayout>;
}
