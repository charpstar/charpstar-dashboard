import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Next13NProgress } from "nextjs13-progress";

const jost = Jost({ subsets: ["latin"] });
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white dark:bg-slate-950 antialiased">
      <body className={`${jost.className}`}>
        <Next13NProgress height={5} />
        {children}
      </body>
    </html>
  );
}
