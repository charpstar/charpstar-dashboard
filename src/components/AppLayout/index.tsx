import React, { Suspense } from "react";
import AppSide from "./AppSide";

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <AppSide />
      <main className="ml-64">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}