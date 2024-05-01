"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function Login() {
  const handleLoginClick = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });

    console.log(data, error);
  };

  return (
    <div>
      <Link href="/">Back</Link>

      <form action={handleLoginClick}>
        <button type="submit">Sign In with Google</button>
      </form>
    </div>
  );
}
