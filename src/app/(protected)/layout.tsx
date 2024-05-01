import { redirect } from "next/navigation";

import AppLayout from "@/components/AppLayout";
import { createClient } from "@/utils/supabase/server";

export default async function ProtectedLayout({
  children,
}: React.PropsWithChildren) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  return <AppLayout>{children}</AppLayout>;
}
