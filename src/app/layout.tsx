import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Inter as FontSans } from "next/font/google";
import { Next13NProgress } from "nextjs13-progress";
import { cn } from "@/lib/utils";

import { createClient } from "@/utils/supabase/server";
import { getUserWithMetadata } from "@/utils/supabase/getUser";
import { UserProvider } from "@/contexts/UserContext";
import Providers from "./Providers";

import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CharpstAR Client Dashboard",
  description:
    "Explore CharpstAR's client platform to access detailed statistics of our AR and 3D services. Empower your business with advanced features to view, QA, and render your products in stunning 3D, ensuring top-quality digital experiences. ",
  icons: {
    icon: "/public/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const userWithData = await getUserWithMetadata(supabase);
  if (!userWithData) return redirect("/no-data");

  return (
    <html lang="en" className="antialiased">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Next13NProgress height={5} />
        <Providers>
          <UserProvider user={userWithData}>{children}</UserProvider>
        </Providers>
      </body>
    </html>
  );
}
