import AppLayout from "@/components/AppLayout";

export default function ProtectedLayout({ children }: React.PropsWithChildren) {
  return <AppLayout>{children}</AppLayout>;
}
