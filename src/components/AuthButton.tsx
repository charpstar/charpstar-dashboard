import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";
import PendingFormLoader from "./PendingFormLoader";

export default async function AuthButton() {
  const supabase = createClient();
  const user = await getUserWithMetadata(supabase);

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();

    return redirect("/login");
  };

  return user ? (
    <form action={signOut}>
      <button
        type="submit"
        className="flex mx-3 text-sm  rounded-full md:mr-0 focus:ring-4 "
        id="user-menu-button"
        aria-expanded="false"
        data-dropdown-toggle="dropdown"
      >
        <span className="sr-only">Sign out</span>

        <div className="flex h-8 items-center justify-center">
          <PendingFormLoader>
            <ArrowRightEndOnRectangleIcon className="h-6 w-6 rounded-full text-gray-400" />
            </PendingFormLoader>
            <div className="text-gray-400">  Logout</div>
        
        </div>
      </button>
    </form>
  ) : (
    <Link href="/login">Login</Link>
  );
}
