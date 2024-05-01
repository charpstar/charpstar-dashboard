import React from "react";

import AppSide from "./AppSide";
import AppNav from "./AppNav";

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppNav />
      <AppSide />

      {children}
    </>
  );
}
