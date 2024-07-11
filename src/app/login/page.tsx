"use client";

import { createClient } from "@/utils/supabase/client";
import LoginPage from "@/components/Auth/LoginPage";

export default function Login() {
  const supabase = createClient();

  const handleLoginAction = async (formData: FormData) => {
    const rawFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(rawFormData);
    if (error) alert(error.message);
  };

  return <LoginPage formAction={handleLoginAction} />;
}
