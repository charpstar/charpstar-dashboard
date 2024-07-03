"use client";

import { useFormStatus } from "react-dom";

export default function PendingFormLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  if (pending)
    return (
      <div className="flex h-8 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    );

  return children;
}
