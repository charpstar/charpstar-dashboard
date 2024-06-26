import React from "react";

import AppSide from "./AppSide";
import AppNav from "./AppNav";

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppNav />
      <AppSide />

      <main className="p-4 md:ml-64 h-auto pt-20">{children}</main>
    </>
  );
}
