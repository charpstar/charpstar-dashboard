"use client";

import { useRouter } from "next/navigation";

import LoginPage from "@/components/Auth/LoginPage";
import { loginAction } from "./loginAction";

export default function Login() {
  const router = useRouter();

  const handleLoginAction = async (formData: FormData) => {
    const rawFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await loginAction(rawFormData);
      router.push("/");
    } catch (error) {
      const message = String(error) || "Unknown error occurred.";
      if (error) alert(message);
    }
  };

  return <LoginPage formAction={handleLoginAction} />;
}
