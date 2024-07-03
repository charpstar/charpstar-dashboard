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
      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
    );

  return children;
}
