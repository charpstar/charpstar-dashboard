"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authListener: ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"];

    async function initialize() {
      try {
        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            setIsAuthenticated(true);
            router.push("/");
          }
          setIsLoading(false);
        }

        // Setup auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;

          if (event === "SIGNED_IN" && session) {
            setIsAuthenticated(true);
            router.push("/");
          } else if (event === "SIGNED_OUT") {
            setIsAuthenticated(false);
          }
        });

        authListener = subscription;
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
      authListener?.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  return {
    isLoading,
    isAuthenticated,
    signIn,
  };
}