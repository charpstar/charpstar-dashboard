import { redirect } from "next/navigation";

import AppLayout from "@/components/AppLayout";
import { createClient } from "@/utils/supabase/server";
import { getUser, getUserWithMetadata } from "@/utils/supabase/getUser";
import { UserProvider } from "@/contexts/UserContext";

export default async function ProtectedLayout({
  children,
}: React.PropsWithChildren) {
  const supabase = createClient();

  const user = await getUser(supabase);
  if (!user) return redirect("/login");

  const userWithData = await getUserWithMetadata(supabase);
  if (!userWithData) return redirect("/no-data");

  return (
    <AppLayout>
      <UserProvider user={userWithData}>{children}</UserProvider>
    </AppLayout>
  );
}
