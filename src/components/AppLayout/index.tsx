"use client";

import React from "react";
import { Disclosure } from "@headlessui/react";

import AppMenu from "./AppMenu";
import MobileMenu from "./MobileMenu";

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => <AppMenu mobileMenu={<MobileMenu open={open} />} />}
      </Disclosure>

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">{children}</div>
    </>
  );
}
