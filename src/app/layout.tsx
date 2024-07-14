import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Next13NProgress } from "nextjs13-progress";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

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
  return (
    <html lang="en" className="antialiased">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Next13NProgress height={5} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
