import { createClient } from "@/utils/supabase/server";
import { UserProvider } from "./UserContext";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

export default async function UserProviderSC({
  children,
}: React.PropsWithChildren) {
  const supabase = createClient();
  const userWithData = await getUserWithMetadata(supabase);

  return <UserProvider user={userWithData}>{children}</UserProvider>;
}
