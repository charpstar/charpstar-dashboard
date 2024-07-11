"use server";

import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";

export async function loginAction(values: {
  email: string;
  password: string;
}): Promise<User> {
  const { email, password } = values;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  const user = data?.user;

  if (!user) throw new Error("User not found");

  return user;
}
