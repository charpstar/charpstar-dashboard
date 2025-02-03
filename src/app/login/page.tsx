"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/components/LoginPage";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { isLoading, isAuthenticated, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
      router.refresh();
    }
  }, [isAuthenticated, router]);

  const handleLoginAction = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      await signIn(email, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <LoginPage formAction={handleLoginAction} />;
}