import Link from "next/link";
import { redirect } from "next/navigation";

import { UserCircleIcon } from "@heroicons/react/24/outline";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";

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
        className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
        id="user-menu-button"
        aria-expanded="false"
        data-dropdown-toggle="dropdown"
      >
        <span className="sr-only">Open user menu</span>

        <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400" />
      </button>
    </form>
  ) : (
    <Link href="/login">Login</Link>
  );
}
