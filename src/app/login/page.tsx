"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import LoginPage from "@/components/LoginPage";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  const handleLoginAction = async (formData: FormData) => {
    const rawFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(rawFormData);
    if (error) alert(error.message);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push("/");
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/");
    });

    return () => {
      subscription?.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoginPage formAction={handleLoginAction} />;
}
